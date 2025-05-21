"use client";

import { z } from "zod";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import MenuBar from "@/components/navigation/menubar";
import Footer from "@/components/navigation/footer";
import InputField from "@/components/input-field";
import { Button } from "@/components/ui/button";
import { signUpSchema } from "@/schema/signup-schema";
import { useAtom, useSetAtom } from "jotai";
import {
  signupFormAction,
  signUpTriggerAtom,
  loadableSignUpAtom,
  authResultAtom,
} from "@/jotai/auth/auth";
import { Role } from "@/common/enum";
import { roleRedirectMap } from "@/common/helper";
import SelectField from "@/components/select-field";
import { SignUpType } from "@/jotai/auth/authtypes";

const initialValues: SignUpType = {
  name: "",
  email: "",
  password: "",
  role: undefined,
};

export default function Page() {
  const router = useRouter();
  type Inputs = z.infer<typeof signUpSchema>;
  const [signInStatus] = useAtom(loadableSignUpAtom);
  const [result] = useAtom(authResultAtom);
  const setSignUpFormData = useSetAtom(signupFormAction);
  const [_, triggerSignUp] = useAtom(signUpTriggerAtom);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Inputs>({
    defaultValues: initialValues,
    resolver: zodResolver(signUpSchema),
  });

  useEffect(() => {
    if (signInStatus.state === "hasData" && result) {
      const role = result.user.role;
      const path = roleRedirectMap[role as Role];

      router.push(path);
    }

    if (signInStatus.state === "hasError") {
      console.error("Login failed:", signInStatus.error);
    }
  }, [signInStatus.state, result, router]);

  const onSubmit = handleSubmit(async (data) => {
    setSignUpFormData(data as SignUpType);
    await triggerSignUp();

    if (signInStatus.state === "hasData") {
      const role = result?.user?.role;
      const path = roleRedirectMap[role as Role];

      if (!path) return;

      router.push(path);
      console.log("redirecting");
    } else if (signInStatus.state === "hasError") {
      console.error("Login failed:", signInStatus.error);
    }
  });

  return (
    <div>
      <MenuBar />
      <div className={"grid md:grid-cols-2 grid-cols-1"}>
        <div className={"bg-red-200"}>Sign Up</div>
        <form
          className="h-full flex flex-col items-center justify-center gap-5 w-full p-5 md:p-12 lg:p-20"
          onSubmit={onSubmit}
        >
          <div className="w-full flex flex-col items-center justify-center gap-2">
            <p className={"font-bold text-base md:text-lg"}>Sign Up</p>
            <p className={"text-sm font-light capitalize"}>
              Enter your sign in credentials
            </p>
          </div>
          <InputField
            label="Name"
            name="name"
            type={"text"}
            inputProps={{
              placeholder: "Name",
            }}
            register={register}
            error={errors?.name}
          />

          <InputField
            label="Email"
            name="email"
            inputProps={{
              placeholder: "Email",
            }}
            type={"email"}
            register={register}
            error={errors?.email}
          />

          <InputField
            label="Password"
            name="password"
            inputProps={{
              placeholder: "Password",
            }}
            type={"password"}
            register={register}
            error={errors?.password}
          />

          <SelectField
            placeholder={"Role"}
            items={[...Object.values(Role)]}
            title={"Role"}
            selected={watch("role")}
            onSelect={(role) => setValue("role", role as Role)}
          />

          <Button className="w-full" type={"submit"}>
            Sign In
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
