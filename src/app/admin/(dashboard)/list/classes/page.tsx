"use client";

import { useAtom } from "jotai";
import { useState, useEffect } from "react";
import { allClassLoadableAtom } from "@/jotai/class/class";
import { authPersistedAtom } from "@/jotai/auth/auth";
import { AuthSession } from "@/jotai/auth/auth-types";
import { Role } from "@/common/enum";
import { ClassType } from "@/jotai/class/class-type";
import { ArrowDownWideNarrow, ArrowDownUp } from "lucide-react";

import FormModal from "@/components/form-modal";
import Pagination from "@/components/pagination";
import Table from "@/components/table";
import TableSearch from "@/components/table-search";

type Class = {
  id: number;
  name: string;
  capacity: number;
  grade: number;
  supervisor: string;
};

const columns = [
  {
    header: "Class Name",
    accessor: "name",
  },
  {
    header: "Capacity",
    accessor: "capacity",
    className: "hidden md:table-cell",
  },
  {
    header: "Grade",
    accessor: "grade",
    className: "hidden md:table-cell",
  },
  {
    header: "Supervisor",
    accessor: "supervisor",
    className: "hidden md:table-cell",
  },
  {
    header: "Actions",
    accessor: "action",
  },
];

const ClassListPage = () => {
  const [classes] = useAtom(allClassLoadableAtom);
  const [classesList, setClassesList] = useState<Class[]>([]);
  const [auth] = useAtom(authPersistedAtom) as AuthSession[];
  const role = auth?.user?.role;

  useEffect(() => {
    if (classes.state === "hasData") {
      setClassesList(classes.data);
    } else if (classes.state === "hasError") {
      console.error("Error loading classes:", classes.error);
    }
  });

  const renderRow = (item: ClassType) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.name}</td>
      <td className="hidden md:table-cell">no capacity</td>
      <td className="hidden md:table-cell">no grade</td>
      <td className="hidden md:table-cell">supervisor === teacher?</td>
      <td>
        <div className="flex items-center gap-2">
          {role === Role.ADMIN && (
            <>
              <FormModal table="class" type="update" data={item} />
              <FormModal table="class" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-2 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer">
              <ArrowDownWideNarrow size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer">
              <ArrowDownUp size={16} />
            </button>
            {role === Role.ADMIN && <FormModal table="class" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={classesList} />
      {/* PAGINATION */}
      <Pagination />
    </div>
  );
};

export default ClassListPage;
