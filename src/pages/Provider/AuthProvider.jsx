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

    // Log the full login response so we can see its exact shape
    console.log("[login] Full response:", JSON.stringify(responseData, null, 2));

    // Try every common shape the backend might return the token in:
    //   Shape A: { data: { accessToken } }
    //   Shape B: { data: [{ accessToken }] }
    //   Shape C: { accessToken }               ← top-level
    //   Shape D: { data: { tokens: { accessToken } } }
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

    const userData = dataBlock?.user ?? responseData?.user ?? { email };

    console.log("[login] accessToken found:", accessToken ? `${accessToken.substring(0, 20)}...` : "NOT FOUND ❌");

    if (!accessToken) {
      throw new Error("Login succeeded but no access token was returned. Check console for full response.");
    }

    // Store tokens in localStorage — no encoding issues unlike cookies
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    return responseData;
  };


  /* ======================
        LOGOUT
  ====================== */
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  /* ======================
        RESTORE SESSION
  ====================== */
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
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