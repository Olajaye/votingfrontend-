import { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
//import jwt_decode from "jwt-decode";  ✅ Use default import
import { User } from "../types"; // Make sure this type includes id, email, and optionally token

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const API_BASE_URL = "http://localhost:5000/api";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

function decodeJwtPayload<T = any>(token: string): T {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (e) {
    throw new Error("Invalid token");
  }
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = decodeJwtPayload<{ id: string; email: string }>(token);
        // const decoded = jwt_decode<{ id: string; email: string }>(token);
        setUser({ id: decoded.id, email: decoded.email, token });
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      const token = res.data.data.token;
      localStorage.setItem("token", token);

      // const decoded = jwt_decode<{ id: string; email: string }>(token);
      const decoded = decodeJwtPayload<{ id: string; email: string }>(token);
      setUser({ id: decoded.id, email: decoded.email, token });
    } catch (error) {
      console.error("Login error:", error);
      throw error; // Allow handling in component
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password,
      });
      const token = res.data.data.token;
      localStorage.setItem("token", token);

      // const decoded = jwt_decode<{ id: string; email: string }>(token);
      const decoded = decodeJwtPayload<{ id: string; email: string }>(token);
      setUser({ id: decoded.id, email: decoded.email, token });
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
