/* eslint-disable @typescript-eslint/no-explicit-any */
import { atom } from "jotai";
import { SignUpType, SignInType, AuthSession, UserType } from "./auth-types";
import { loadable } from "jotai/utils";
import axiosInstance from "@/utils/axios-instance";
import { setCookie, deleteCookie, getCookie } from "cookies-next";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

const url = process.env.NEXT_PUBLIC_API_URL;

/*
  |--------------------------------------------------------------------------
  | AUTHENTICATION STATE ATOMS
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

// Derived atom to get just the user from auth state
export const userAtom = atom<UserType | null>((get) => {
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
  | LOGIN AUTHENTICATION
  |--------------------------------------------------------------------------
*/

// Store the login form input
export const loginFormAtom = atom<SignInType>({ email: "", password: "" });

// To trigger login (write-only atom)
export const loginTriggerAtom = atom(null, async (get, set) => {
  const form = get(loginFormAtom);

  // Clear previous errors and set loading
  set(authErrorAtom, null);
  set(authLoadingAtom, true);

  try {
    const response = await axiosInstance.post(`${url}/auth/login`, form);
    const authData = response.data as AuthSession;

    // Store auth data
    set(authPersistedAtom, authData);
    setCookie("token", authData.token);

    // Update localStorage token for API calls
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", authData.token || "");
    }

    set(authLoadingAtom, false);
    return authData;
  } catch (error: any) {
    set(authLoadingAtom, false);
    const errorMessage =
      error.response?.data?.message || "Login failed. Please try again.";
    set(authErrorAtom, errorMessage);
    console.error("Login error:", error);
    throw error;
  }
});

// Loadable atom to track login state changes
export const loadableLoginAtom = loadable(loginTriggerAtom);

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
    const response = await axiosInstance.get(`${url}/auth/me`, {
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
  | SIGN UP AUTHENTICATION
  |--------------------------------------------------------------------------
*/

// Store the sign up form input
export const signupFormAction = atom<SignUpType>({
  name: "",
  email: "",
  password: "",
  role: undefined,
});

export const signUpTriggerAtom = atom(null, async (get, set) => {
  const form = get(signupFormAction);

  set(authErrorAtom, null);
  set(authLoadingAtom, true);

  try {
    const response = await axiosInstance.post(`${url}/auth/register`, form);
    const authData = response.data as AuthSession;

    set(authPersistedAtom, authData);
    setCookie("token", authData.token);

    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", authData.token || "");
    }

    set(authLoadingAtom, false);
    return authData;
  } catch (error: any) {
    set(authLoadingAtom, false);
    const errorMessage =
      error.response?.data?.message || "Registration failed. Please try again.";
    set(authErrorAtom, errorMessage);
    console.error("Sign Up error:", error);
    throw error;
  }
});

export const loadableSignUpAtom = loadable(signUpTriggerAtom);

/*
  |--------------------------------------------------------------------------
  | LOGOUT AUTHENTICATION
  |--------------------------------------------------------------------------
*/
export const logoutTriggerAtom = atom(
  null,
  async (_get, set, reason?: string) => {
    set(authPersistedAtom, null);
    set(authErrorAtom, null);
    deleteCookie("token");

    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }

    console.log("Logout reason:", reason || "User initiated");
  }
);

// Helper atom to get user role
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
