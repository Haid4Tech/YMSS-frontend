"use client";

// import { useAtom } from "jotai";
// import { allStudentLoadableAtom } from "@/jotai/students/student";

import Announcements from "@/components/annoucement";
import BigCalendar from "@/components/big-calendar";
import EventCalendar from "@/components/event-calendar";

const StudentPage = () => {
  // const [students] = useAtom(allStudentLoadableAtom);

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="flex flex-col gap-3 h-full bg-white p-4 rounded-md">
          <h1 className="text-base font-semibold">Schedule (4A)</h1>
          <BigCalendar />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;
