/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Trash2, Plus, RefreshCw, X } from "lucide-react";
import { Button } from "./ui/button";
import dynamic from "next/dynamic";
import { useState } from "react";

// Lazy-loaded form components
const TeacherForm = dynamic(() => import("./forms/teachers-form"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/student-form"), {
  loading: () => <h1>Loading...</h1>,
});

// Define supported table types for forms
const forms = {
  teacher: (type: "create" | "update", data?: any) => (
    <TeacherForm type={type} data={data} />
  ),
  student: (type: "create" | "update", data?: any) => (
    <StudentForm type={type} data={data} />
  ),
} as const;

type TableType =
  | "teacher"
  | "student"
  | "parent"
  | "subject"
  | "class"
  | "lesson"
  | "exam"
  | "assignment"
  | "result"
  | "attendance"
  | "event"
  | "announcement";

type ModalProps = {
  table: TableType;
  type: "create" | "update" | "delete";
  data?: any;
  id?: number;
};

const FormModal = ({ table, type, data, id }: ModalProps) => {
  const [open, setOpen] = useState(false);

  const Form = () => {
    if (type === "delete" && id) {
      return (
        <form action="" className="p-4 flex flex-col gap-4">
          <span className="text-center font-medium">
            All data will be lost. Are you sure you want to delete this {table}?
          </span>
          <Button
            type="submit"
            variant={"destructive"}
            className={"w-max self-center"}
          >
            Delete
          </Button>
        </form>
      );
    }

    if (table in forms && (type === "create" || type === "update")) {
      const FormComponent = forms[table as keyof typeof forms];
      return FormComponent(type, data);
    }

    return (
      <div className="text-red-600 text-center font-semibold">
        ⚠️ Form not available for &quot;{table}&quot;!
      </div>
    );
  };

  return (
    <>
      <button
        className="flex items-center justify-center rounded-full cursor-pointer"
        onClick={() => setOpen(true)}
      >
        {type === "delete" && <Trash2 size={18} />}
        {type === "create" && <Plus size={18} />}
        {type === "update" && <RefreshCw size={18} />}
      </button>

      {open && (
        <div className="z-30 w-screen h-screen fixed left-0 top-0 bg-black/75 flex items-center justify-center">
          <div className="z-40 bg-white p-4 rounded-md relative w-[90%] opacity-100 md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
