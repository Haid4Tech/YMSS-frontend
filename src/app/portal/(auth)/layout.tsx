import { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Background image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/auth_pexels.jpg"
          alt="School Campus"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-primary/20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="flex flex-col items-center justify-center text-center gap-5">
            <div className="bg-white rounded-lg p-4 w-fit h-fit">
              <Image
                src="/YMSS_logo-nobg.png"
                alt="YMSS Logo"
                width={80}
                height={80}
              />
            </div>
            <div className={"space-y-2"}>
              <h1 className="text-4xl font-bold mb-4">
                Welcome to YMSS Portal
              </h1>
              <p className="text-xl opacity-90">
                Access your academic dashboard and stay connected with your
                school community
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
