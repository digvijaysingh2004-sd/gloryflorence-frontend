import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { AuthState, User } from "../types";
import { useNotification } from "./NotificationContext";
import api from "../services/api";

interface AuthContextProps extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined,
);

const normalizeRole = (roleStr?: string): User["role"] => {
  if (!roleStr) return "receptionist";
  const clean = roleStr.toLowerCase().replace(/[\s_-]+/g, "");
  if (clean === "superadmin") return "superadmin";
  if (clean === "admin" || clean === "clinicadmin") return "admin";
  if (clean === "physiotherapist" || clean === "therapist")
    return "physiotherapist";
  if (clean === "doctor") return "doctor";
  if (clean === "receptionist") return "receptionist";
  if (clean === "accountant") return "accountant";
  if (clean === "patient") return "patient";
  return "receptionist";
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  const { showToast } = useNotification();

  const logout = useCallback(() => {
    localStorage.removeItem("gf_auth_token");
    localStorage.removeItem("gf_auth_user");
    setState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
    showToast("Logged out successfully.", "info");
  }, [showToast]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("gf_auth_token");
      const storedUser = localStorage.getItem("gf_auth_user");

      if (token && storedUser) {
        try {
          setState({
            user: JSON.parse(storedUser),
            isAuthenticated: true,
            loading: false,
          });

          // Verify with Backend if it's not a mock token
          if (!token.startsWith("mock_")) {
            try {
              const response = await api.get("/auth/me");
              const raw = response.data?.data || response.data;
              const freshUser: User = {
                id: String(raw.id),
                email: raw.email || "",
                name:
                  raw.name ||
                  `${raw.firstName || ""} ${raw.lastName || ""}`.trim() ||
                  raw.username ||
                  "User",
                role: normalizeRole(raw.role),
              };
              localStorage.setItem("gf_auth_user", JSON.stringify(freshUser));
              setState({
                user: freshUser,
                isAuthenticated: true,
                loading: false,
              });
            } catch (err: any) {
              if (err.response?.status === 401) {
                logout();
              }
            }
          }
        } catch (e) {
          logout();
        }
      } else {
        setState({ user: null, isAuthenticated: false, loading: false });
      }
    };

    initializeAuth();
  }, [logout]);

  useEffect(() => {
    const handleLogoutEvent = () => {
      setState({ user: null, isAuthenticated: false, loading: false });
    };

    window.addEventListener("gf-auth-logout", handleLogoutEvent);
    return () => {
      window.removeEventListener("gf-auth-logout", handleLogoutEvent);
    };
  }, []);

  const login = async (
    emailOrUsername: string,
    password: string,
  ): Promise<boolean> => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      // Call actual backend authentication with usernameOrEmail and email for maximum compatibility
      const response = await api.post("/auth/login", {
        usernameOrEmail: emailOrUsername,
        email: emailOrUsername,
        password,
      });
      const payload = response.data?.data || response.data;
      const token = payload.token;
      const rawUser = payload.user || payload;

      const formattedUser: User = {
        id: String(rawUser.id),
        email:
          rawUser.email ||
          (emailOrUsername.includes("@")
            ? emailOrUsername
            : `${emailOrUsername}@gloryflorence.com`),
        name:
          rawUser.name ||
          `${rawUser.firstName || ""} ${rawUser.lastName || ""}`.trim() ||
          rawUser.username ||
          emailOrUsername,
        role: normalizeRole(rawUser.role),
      };

      localStorage.setItem("gf_auth_token", token);
      localStorage.setItem("gf_auth_user", JSON.stringify(formattedUser));

      setState({
        user: formattedUser,
        isAuthenticated: true,
        loading: false,
      });

      showToast(`Welcome back, ${formattedUser.name}!`, "success");
      return true;
    } catch (error: any) {
      setState((prev) => ({ ...prev, loading: false }));
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
