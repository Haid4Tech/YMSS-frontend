/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InputField, SelectField } from "@/components/ui/form-field";
import { SelectItem } from "@/components/ui/select";
import { useAtom } from "jotai";
import { authAPI, signupFormAction } from "@/jotai/auth/auth";
import { Role } from "@/common/enum";
import { ArrowLeft } from "lucide-react";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role | undefined | string>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [, setSignUpFormData] = useAtom(signupFormAction);
  const [, triggerSignUp] = useAtom(authAPI.register);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!role) {
      setError("Please select a role");
      setLoading(false);
      return;
    }

    try {
      setSignUpFormData({ name, email, password, role });
      await triggerSignUp();

      // Redirect to dashboard
      router.push("/portal/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as any).response?.data?.message ||
            "Registration failed. Please try again."
          : "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-muted-foreground">Join the YMSS community today</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <InputField
            label={" Full Name"}
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <InputField
            label={" Email Address"}
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <SelectField
            label={"Role"}
            value={role ?? ""}
            onValueChange={setRole}
            placeholder="Select your role"
          >
            {Object.values(Role).map((item, index) => (
              <SelectItem className="capitalize" key={index} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectField>
        </div>

        <div className="space-y-2">
          <InputField
            label="Password"
            id="password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <InputField
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            required
          />
          <span className="text-sm text-muted-foreground">
            I agree to the{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </span>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/portal/signin"
            className="text-primary hover:underline font-medium"
          >
            Sign in
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
