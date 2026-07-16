import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("studydeck_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setStudent(res.data.student))
      .catch(() => localStorage.removeItem("studydeck_token"))
      .finally(() => setLoading(false));
  }, []);

  function loginSuccess(token, studentData) {
    localStorage.setItem("studydeck_token", token);
    setStudent(studentData);
  }

  function logout() {
    localStorage.removeItem("studydeck_token");
    setStudent(null);
  }

  return (
    <AuthContext.Provider value={{ student, loading, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
