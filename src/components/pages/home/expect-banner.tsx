import { Star, GraduationCap, CalendarCheck, Sprout } from "lucide-react";
import Image from "next/image";

const ExpectBanner = () => {
  return (
    <div className="relative">
      <div
        className={
          "grid grid-cols-2 md:grid-cols-3 rounded-lg bg-main-blue p-3 md:p-8 md:py-12"
        }
      >
        <div
          className={
            "p-3 flex flex-col gap-3 justify-center col-span-1 border-r-1 border-main-blue-tint2"
          }
        >
          <p
            className={
              "text-main-blue-tint2 font-bold text-3xl md:text-xl lg:text-2xl"
            }
          >
            What you can expect at YMSS
          </p>
          <p className="text-main-blue-tint1">
            From academics to friendships, activities, and future opportunities
            — here’s what makes the high school journey unforgettable.
          </p>
        </div>

        <div className={"p-3 mcol-span-1 md:col-span-2 grid grid-cols-2 gap-2"}>
          <div
            className={"p-3 flex flex-col gap-2 items-center justify-center"}
          >
            <GraduationCap size={35} className={"text-main-red-tint2"} />
            <p className={"text-center text-main-blue-tint1 font-semibold"}>
              Academic Excellence
            </p>
          </div>
          <div
            className={"p-3 flex flex-col gap-2 items-center justify-center"}
          >
            <Sprout size={35} className={"text-main-red-tint2"} />
            <p className={"text-center text-main-blue-tint1 font-semibold"}>
              Social Development
            </p>
          </div>
          <div
            className={"p-3 flex flex-col gap-2 items-center justify-center"}
          >
            <CalendarCheck size={35} className={"text-main-red-tint2"} />
            <p className={"text-center text-main-blue-tint1 font-semibold"}>
              Extracurricular Activities
            </p>
          </div>
          <div
            className={"p-3 flex flex-col gap-2 items-center justify-center"}
          >
            <Star size={35} className={"text-main-red-tint2"} />
            <p className={"text-center text-main-blue-tint1 font-semibold"}>
              Preparation for the future{" "}
            </p>
          </div>
        </div>
      </div>

      {/* Assets */}
      <div className={"absolute bottom-2 right-0 opacity-75 md:opacity-50"}>
        <Image
          className={"w-[100%] md:w-[100%]"}
          src={"patterns/dot-box-1.svg"}
          alt={"pattern"}
          width={"200"}
          height={200}
        />
      </div>
      <div className={"absolute top-3 left-5 opacity-50"}>
        <Image
          className={"w-[50%] md:w-[70%]"}
          src={"patterns/zigzg-1.svg"}
          alt={"pattern"}
          width={"200"}
          height={200}
        />
      </div>
    </div>
  );
};

export default ExpectBanner;
