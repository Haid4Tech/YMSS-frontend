/* eslint-disable @typescript-eslint/no-explicit-any */
import { atom } from "jotai";
import { SignUpProps, SignInProps, AuthSession, User } from "./auth-types";
import axiosInstance from "@/utils/axios-instance";
import { setCookie, deleteCookie, getCookie } from "cookies-next";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

/*
  |--------------------------------------------------------------------------
  | AUTHENTICATION 
  |--------------------------------------------------------------------------
  | Global auth state management using Jotai
  |
*/

// Persist auth state in localStorage (changed from sessionStorage for better persistence)
const storage = createJSONStorage<AuthSession | null>(() => localStorage);
export const authPersistedAtom = atomWithStorage<AuthSession | null>(
  "auth_session",
  null,
  storage
);

export const loginFormAtom = atom<SignInProps>({ email: "", password: "" });
export const signupFormAction = atom<SignUpProps>({
  name: "",
  email: "",
  password: "",
  role: undefined,
});

export const authAPI = {
  register: atom(null, async (get, set) => {
    try {
      const form = get(signupFormAction);
      const response = await axiosInstance.post(`/auth/register`, form);
      const authData = response.data as AuthSession;

      set(authPersistedAtom, authData);
      setCookie("token", authData.token);

      set(authLoadingAtom, false);
      return authData;
    } catch (error) {
      let errorMessage = "Signup failed. Please try again.";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
      ) {
        errorMessage = (error.response as any).data.message || errorMessage;
      }
      set(authErrorAtom, errorMessage);
      console.error("Signup error:", error);
      throw error;
    }
  }),

  login: atom(null, async (get, set) => {
    // Clear previous errors and set loading
    set(authErrorAtom, null);
    set(authLoadingAtom, true);

    try {
      const form = get(loginFormAtom); // get form input
      const response = await axiosInstance.post("/auth/login", form);
      const authData = response.data as AuthSession;

      set(authPersistedAtom, authData);
      setCookie("token", authData.token);

      set(authLoadingAtom, false);
      return authData;
    } catch (error) {
      set(authLoadingAtom, false);
      let errorMessage = "Login failed. Please try again.";
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
      ) {
        errorMessage = (error.response as any).data.message || errorMessage;
      }
      set(authErrorAtom, errorMessage);
      console.error("Login error:", error);
      throw error;
    }
  }),

  me: atom(null, async (): Promise<User> => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  }),

  logout: atom(null, async (_get, set, reason?: string) => {
    set(authPersistedAtom, null);
    set(authErrorAtom, null);
    deleteCookie("token");

    console.log("Logout reason:", reason || "User initiated");
  }),
};

// Derived atom to get just the user from auth state
export const userAtom = atom<User | null>((get) => {
  const authSession = get(authPersistedAtom);
  return authSession?.user ?? null;
});

// Auth loading state
export const authLoadingAtom = atom<boolean>(false);

// Auth error state
export const authErrorAtom = atom<string | null>(null);

// Check if user is authenticated
export const isAuthenticatedAtom = atom<boolean>((get) => {
  const authSession = get(authPersistedAtom);
  return !!(authSession?.user && authSession?.token);
});

/*
  |--------------------------------------------------------------------------
  | AUTO-LOGIN/SESSION RESTORE
  |--------------------------------------------------------------------------
*/

// Auto-login atom to restore session from token
export const autoLoginAtom = atom(null, async (get, set) => {
  set(authLoadingAtom, true);
  set(authErrorAtom, null);

  try {
    const token = getCookie("token") || localStorage.getItem("authToken");

    if (!token) {
      set(authLoadingAtom, false);
      return null;
    }

    // Verify token with backend
    const response = await axiosInstance.get(`/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const authData: AuthSession = {
      user: response.data,
      token: token as string,
    };

    set(authPersistedAtom, authData);
    set(authLoadingAtom, false);

    return authData;
  } catch (error: any) {
    // Token is invalid, clear everything
    set(authPersistedAtom, null);
    deleteCookie("token");
    localStorage.removeItem("authToken");
    set(authLoadingAtom, false);

    const errorMessage = error.response?.data?.message || "Session expired";
    set(authErrorAtom, errorMessage);

    return null;
  }
});

/*
  |--------------------------------------------------------------------------
  | GET USER ROLES
  |--------------------------------------------------------------------------
  | Get User roles with Jotai
  |
*/
export const userRoleAtom = atom<string | null>((get) => {
  const user = get(userAtom);
  return user?.role ?? null;
});

// Helper atom to check specific roles
export const isAdminAtom = atom<boolean>((get) => {
  const role = get(userRoleAtom);
  return role === "ADMIN";
});

export const isTeacherAtom = atom<boolean>((get) => {
  const role = get(userRoleAtom);
  return role === "TEACHER";
});

export const isStudentAtom = atom<boolean>((get) => {
  const role = get(userRoleAtom);
  return role === "STUDENT";
});

export const isParentAtom = atom<boolean>((get) => {
  const role = get(userRoleAtom);
  return role === "PARENT";
});
