/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/form-field";
import { Spinner } from "@radix-ui/themes";
import { SignInStatesProp } from "@/common/types";
import { SignInStates } from "@/common/states";
import { ArrowLeft } from "lucide-react";

import {
  userAtom,
  authAPI,
  loginFormAtom,
  isAuthenticatedAtom,
} from "@/jotai/auth/auth";
import { useAtom } from "jotai";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<SignInStatesProp>(SignInStates);
  const [error, setError] = useState("");

  const [, setLoginFormData] = useAtom(loginFormAtom);
  const [user] = useAtom(userAtom);
  const [, triggerLogin] = useAtom(authAPI.login);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, portalLoginState: true }));
    setError("");

    try {
      setLoginFormData({ email: email, password: password });
      const response = await triggerLogin();

      if (response?.user !== null) {
        // Redirect to dashboard
        router.push("/portal/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading((prev) => ({ ...prev, portalLoginState: false }));
    }
  };

  if (isAuthenticated || user !== null) {
    return (
      <div className={"flex flex-col gap-4 items-center justify-center"}>
        <p className="text-base text-center">
          Welcome back{" "}
          <span className="font-bold ">
            {user?.firstname} {user?.lastname}
          </span>
          . You should be redirected in a few seconds, if not click the button
          below.
        </p>
        <Button
          onClick={() => {
            setLoading((prev) => ({ ...prev, portalLoginState: true }));
            router.push("/portal/dashboard");
          }}
        >
          {loading.portalLoginState ? (
            <div className={"flex items-center gap-2"}>
              Redirecting... <Spinner />
            </div>
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Sign In</h1>
        <p className="text-muted-foreground">
          Welcome back! Please sign in to your account.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Email Address"
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading.portalLoginState}
        />

        <div className="space-y-2">
          <InputField
            label={"Password"}
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading.portalLoginState}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">Remember me</span>
          </label>
          <Link
            href="/portal/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading.portalLoginState}
        >
          {loading.portalLoginState ? (
            <div className="flex flex-row gap-2 items-center">
              Signing In... <Spinner />
            </div>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/portal/signup"
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>

        <Button
          onClick={() => router.push("/")}
          variant={"link"}
          className="flex flex-row items-center text-center mx-auto"
        >
          <ArrowLeft size={18} />
          <p>Back to Homepage</p>
        </Button>
      </div>
    </div>
  );
}
