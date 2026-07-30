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
import { ReportCardSheet } from "@/components/portal/students/report-card-sheet";
import {
  formatFeeInput,
  formatNaira,
  formatTermDate,
} from "@/components/portal/students/report-fees";

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
  students: Student[];
  className?: string;
}

/*
  Admin-only batch printing of student report cards for a class.

  The admin first supplies the shared term settings (academic year, term and the
  "next term's fee" / "next term commences" values printed on every sheet). We
  then fetch each student's compiled report card, drop those with no results,
  and render one report sheet per printed page inside a full-screen preview
  portal that they can review and print.
*/
export function BatchReportPrint({
  students,
  className,
}: BatchReportPrintProps) {
  const [, getReportCard] = useAtom(gradesAPI.getReportCard);

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
      const settled = await Promise.all(
        students.map(async (student) => {
          try {
            const rc = (await getReportCard(
              student.id,
              academicYear,
              term
            )) as ReportCard | null;
            return rc && rc.results?.length ? rc : null;
          } catch {
            return null;
          }
        })
      );

      const valid = settled.filter((rc): rc is ReportCard => rc !== null);

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
          const student = studentsById.get(rc.student?.id) ?? rc.student;
          return (
            <div key={rc.student?.id} className="report-page">
              <ReportCardSheet
                student={student}
                reportCard={rc}
                academicYear={academicYear}
                term={term}
                nextTermFee={nextTermFee}
                nextTermBegins={nextTermBegins}
              />
            </div>
          );
        })}
      </div>
    </div>,
    document.body
  );
}
