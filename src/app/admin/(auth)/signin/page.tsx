"use client";

import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/input-field";
import { Button } from "@/components/ui/button";
import { signInSchema } from "@/schema/signin-schema";
import { useAtom } from "jotai";
import {
  loginFormAtom,
  loadableLoginAtom,
  loginTriggerAtom,
  authPersistedAtom,
} from "@/jotai/auth/auth";
import { AuthSession } from "@/jotai/auth/auth-types";
import { Spinner } from "@radix-ui/themes";
import { SignInStates } from "@/common/states";
import { SignInStatesProp } from "@/common/types";
import { roleRedirectMap } from "@/common/helper";
import { Role } from "@/common/enum";

const initialValues = {
  email: "",
  password: "",
};

export default function Page() {
  const router = useRouter();
  type Inputs = z.infer<typeof signInSchema>;
  const [, setLoginFormData] = useAtom(loginFormAtom);
  const [loginStatus] = useAtom(loadableLoginAtom);
  const [result] = useAtom(authPersistedAtom) as AuthSession[];
  const [, triggerLogin] = useAtom(loginTriggerAtom);
  const [loadingStates, setLoadingStates] =
    useState<SignInStatesProp>(SignInStates);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: initialValues,
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    setLoadingStates((prev) => ({ ...prev, loginState: true }));

    try {
      setLoginFormData(data);
      const response = await triggerLogin();

      if (response?.user !== null) {
        const role = response?.user?.role;
        const path = roleRedirectMap[role as Role];

        router.push(path);
      }
    } catch (error) {
      console.log("Error logging user in");
      throw error;
    } finally {
      setLoadingStates((prev) => ({ ...prev, loginState: false }));
    }
  });

  return (
    <div>
      <form
        className={
          "h-full flex flex-col items-center justify-center gap-5 w-full p-5 md:p-12 lg:p-20"
        }
        onSubmit={onSubmit}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <p className={"font-bold text-base md:text-lg lg:text-2xl"}>
            Sign In
          </p>
          <p className={"text-sm md:text-base font-light capitalize"}>
            Enter your sign in credentials
          </p>
        </div>
        <InputField
          label="Email"
          inputProps={{
            placeholder: "Email",
          }}
          name="email"
          type={"email"}
          defaultValue={initialValues.email}
          register={register}
          error={errors?.email}
        />

        <InputField
          label="Password"
          inputProps={{
            placeholder: "Password",
          }}
          name="password"
          type={"password"}
          defaultValue={initialValues.password}
          register={register}
          error={errors?.password}
        />

        <Button
          disabled={loginStatus.state === "hasData" && result !== null}
          className="w-full"
          type={"submit"}
        >
          {loadingStates.loginState ? (
            <div className="flex flex-row gap-2 items-center">
              Signing in
              <Spinner />
            </div>
          ) : result !== null ? (
            "Redirecting..."
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </div>
  );
}
