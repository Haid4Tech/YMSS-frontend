"use client";

import { useAtom } from "jotai";
import { useState, useEffect } from "react";
import { allExamsLoadableAtom } from "@/jotai/exams/exams";
import { authPersistedAtom } from "@/jotai/auth/auth";
import { ExamType } from "@/jotai/exams/exams-type";
import { AuthSession } from "@/jotai/auth/auth-types";
import { formatDate } from "@/common/helper";

import FormModal from "@/components/form-modal";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";
import { Role } from "@/common/enum";
import Image from "next/image";

const columns = [
  {
    header: "Subject Name",
    accessor: "name",
  },
  {
    header: "Class",
    accessor: "class",
  },
  {
    header: "Teacher",
    accessor: "teacher",
    className: "hidden md:table-cell",
  },
  {
    header: "Date",
    accessor: "date",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ExamListPage = () => {
  const [auth] = useAtom(authPersistedAtom) as AuthSession[];
  const [exams] = useAtom(allExamsLoadableAtom);
  const [examsList, setExamsList] = useState<ExamType[]>([]);
  const role = auth?.user?.role;

  useEffect(() => {
    if (exams.state === "hasData") {
      setExamsList(exams.data);
    } else if (exams.state === "hasError") {
      console.error("Error fetching exams data:", exams.error);
    }
  }, [exams]);

  const renderRow = (item: ExamType) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.title}</td>
      <td>need class relationship</td>
      <td className="hidden md:table-cell">no teacher</td>
      <td className="hidden md:table-cell">
        {formatDate(new Date(item.date))}
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === Role.ADMIN ||
            (role === Role.TEACHER && (
              <>
                <FormModal table="exam" type="update" data={item} />
                <FormModal table="exam" type="delete" id={item.id} />
              </>
            ))}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === Role.ADMIN ||
              (role === Role.TEACHER && (
                <FormModal table="exam" type="create" />
              ))}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={examsList} />
      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default ExamListPage;
