"use client";

import { useAtom } from "jotai";
import { useState, useEffect } from "react";
import { allStudentLoadableAtom } from "@/jotai/students/student";
import { StudentType } from "@/jotai/students/student-types";
import { authPersistedAtom } from "@/jotai/auth/auth";
import { AuthSession } from "@/jotai/auth/auth-types";
import { Role } from "@/common/enum";

import FormModal from "@/components/form-modal";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import Link from "next/link";

type Student = {
  id: number;
  studentId: string;
  name: string;
  email?: string;
  photo: string;
  phone?: string;
  grade: number;
  class: string;
  address: string;
};

const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Student ID",
    accessor: "studentId",
    className: "hidden md:table-cell",
  },
  {
    header: "Grade",
    accessor: "grade",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Address",
    accessor: "address",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const StudentListPage = () => {
  const [students] = useAtom(allStudentLoadableAtom);
  const [auth] = useAtom(authPersistedAtom) as AuthSession[];
  const [studentsList, setStudentsList] = useState<StudentType[]>([]);
  const role = auth?.user?.role;

  useEffect(() => {
    if (students.state === "hasData") {
      setStudentsList(students.data.students);
    } else if (students.state === "hasError") {
      console.error("Error fetching students data");
    }
  }, [students]);

  const renderRow = (item: StudentType) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">
        <img
          src={"/avatar.png"}
          alt=""
          width={40}
          height={40}
          className="md:hidden xl:block w-10 h-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <h3 className="font-semibold">{item.user.name}</h3>
          <p className="text-xs text-gray-500">{item.class.name}</p>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.id}</td>
      <td className="hidden md:table-cell">no grade</td>
      <td className="hidden md:table-cell">no phone</td>
      <td className="hidden md:table-cell">no address</td>
      <td>
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer">
              <img src={"/profile.png"} alt="" width={16} height={16} />
            </button>
          </Link>
          {role === Role.ADMIN && (
            // <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaPurple">
            //   <Image src="/delete.png" alt="" width={16} height={16} />
            // </button>
            <FormModal table="student" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer">
              <img src={"/sort.png"} alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer">
              <img src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === Role.ADMIN && (
              // <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              //   <Image src="/plus.png" alt="" width={14} height={14} />
              // </button>
              <FormModal table="student" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={studentsList} />
      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default StudentListPage;
