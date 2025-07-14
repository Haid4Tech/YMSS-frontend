import { atom } from "jotai";
import { SignUpType, SignInType, AuthSession } from "./auth-types";
import { loadable } from "jotai/utils";
import axiosInstance from "@/utils/axios-instance";
import { setCookie, deleteCookie } from "cookies-next";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

const url = process.env.NEXT_PUBLIC_API_URL;

/*
  |--------------------------------------------------------------------------
  | LOGIN AUTHENTICATION - JOTAI
  |--------------------------------------------------------------------------
  | Setting all the Sign up authentication logic
  | using Jotai 
  |
*/
// persist auth state
const storage = createJSONStorage<AuthSession | null>(() => sessionStorage);
export const authPersistedAtom = atomWithStorage<AuthSession | null>(
  "auth state",
  null,
  storage
);

// Store the login form input
export const loginFormAtom = atom<SignInType>({ email: "", password: "" });

// To trigger login (write-only atom)
export const loginTriggerAtom = atom(null, async (get, set) => {
  const form = get(loginFormAtom);
  try {
    const response = await axiosInstance.post(`${url}/auth/login`, form);
    set(authPersistedAtom, response.data as AuthSession);
    setCookie("token", response.data?.token);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Login error:", error);
      throw error;
    }
  }
});
// Loadable atom to track changes in state
export const loadableLoginAtom = loadable(loginTriggerAtom);

/*
  |--------------------------------------------------------------------------
  | SIGN UP AUTHENTICATION - JOTAI
  |--------------------------------------------------------------------------
  | Setting all the Sign up authentication logic
  | using Jotai 
  |
  */

// store the sign up form input
export const signupFormAction = atom<SignUpType>({
  name: "",
  email: "",
  password: "",
  role: undefined,
});

export const signUpTriggerAtom = atom(null, async (get, set) => {
  const form = get(signupFormAction);

  try {
    const response = await axiosInstance.post(`${url}/auth/register`, form);
    set(authPersistedAtom, response.data);
    console.log(response.data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Sign Up error:", error);
    }
  }
});

export const loadableSignUpAtom = loadable(signUpTriggerAtom);

/*
  |--------------------------------------------------------------------------
  | LOG OUT AUTHENTICATION - JOTAI
  |--------------------------------------------------------------------------
  | Setting all the Log Out authentication logic
  | using Jotai 
  |
  */
export const logoutTriggerAtom = atom(null, async (_get, set, update) => {
  set(authPersistedAtom, null);
  deleteCookie("token");
  console.log("Logout reason:", update);
});
