import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";

export const AuthProvider = ({ children }) => {

  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  /* AUTH STORAGE HELPERS
     When "Remember me" is checked  → localStorage  (survives browser close)
     When "Remember me" is unchecked → sessionStorage (cleared when tab/browser closes)
  */

  // Keys we manage in storage — centralised so they're easy to update
  const AUTH_KEYS = ["accessToken", "refreshToken", "user", "role"];

  // Clear all auth keys from a given storage object
  const clearStorage = (storage) => {
    AUTH_KEYS.forEach((key) => storage.removeItem(key));
  };

  // Save auth session to the chosen storage
  const saveSession = (storage, { accessToken, refreshToken, userData, role }) => {
    storage.setItem("accessToken", accessToken);
    if (refreshToken) storage.setItem("refreshToken", refreshToken);
    storage.setItem("user", JSON.stringify(userData));
    if (role) storage.setItem("role", role);
  };

  // Read from localStorage first; fall back to sessionStorage
  // Returns the storage object where the session lives, or null if none found
  const findActiveStorage = () => {
    if (localStorage.getItem("accessToken")) return localStorage;
    if (sessionStorage.getItem("accessToken")) return sessionStorage;
    return null;
  };


  /* LOGIN */
  const login = async ({ email, password, remember = false }) => {

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
      dataBlock?.accessToken            // Shape A / B
      ?? dataBlock?.tokens?.accessToken // Shape D
      ?? responseData?.accessToken;     // Shape C

    const refreshToken =
      dataBlock?.refreshToken
      ?? dataBlock?.tokens?.refreshToken
      ?? responseData?.refreshToken;

    if (!accessToken) {
      throw new Error("Login succeeded but no access token was returned. Check console for full response.");
    }

    // Role may live directly on the data block or inside the user object
    let role =
      dataBlock?.role
      ?? dataBlock?.user?.role
      ?? responseData?.role
      ?? null;

    // If role is missing from login response, fetch it using /api/user/getMe
    if (!role) {
      try {
        const meRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user/getMe`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        role = meRes.data?.data?.role ?? meRes.data?.role ?? null;
      } catch (err) {
        console.error("Failed to fetch user role after login", err);
      }
    }

    const userData = {
      ...(dataBlock?.user ?? responseData?.user ?? { email }),
      ...(role ? { role } : {}),
    };

    // --- Storage cleanup ---
    // Always clear both storages before saving to prevent stale session conflicts.
    // Example: user previously logged in with "Remember me", then logs in again without it.
    clearStorage(localStorage);
    clearStorage(sessionStorage);

    // --- Choose storage based on "Remember me" selection ---
    const storage = remember ? localStorage : sessionStorage;
    saveSession(storage, { accessToken, refreshToken, userData, role });

    // --- Cookies ---
    // Persistent cookie if remember=true (30 days), session cookie otherwise (no max-age)
    if (remember) {
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax;`;
      if (refreshToken) {
        document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax;`;
      }
    } else {
      // Session cookie — browser removes it when the session ends
      document.cookie = `accessToken=${accessToken}; path=/; SameSite=Lax;`;
      if (refreshToken) {
        document.cookie = `refreshToken=${refreshToken}; path=/; SameSite=Lax;`;
      }
    }

    setUser(userData);
    return responseData;
  };


  /* LOGOUT */
  const logout = () => {
    // Clear auth data from both storages so no stale session lingers
    clearStorage(localStorage);
    clearStorage(sessionStorage);

    // Expire auth cookies
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;";
    document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;";

    setUser(null);
  };


  /* RESTORE SESSION */
  useEffect(() => {
    // Check localStorage first (Remember me session); fall back to sessionStorage
    const storage = findActiveStorage();

    if (!storage) {
      // No saved session at all
      setLoading(false);
      return;
    }

    const savedUser  = storage.getItem("user");
    const savedRole  = storage.getItem("role");
    const savedToken = storage.getItem("accessToken");

    if (!savedUser) {
      setLoading(false);
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(savedUser);
    } catch {
      // Corrupted JSON — discard the whole session cleanly
      clearStorage(storage);
      setLoading(false);
      return;
    }

    if (savedRole) {
      // Role already stored — restore instantly, no API call needed
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
            storage.setItem("role", apiRole); // Persist into whichever storage we restored from
            setUser({ ...parsed, role: apiRole });
          } else {
            setUser(parsed);
          }
        })
        .catch(() => {
          // API failed — restore without role; guards will re-fetch themselves
          setUser(parsed);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setUser(parsed);
      setLoading(false);
    }
  }, []);


  /* CONTEXT VALUE */
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