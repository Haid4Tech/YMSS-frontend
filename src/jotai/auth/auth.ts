import { atom } from "jotai";
import axios from "axios";
import {
  SignUpType,
  SignInType,
  SignInResponse,
  SignUpResponse,
} from "./authtypes";
import { loadable } from "jotai/utils";

const url = process.env.NEXT_PUBLIC_API_URL;

/*
  |--------------------------------------------------------------------------
  | LOGIN AUTHENTICATION - JOTAI
  |--------------------------------------------------------------------------
  | Setting all the Sign up authentication logic
  | using Jotai 
  |
*/

// Store the login form input
export const loginFormAtom = atom<SignInType>({ email: "", password: "" });

// To store the login result (token, user data)
export const loginResultAtom = atom<SignInResponse | null>(null);

// To trigger login (write-only atom)
export const loginTriggerAtom = atom(null, async (get, set) => {
  const form = get(loginFormAtom);
  try {
    const response = await axios.post(`${url}/auth/login`, form, {
      headers: { "Content-Type": "application/json" },
    });
    set(loginResultAtom, response.data);
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

// To store the sign up result (token, user data)
export const signUpResultAtom = atom<SignUpResponse | null>(null);

export const signUpTriggerAtom = atom(null, async (get, set) => {
  const form = get(signupFormAction);

  try {
    const response = await axios.post(`${url}/auth/register`, form, {
      headers: { "Content-Type": "application/json" },
    });
    set(signUpResultAtom, response.data);
    console.log(response.data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Sign Up error:", error);
    }
  }
});

export const loadableSignUpAtom = loadable(signUpResultAtom);
