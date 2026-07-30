"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAtom } from "jotai";
import { toast } from "sonner";
import { Printer, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputField, SelectField } from "@/components/ui/form-field";
import { SelectItem } from "@/components/ui/select";
import { RemarkCombobox } from "@/components/ui/remark-combobox";
import { ReportCardSheet } from "@/components/portal/students/report-card-sheet";
import {
  formatFeeInput,
  formatNaira,
  formatTermDate,
} from "@/components/portal/students/report-fees";
import {
  suggestRemarks,
  teacherRemarkGroups,
  principalRemarkGroups,
} from "@/components/portal/students/report-comments";

import { gradesAPI } from "@/jotai/grades/grades";
import { ReportCard } from "@/jotai/grades/grades-types";
import { Student } from "@/jotai/students/student-types";
import { generateAcademicYears } from "@/common/helper";
import { extractErrorMessage } from "@/utils/helpers";

type Term = "FIRST" | "SECOND" | "THIRD";

const TERM_OPTIONS: Array<{ value: Term; label: string }> = [
  { value: "FIRST", label: "First Term" },
  { value: "SECOND", label: "Second Term" },
  { value: "THIRD", label: "Third Term" },
];

interface BatchReportPrintProps {
  classId: number;
  students: Student[];
  className?: string;
}

