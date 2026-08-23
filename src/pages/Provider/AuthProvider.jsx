import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";

export const AuthProvider = ({ children }) => {

  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  /* ======================
        LOGIN
  ====================== */
  const login = async ({ email, password }) => {

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/login`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const responseData = res.data;
    const dataBlock = Array.isArray(responseData?.data)
      ? responseData.data[0]
      : responseData?.data;

    const accessToken =
      dataBlock?.accessToken          // Shape A / B
      ?? dataBlock?.tokens?.accessToken // Shape D
      ?? responseData?.accessToken;    // Shape C

    const refreshToken =
      dataBlock?.refreshToken
      ?? dataBlock?.tokens?.refreshToken
      ?? responseData?.refreshToken;

    // Also extract the role — it may live directly on the data block or inside the user object
    const role =
      dataBlock?.role
      ?? dataBlock?.user?.role
      ?? responseData?.role
      ?? null;

    const userData = {
      ...(dataBlock?.user ?? responseData?.user ?? { email }),
      // Ensure role is always available on the user object
      ...(role ? { role } : {}),
    };

    if (!accessToken) {
      throw new Error("Login succeeded but no access token was returned. Check console for full response.");
    }

    // Store tokens in localStorage — no encoding issues unlike cookies
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    // Persist role so guards can read it synchronously on session restore
    if (role) {
      localStorage.setItem("role", role);
    }

    // Store tokens in cookies as requested for backend cookie-based authentication
    document.cookie = `accessToken=${accessToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax;`;
    if (refreshToken) {
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax;`;
    }

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    return responseData;
  };


  
        // LOGOUT
 
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    // Clear cookies as requested
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;";
    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;";

    setUser(null);
  };

  /* ======================
        RESTORE SESSION
  ====================== */
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedRole = localStorage.getItem("role");
    const savedToken = localStorage.getItem("accessToken");

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);

        if (savedRole) {
          // Role already stored — restore instantly
          setUser({ ...parsed, role: savedRole });
          setLoading(false);
        } else if (savedToken) {
          // Role missing (pre-existing session) — fetch it from the API
          axios
            .get(`${import.meta.env.VITE_API_URL}/api/user/getMe`, {
              headers: {
                Authorization: `Bearer ${savedToken}`,
                "ngrok-skip-browser-warning": "true",
              },
            })
            .then((res) => {
              const apiRole = res.data?.data?.role ?? null;
              if (apiRole) {
                localStorage.setItem("role", apiRole);
                setUser({ ...parsed, role: apiRole });
              } else {
                setUser(parsed);
              }
            })
            .catch(() => {
              // API failed — just restore without role; guards will still call API themselves
              setUser(parsed);
            })
            .finally(() => {
              setLoading(false);
            });
          return; // loading will be set false in the finally above
        } else {
          setUser(parsed);
          setLoading(false);
        }
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);


  /* ======================
        CONTEXT VALUE
  ====================== */
  const authInfo = {
    user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext value={authInfo}>
      {children}
    </AuthContext>
  );
};

export const useAuth = () => useContext(AuthContext);