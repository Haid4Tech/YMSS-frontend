import { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Background image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="https://scontent-los2-1.cdninstagram.com/v/t39.30808-6/400000903_17892550097924893_4347508550007350066_n.jpg?stp=dst-jpg_e35_p1080x1080_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkNBUk9VU0VMX0lURU0uaW1hZ2VfdXJsZ2VuLjE0NDB4MTgwMC5zZHIuZjMwODA4LmRlZmF1bHRfaW1hZ2UuYzIifQ&_nc_ht=scontent-los2-1.cdninstagram.com&_nc_cat=101&_nc_oc=Q6cZ2QHGZCPwRtxB8ERSpxIHckS4gErOiXCjffdP7imT50A3MPuNAi4yoWtUSWAsLfqV5fZg_ujiy-79-qNtmYgGUv-7&_nc_ohc=10zkV6q75zgQ7kNvwF6Ykxo&_nc_gid=PsXvcagykfZsarfqqEn2cw&edm=ALQROFkAAAAA&ccb=7-5&ig_cache_key=MzIzMTcyOTkzMzg0MjgzOTYyMw%3D%3D.3-ccb7-5&oh=00_AfZlELL3BOR3ks6Z1W3JiC7XOkawGhCkvhXiKq-yhQz1bA&oe=68DFE230&_nc_sid=fc8dfb"
          alt="School Campus"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-primary/20" />
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center text-white p-12">
          <div className="flex flex-col items-center justify-center text-center gap-5">
            <div className="bg-white rounded-lg p-4 w-fit h-fit">
              <Image
                src="/YMSS_logo-nobg.png"
                alt="YMSS Logo"
                width={80}
                height={80}
              />
            </div>
            <div className="space-y-2 lg:w-lg 2xl:w-2xl">
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
