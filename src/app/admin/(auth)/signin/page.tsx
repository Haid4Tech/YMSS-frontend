"use client";

import { z } from "zod";
import { useEffect } from "react";
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
import { Role } from "@/common/enum";
import { roleRedirectMap } from "@/common/helper";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: initialValues,
    resolver: zodResolver(signInSchema),
  });

  useEffect(() => {
    if (loginStatus.state === "hasData" && result !== null) {
      const role = result.user.role;
      const path = roleRedirectMap[role as Role];

      router.push(path);
    }

    if (loginStatus.state === "hasError") {
      console.error("Login failed:", loginStatus.error);
    }
  }, [loginStatus.state, result, router]);

  const onSubmit = handleSubmit(async (data) => {
    setLoginFormData(data);
    await triggerLogin();
  });

  return (
    <div className={"grid md:grid-cols-2 grid-cols-1"}>
      <div className={"bg-red-200"}>Sign in</div>
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

        <Button className="w-full" type={"submit"}>
          {loginStatus.state === "loading"
            ? "Loading..."
            : loginStatus.state === "hasData" && result !== null
            ? "Redirecting..."
            : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
