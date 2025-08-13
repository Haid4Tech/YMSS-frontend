"use client";

import { FC, useEffect, useState, SetStateAction, Dispatch } from "react";
import { useAtom } from "jotai";
import { SelectField } from "@/components/ui/form-field";
import { SelectItem } from "@/components/ui/select";

import { teachersAPI } from "@/jotai/teachers/teachers";
import { extractErrorMessage } from "@/utils/helpers";
import { Teacher } from "@/jotai/teachers/teachers-types";

interface IAssignTeacherForm {
  setTeacherId: Dispatch<SetStateAction<number | null>>;
}

export const AssignteacherForm: FC<IAssignTeacherForm> = ({ setTeacherId }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [, getAllTeachers] = useAtom(teachersAPI.getAll);

  console.log("TEACHERS ", teachers);

  useEffect(() => {
    const fetchData = async () => {
      const teachers = await getAllTeachers();

      setTeachers(teachers.teachers);
      try {
      } catch (error) {
        const errorMessage = extractErrorMessage(error);
        console.log(errorMessage);
      }
    };

    fetchData();
  }, [getAllTeachers]);

  return (
    <div className="w-full">
      <SelectField
        label={""}
        onValueChange={(value) => setTeacherId(parseInt(value))}
        placeholder="Select Teacher"
      >
        {teachers.map((teacher, index) => (
          <SelectItem key={index} value={teacher?.id.toString()}>
            <div className="flex flex-row gap-2">
              <p>{`${teacher?.user?.firstname} ${teacher?.user?.lastname}`}</p>
              <p>{}</p>
            </div>
          </SelectItem>
        ))}
      </SelectField>
    </div>
  );
};
