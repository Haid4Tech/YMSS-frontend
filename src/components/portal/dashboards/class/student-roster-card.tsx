import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Class } from "@/jotai/class/class-type";
import Link from "next/link";
import { PersonAvatar } from "@/components/ui/person-avatar";

interface IStudentRosterCard {
  classData: Class;
}

export const StudentRosterCard: FC<IStudentRosterCard> = ({ classData }) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classData?.students?.map((student) => (
          <div
            key={student.id}
            className="space-y-3 p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex flex-row gap-2">
              <PersonAvatar
                name={`${student?.user?.firstname} ${student?.user?.lastname}`}
                size="lg"
              />

              <div className="w-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    {`${student?.user?.firstname} ${student?.user?.lastname}`}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    STUDENT ID: {student.id}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {student?.user?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/portal/students/${student.id}`}>
                  View Profile
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                Contact
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* <div className="rounded-sm oveflow-hidden border-1 border-gray-300">
                     <TableComp headers={studentRostertableHeader} data={[]} />
                   </div> */}
    </div>
  );
};