/*
  Admin-only batch printing of student report cards for a class.

  The admin first supplies the shared term settings (academic year, term and the
  "next term's fee" / "next term commences" values printed on every sheet). We
  then fetch every report card for the class in a single request, drop those
  with no results, and render one report sheet per printed page inside a
  full-screen preview portal that they can review and print.
*/
export function BatchReportPrint({
  classId,
  students,
  className,
}: BatchReportPrintProps) {
  const [, getClassReportCards] = useAtom(gradesAPI.getClassReportCards);

  const [open, setOpen] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [reports, setReports] = useState<ReportCard[] | null>(null);

  const [academicYear, setAcademicYear] = useState<string>("2024/2025");
  const [term, setTerm] = useState<Term>("FIRST");
  const [nextTermFee, setNextTermFee] = useState<string>("");
  const [nextTermDate, setNextTermDate] = useState<string>("");

  // Full student objects keyed by id so each sheet gets the richest data
  // (admission number, DOB, etc.) regardless of what the report payload holds.
  const studentsById = new Map(students.map((s) => [s.id, s]));

  const nextTermBegins = formatTermDate(nextTermDate);
  const nextTermFeeFormatted = formatNaira(nextTermFee);

  const handleGenerate = async () => {
    if (!students.length) {
      toast.error("This class has no students to print.");
      return;
    }

    setPreparing(true);
    try {
      // One request fetches every student's report card for the class.
      const data = (await getClassReportCards(
        classId,
        academicYear,
        term
      )) as { reportCards?: ReportCard[] } | null;

      const valid = (data?.reportCards ?? []).filter(
        (rc): rc is ReportCard => Boolean(rc?.results?.length)
      );

      if (!valid.length) {
        toast.error("No results found", {
          description: `No student has results for ${academicYear} — ${
            TERM_OPTIONS.find((t) => t.value === term)?.label
          }.`,
        });
        return;
      }

      const skipped = students.length - valid.length;
      if (skipped > 0) {
        toast.info(
          `${skipped} student(s) skipped — no results for the selected term.`
        );
      }

      setReports(valid);
      setOpen(false);
    } catch (error) {
      toast.error("Failed to prepare report cards", {
        description: extractErrorMessage(error),
      });
    } finally {
      setPreparing(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Printer className="mr-1 h-4 w-4" />
        Batch Print Results
      </Button>

      {/* Term settings */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batch Print Report Cards</DialogTitle>
            <DialogDescription>
              These values apply to every student report in{" "}
              {className ? <b>{className}</b> : "this class"}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              label="Academic Year"
              value={academicYear}
              onValueChange={setAcademicYear}
            >
              {generateAcademicYears(2023, 5).map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectField>

            <SelectField
              label="Term"
              value={term}
              onValueChange={(value: string) => setTerm(value as Term)}
            >
              {TERM_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectField>

            <InputField
              id="next-term-fee"
              type="text"
              inputMode="decimal"
              label="Next term's fee (₦)"
              placeholder="e.g. 33,000.00"
              value={nextTermFee}
              onChange={(e) => setNextTermFee(formatFeeInput(e.target.value))}
            />

            <InputField
              id="next-term-date"
              type="date"
              label="Next term commences"
              value={nextTermDate}
              onChange={(e) => setNextTermDate(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={preparing}>
              {preparing ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Preparing…
                </>
              ) : (
                "Generate & Preview"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print preview */}
      {reports && (
        <BatchPrintPreview
          reports={reports}
          academicYear={academicYear}
          term={term}
          nextTermFee={nextTermFeeFormatted}
          nextTermBegins={nextTermBegins}
          studentsById={studentsById}
          onClose={() => setReports(null)}
        />
      )}
    </>
  );
}

interface BatchPrintPreviewProps {
  reports: ReportCard[];
  academicYear: string;
  term: Term;
  nextTermFee: string;
  nextTermBegins: string;
  studentsById: Map<number, Student>;
  onClose: () => void;
}

type RemarkState = Record<number, { teacher: string; principal: string }>;

function BatchPrintPreview({
  reports,
  academicYear,
  term,
  nextTermFee,
  nextTermBegins,
  studentsById,
  onClose,
}: BatchPrintPreviewProps) {
  const [mounted, setMounted] = useState(false);

  // Auto-fill each student's remarks from their own average once, when the
  // preview opens. Kept in state so the admin can edit individuals before
  // printing.
  const [remarks, setRemarks] = useState<RemarkState>(() => {
    const initial: RemarkState = {};
    for (const rc of reports) {
      const studentId = rc.student?.id;
      if (studentId == null) continue;
      const suggested = suggestRemarks(rc.summary?.average);
      initial[studentId] = {
        teacher: suggested.teacher,
        principal: suggested.principal,
      };
    }
    return initial;
  });

  const setTeacher = (studentId: number, value: string) =>
    setRemarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], teacher: value },
    }));

  const setPrincipal = (studentId: number, value: string) =>
    setRemarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], principal: value },
    }));

  // Portal into <body> and flag it so print CSS can hide the rest of the app,
  // leaving only the stacked report sheets on paper.
  useEffect(() => {
    setMounted(true);
    document.body.classList.add("batch-printing");
    return () => {
      document.body.classList.remove("batch-printing");
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="batch-print-portal fixed inset-0 z-[100] overflow-auto bg-neutral-200 print:static print:overflow-visible print:bg-white">
      {/* Toolbar - hidden on paper */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm print:hidden">
        <p className="text-sm font-medium">
          {reports.length} report card{reports.length > 1 ? "s" : ""} ready to
          print
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="mr-1 h-4 w-4" />
            Close
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="mr-1 h-4 w-4" />
            Print All
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 p-4 print:max-w-none print:space-y-0 print:p-0">
        {reports.map((rc) => {
          const studentId = rc.student?.id;
          const student = studentsById.get(studentId) ?? rc.student;
          const remark =
            (studentId != null && remarks[studentId]) || {
              teacher: "",
              principal: "",
            };
          const studentName = `${student?.user?.firstname ?? ""} ${
            student?.user?.lastname ?? ""
          }`.trim();

          return (
            <div key={studentId} className="report-page">
              {/* Per-student remark editor - screen only */}
              <div className="mb-3 rounded-md border bg-white p-4 shadow-sm print:hidden">
                <p className="mb-3 text-sm font-medium">
                  Remarks — {studentName || `Student ${studentId}`}
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <RemarkCombobox
                    id={`teacher-remark-${studentId}`}
                    label="Form teacher's Remark"
                    placeholder="Type or select a remark"
                    value={remark.teacher}
                    onChange={(value) =>
                      studentId != null && setTeacher(studentId, value)
                    }
                    groups={teacherRemarkGroups(rc.summary?.average)}
                  />
                  <RemarkCombobox
                    id={`principal-remark-${studentId}`}
                    label="Principal's Remark"
                    placeholder="Type or select a remark"
                    value={remark.principal}
                    onChange={(value) =>
                      studentId != null && setPrincipal(studentId, value)
                    }
                    groups={principalRemarkGroups(rc.summary?.average)}
                  />
                </div>
              </div>

              <ReportCardSheet
                student={student}
                reportCard={rc}
                academicYear={academicYear}
                term={term}
                nextTermFee={nextTermFee}
                nextTermBegins={nextTermBegins}
                teacherRemark={remark.teacher}
                principalRemark={remark.principal}
              />
            </div>
          );
        })}
      </div>
    </div>,
    document.body
  );
}
