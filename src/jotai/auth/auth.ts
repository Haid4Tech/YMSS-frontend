/* eslint-disable @typescript-eslint/no-explicit-any */
import { atom } from "jotai";
import { SignUpProps, SignInProps, AuthSession, User } from "./auth-types";
import axiosInstance from "@/utils/axios-instance";
import { setCookie, deleteCookie, getCookie } from "cookies-next";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { extractErrorMessage } from "@/utils/helpers";

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

// Auth loading state
export const authLoadingAtom = atom<boolean>(false);
export const authErrorAtom = atom<string | null>(null);
export const isLoggingOutAtom = atom<boolean>(false);

// Profile update loading state
export const profileUpdateLoadingAtom = atom<boolean>(false);
export const profileUpdateErrorAtom = atom<string | null>(null);

export const authAPI = {
  register: atom(null, async (get, set) => {
    set(authLoadingAtom, true);
    set(authErrorAtom, null);

    try {
      const form = get(signupFormAction);
      const response = await axiosInstance.post(`/auth/register`, form);
      const authData = response.data as AuthSession;

      set(authPersistedAtom, authData);
      setCookie("token", authData.token, {
        maxAge: 7 * 24 * 60 * 60, // 7 days
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return authData;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Signup error:", errorMessage);
      set(authErrorAtom, errorMessage);
      throw new Error(errorMessage);
    } finally {
      set(authLoadingAtom, false);
    }
  }),

  login: atom(null, async (get, set) => {
    set(authErrorAtom, null);
    set(authLoadingAtom, true);

    try {
      const form = get(loginFormAtom);
      const response = await axiosInstance.post("/auth/login", form);
      const authData = response.data as AuthSession;

      set(authPersistedAtom, authData);
      setCookie("token", authData.token, {
        maxAge: 7 * 24 * 60 * 60, // 7 days
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      return authData;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Login error:", errorMessage);
      set(authErrorAtom, errorMessage);
      throw new Error(errorMessage);
    } finally {
      set(authLoadingAtom, false);
    }
  }),

  me: atom(null, async (): Promise<User> => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  }),

  updateProfile: atom(null, async (get, set, userData: Partial<User>) => {
    set(profileUpdateLoadingAtom, true);
    set(profileUpdateErrorAtom, null);

    try {
      const response = await axiosInstance.put("/auth/profile", userData);
      const updatedUser = response.data.user || response.data;

      // Update the auth session with the new user data
      const currentSession = get(authPersistedAtom);
      if (currentSession) {
        const updatedSession: AuthSession = {
          ...currentSession,
          user: { ...currentSession.user, ...updatedUser },
        };
        set(authPersistedAtom, updatedSession);
      }

      return updatedUser;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Profile update error:", errorMessage);
      set(profileUpdateErrorAtom, errorMessage);
      throw new Error(errorMessage);
    } finally {
      set(profileUpdateLoadingAtom, false);
    }
  }),

  logout: atom(null, async (_get, set, reason?: string) => {
    console.log("🚪 Starting logout process:", reason || "User initiated");

    // Set logout state immediately
    set(isLoggingOutAtom, true);
    set(authLoadingAtom, false);
    set(authErrorAtom, null);

    // Clear auth state immediately (don't wait for anything)
    set(authPersistedAtom, null);

    // Clear storage immediately
    deleteCookie("token");
    localStorage.removeItem("auth_session");

    // Reset logout state
    setTimeout(() => {
      set(isLoggingOutAtom, false);
    }, 100);

    return true;
  }),
};

// Derived atom to get just the user from auth state
export const userAtom = atom<User | null>((get) => {
  const authSession = get(authPersistedAtom);
  return authSession?.user ?? null;
});

// Check if user is authenticated
export const isAuthenticatedAtom = atom<boolean>((get) => {
  const authSession = get(authPersistedAtom);
  const token = getCookie("token");
  const isLoggingOut = get(isLoggingOutAtom);

  // If currently logging out, return false immediately
  if (isLoggingOut) return false;

  return !!(authSession?.user && authSession?.token && token);
});

/*
  |--------------------------------------------------------------------------
  | AUTO-LOGIN/SESSION RESTORE
  |--------------------------------------------------------------------------
*/

// Auto-login atom to restore session from token
export const autoLoginAtom = atom(null, async (get, set) => {
  // Don't auto-login if currently logging out
  if (get(isLoggingOutAtom)) {
    return null;
  }

  set(authLoadingAtom, true);
  set(authErrorAtom, null);

  try {
    const token = getCookie("token");
    const existingSession = get(authPersistedAtom);

    if (!token) {
      console.log("No token found, skipping auto-login");
      set(authLoadingAtom, false);
      return null;
    }

    // If we already have a valid session with the same token, use it
    if (existingSession?.token === token && existingSession?.user) {
      console.log("Valid session found, using existing auth data");
      set(authLoadingAtom, false);
      return existingSession;
    }

    console.log("Verifying token with backend...");

    // Verify token with backend
    const response = await axiosInstance.get(`/auth/me`);

    const authData: AuthSession = {
      user: response.data.user || response.data,
      teacher: response.data.teacher,
      token: token as string,
    };

    set(authPersistedAtom, authData);
    console.log("Auto-login successful");

    return authData;
  } catch (error: any) {
    console.log("Auto-login failed, clearing auth state");

    // Token is invalid, clear everything
    set(authPersistedAtom, null);
    deleteCookie("token");
    localStorage.removeItem("auth_session");

    const errorMessage =
      error.response?.status === 401
        ? "Session expired"
        : error.response?.data?.message || "Authentication failed";

    set(authErrorAtom, errorMessage);
    return null;
  } finally {
    set(authLoadingAtom, false);
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
