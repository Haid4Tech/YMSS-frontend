"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import MenuBar from "@/components/navigation/menubar";
import Footer from "@/components/navigation/footer";
import InputField from "@/components/input-field";
import { Button } from "@/components/ui/button";
import { signInSchema } from "@/schema/signin-schema";

const initialValues = {
  email: "",
  password: "",
};

export default function Page() {
  type Inputs = z.infer<typeof signInSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    defaultValues: initialValues,
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  return (
    <div>
      <MenuBar />
      <div className={"border border-red-500 grid md:grid-cols-2 grid-cols-1"}>
        <div className={"bg-red-200"}>Sign in</div>
        <form
          className="h-full flex flex-col items-center justify-center gap-5 w-full p-5 md:p-12 lg:p-20"
          onSubmit={onSubmit}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <p className={"font-bold text-base md:text-lg"}>Sign In</p>
            <p className={"text-sm font-light capitalize"}>
              Enter your sign in credentials
            </p>
          </div>
          <InputField
            label="Email"
            name="email"
            type={"email"}
            defaultValue={initialValues.email}
            register={register}
            error={errors?.email}
          />

          <InputField
            label="Password"
            name="password"
            type={"password"}
            defaultValue={initialValues.password}
            register={register}
            error={errors?.password}
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
