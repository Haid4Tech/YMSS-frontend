import { Button } from "@/components/ui/button";
// import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <div>
      <div className="relative grid grid-cols-1 md:grid-cols-2 px-5 lg:px-15 xl:px-20">
        {/* left layout */}
        <div className="flex flex-col justify-center gap-8 p-5">
          <div className="flex flex-col gap-6">
            <p className="text-4xl md:text-2xl lg:text-5xl font-semibold text-main-blue">
              Empowering Future Leaders
            </p>
            <p className="text-base md:text-lg">
              Welcome to YMSS, where academic excellence meets character
              development. Join us in shaping tomorrow&apos;s innovators and
              leaders.
            </p>
            <div className="flex flex-row gap-2">
              <Button className={"bg-main-blue"} size={"lg"}>
                Apply Now
              </Button>
              <Button
                className="border border-main-blue text-main-blue"
                size={"lg"}
                variant={"outline"}
              >
                Explore programs
              </Button>
            </div>
          </div>
          {/* Bottom grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative bg-[url(/patterns/grettings-pattern.png)] bg-no-repeat bg-center bg-cover border border-gray-200 rounded-lg h-48 p-4">
              <div className={"md:w-32 lg:w-48 z-40"}>
                <p className="text-main-blue-tint3 text-xl font-semibold opacity-75">
                  Experts in{" "}
                  <span className="text-main-red">Child formation</span>
                </p>
              </div>
              <div className={"absolute bottom-0 right-0"}>
                <Image
                  src={"/images/boy-reading.png"}
                  alt="boy reading"
                  width={250}
                  height={250}
                  className="object-cover object-center md:w-[50%] lg:w-[75%] ml-auto"
                />
              </div>
            </div>

            {/* right layout */}
            <div className="relative bg-[url(/patterns/grettings-pattern.png)] bg-no-repeat bg-center bg-cover border border-gray-200 rounded-lg h-48 w-full p-4">
              <div className={"md:w-32 lg:w-48 z-40"}>
                <p className="text-main-blue-tint3 text-xl font-semibold opacity-75 ">
                  Developing <span className="text-main-red">Teamwork</span>{" "}
                  from the get go
                </p>
              </div>
              <div className={"absolute bottom-0 right-0"}>
                <Image
                  src={"/images/child-formation-nbg.png"}
                  alt="boy reading"
                  width={250}
                  height={250}
                  className="object-cover object-center md:w-[50%] lg:w-[75%] ml-auto"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block relative w-full">
          <div className="z-40 flex items-center mt-8">
            <Image
              src={"/images/ymss-students-designed.png"}
              className="object-cover object-center w-fit h-full"
              alt={"school girl"}
              width={400}
              height={400}
            />
          </div>

          <div className="absolute top-20 right-5">
            <Image
              src={"/patterns/plane.png"}
              alt="plane illustration"
              width={200}
              height={200}
            />
          </div>
          <div className={"absolute top-10 right-25"}>
            <Image
              className="w-full h-full rotate-180"
              src={"/patterns/direction-vector.png"}
              alt={"vector"}
              width={400}
              height={300}
            />
          </div>
        </div>
      </div>

      {/* Assets */}
    </div>
  );
}
