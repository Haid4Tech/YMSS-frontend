import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
// import { Badge } from "@/components/ui/badge";

// interface Student {
//   id: string;
//   name: string;
//   status: "present" | "absent" | "late";
//   arrivalTime?: string;
//   grade: string;
//   subject?: string; // The class/subject they were late for
// }

interface ITableHeader {
  title: string;
  key: string;
  max?: boolean;
}

interface ITableData {
  [key: string]: null | undefined | string | number | boolean | Date | string[];
}

export interface RowAction {
  title: string;
  action: () => void;
  rowData?: ITableData;
  color?: string;
}

interface IDashboardTable {
  headers: ITableHeader[];
  data: ITableData[];
  rowActions?: (row: ITableData) => RowAction[];
  headerBGcolor?: string;
  headerColor?: string;
  borderColor?: string;
  error?: boolean;
}

const TableComp = ({
  headers,
  data,
  rowActions,
  headerBGcolor,
  headerColor,
  borderColor,
  error,
}: IDashboardTable) => {
  // const getStatusBadge = (status: Student["status"]) => {
  //   switch (status) {
  //     case "present":
  //       return (
  //         <Badge
  //           variant="default"
  //           className="bg-success text-success-foreground"
  //         >
  //           Present
  //         </Badge>
  //       );
  //     case "absent":
  //       return <Badge variant="destructive">Absent</Badge>;
  //     case "late":
  //       return (
  //         <Badge
  //           variant="default"
  //           className="bg-warning text-warning-foreground"
  //         >
  //           Late
  //         </Badge>
  //       );
  //   }
  // };

  return (
    <Table>
      <TableHeader>
        <TableRow className={cn(borderColor)}>
          {headers.map((header) => (
            <TableHead
              className={cn(
                header.max ? "w-[20rem]" : "w-[10rem]",
                headerBGcolor ? headerBGcolor : " bg-primary-blue/10",
                headerColor,
                "font-semibold text-xs border border-gray-300"
              )}
              key={String(header.key)}
            >
              <p className={"text-wrap"}>{header.title}</p>
            </TableHead>
          ))}
          {rowActions && (
            <TableHead
              className={cn(
                headerBGcolor ? headerBGcolor : " bg-primary-blue/10",
                headerColor,
                "text-center font-semibold text-xs w-[60px]"
              )}
            >
              Actions
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.length === 0 ? (
          <TableRow className={cn(borderColor)}>
            <TableCell colSpan={headers?.length} className={cn("text-sm")}>
              {error ? "Error loading data" : "No data available"}
            </TableCell>
          </TableRow>
        ) : (
          data?.map((row, rowIndex) => (
            <TableRow className={cn(borderColor)} key={rowIndex}>
              {headers.map((header, colIndex) => {
                const cellValue = row[header.key];
                return (
                  <TableCell
                    key={colIndex}
                    className={cn(
                      header.max ? "w-[20rem]" : "w-[10rem]",
                      "text-wrap text-xs border border-gray-300"
                    )}
                  >
                    {Array.isArray(cellValue) ? (
                      cellValue?.length > 0 ? (
                        <div
                          className={cn(
                            header.max ? "w-[20rem]" : "w-[10rem]",
                            "flex flex-col gap-1"
                          )}
                        >
                          {cellValue.map((items, index) => (
                            <p className="text-xs text-wrap" key={index}>
                              - {items}.
                            </p>
                          ))}
                        </div>
                      ) : (
                        "--"
                      )
                    ) : (
                      <p
                        className={cn(
                          typeof cellValue === "number" &&
                            cellValue < 40 &&
                            "text-danger",
                          header.max ? "w-[20rem]" : "w-[10rem]",
                          "text-wrap"
                        )}
                      >
                        {cellValue?.toString() ?? "--"}
                      </p>
                    )}
                  </TableCell>
                );
              })}
              {rowActions && (
                <TableCell className="">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="border border-gray-300 p-2 rounded-md"
                        variant="ghost"
                        size="icon"
                      >
                        <MoreHorizontal size={15} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {rowActions(row).map((action, idx) => (
                        <DropdownMenuItem
                          key={idx}
                          onClick={action.action}
                          className={cn(
                            action.color ? action.color : "",
                            "flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50"
                          )}
                        >
                          {action.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default TableComp;
