"use client";

import Image from "next/image";
import { Student } from "@/jotai/students/student-types";
import { ReportCard } from "@/jotai/grades/grades-types";

/*
  |--------------------------------------------------------------------------
  | REPORT CARD SHEET
  |--------------------------------------------------------------------------
  | Official Yola Model School "Student's Continuous Assessment Report Sheet".
  | Rebuilt to mirror the printed school form. Real values are pulled from the
  | compiled report-card payload where they exist; affective traits carry the
  | school's default ratings and remarks are derived from each subject's grade.
  | The remaining cells (house, fees, teacher comments, term dates) are left
  | blank so the sheet can be filled in by hand after printing.
  |
  | Column key (matches the printed sheet):
  |   A 1st CA        -> ca1
  |   B 2nd CA        -> ca2
  |   C Total (a+b)   -> caTotal
  |   D Exams         -> examScore
  |   E Total (c+d)   -> totalScore
  |   F LTC           -> ltc
  |   G Overall       -> overallScore
  |   H Class Average -> classAverage
  |   I Grade         -> grade
  |   J Position      -> subjectPosition
  |   K Remark        -> remark
*/

const TERM_LABEL: Record<string, string> = {
  FIRST: "1st",
  SECOND: "2nd",
  THIRD: "3rd",
};

const GRADING_SCALE = [
  { range: "0 - 39.99", grade: "F" },
  { range: "40 - 49.99", grade: "D" },
  { range: "50 - 64.99", grade: "C" },
  { range: "65 - 79.99", grade: "B" },
  { range: "80 - 100", grade: "A" },
];

// Remark shown against each subject, derived from the letter grade to match
// the printed report sheet's remark column.
const GRADE_REMARK: Record<string, string> = {
  A: "EXCELLENT",
  B: "V.GOOD",
  C: "GOOD",
  D: "FAIR",
  F: "POOR",
};

const gradeRemark = (grade?: string) => (grade ? GRADE_REMARK[grade] ?? "" : "");

// Character / affective traits with the default ratings printed on the school's
// report sheet. Tuple order: [leftLabel, leftRating, rightLabel, rightRating].
const AFFECTIVE_TRAITS: Array<[string, string, string, string]> = [
  ["Attendance", "A", "Relationship with others", "A"],
  ["Punctuality", "A", "Sense of responsibility", "A"],
  ["Neatness", "B", "Initiative", "B"],
  ["Politeness", "C", "Perseverance", "C"],
  ["Self-control", "B", "Honesty", "B"],
];

const getOrdinalSuffix = (num: number) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
};

const ordinal = (num?: number | null) =>
  num ? `${num}${getOrdinalSuffix(num)}` : "";

const getAge = (dob?: string) => {
  if (!dob) return "";
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return "";
  const diff = Date.now() - birth.getTime();
  return String(Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
};

const fmt = (value?: number | null, digits = 1) =>
  value || value === 0 ? value.toFixed(digits) : "";

interface ReportCardSheetProps {
  student: Student;
  reportCard: ReportCard;
  academicYear: string;
  term: "FIRST" | "SECOND" | "THIRD";
  /** Next term's fee, e.g. "N33,000.00". Filled into the FEES section. */
  nextTermFee?: string;
  /** Date the next term commences, e.g. "4th May, 2026". */
  nextTermBegins?: string;
  /** Form teacher's remark shown in the comment section. */
  teacherRemark?: string;
  /** Principal's remark shown in the comment section. */
  principalRemark?: string;
}

export function ReportCardSheet({
  student,
  reportCard,
  academicYear,
  term,
  nextTermFee,
  nextTermBegins,
  teacherRemark,
  principalRemark,
}: ReportCardSheetProps) {
  const { summary, results } = reportCard;

  const fullName = `${student?.user?.firstname ?? ""} ${
    student?.user?.lastname ?? ""
  }`.trim();
  const className = reportCard.class?.name ?? student?.class?.name ?? "";

  return (
    <div className="report-sheet mx-auto w-full max-w-4xl overflow-x-auto rounded-md border bg-white p-4 text-black shadow-sm sm:p-8 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
      <div className="report-sheet-inner min-w-[720px] font-serif">
        {/* ===== Header ===== */}
        <div className="relative mb-3 text-center">
          <h1 className="text-xl font-bold uppercase tracking-wide sm:text-2xl">
            Yola Model School, Yola-Town
          </h1>
          <p className="text-xs sm:text-sm">P.O. Box 3432, Yola-Town.</p>
          <p className="text-xs sm:text-sm">Adamawa State</p>
          <h2 className="mt-1 text-sm font-bold uppercase sm:text-base">
            Student&apos;s Continuous Assessment Report Sheet
          </h2>
          <div className="absolute right-0 top-0 h-16 w-16 sm:h-20 sm:w-20">
            <Image
              src="/ymss_logo_bw.png"
              alt="Yola Model School logo"
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>
        </div>

        {/* ===== Name ===== */}
        <div className="border border-black px-3 py-1 text-center text-sm font-bold">
          NAME: <span className="uppercase">{fullName}</span>
        </div>

        {/* ===== Bio / term meta ===== */}
        <table className="mt-2 w-full border-collapse text-xs">
          <tbody>
            <tr>
              <MetaCell label="Average Age" value={getAge(student?.user?.DOB)} />
              <MetaCell label="Class" value={className} />
              <MetaCell label="Admission No" value={student?.admissionNumber} />
              <MetaCell label="House" value="" />
              <MetaCell label="Class Size" value={summary?.classSize} />
              <MetaCell label="Average in Class" value="" />
            </tr>
            <tr>
              <MetaCell label="Session" value={academicYear} />
              <MetaCell label="Term" value={`${TERM_LABEL[term] ?? ""}`} />
              <MetaCell label="Term commenced" value="" />
              <MetaCell label="Term Ended" value="" />
              <MetaCell label="Total Attendance" value="" />
              <MetaCell label="Out of" value="" />
            </tr>
          </tbody>
        </table>

        {/* ===== Subjects table ===== */}
        <table className="mt-3 w-full border-collapse text-center text-[11px]">
          <thead>
            <tr className="font-bold">
              <th rowSpan={2} className="border border-black px-2 py-1 text-left">
                Subjects
              </th>
              <ColHead letter="A" />
              <ColHead letter="B" />
              <ColHead letter="C" />
              <ColHead letter="D" />
              <ColHead letter="E" />
              <ColHead letter="F" />
              <ColHead letter="G" />
              <ColHead letter="H" />
              <ColHead letter="I" />
              <ColHead letter="J" />
              <ColHead letter="K" />
            </tr>
            <tr className="text-[10px] font-semibold">
              <SubHead label="1st CA" />
              <SubHead label="2nd CA" />
              <SubHead label="Total (a+b)" />
              <SubHead label="Exams" />
              <SubHead label="Total (c+d)" />
              <SubHead label="LTC" />
              <SubHead label="Overall (c+f)/2" />
              <SubHead label="Class Average" />
              <SubHead label="Grade" />
              <SubHead label="Subject Position" />
              <SubHead label="Remark" />
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                <td className="border border-black px-2 py-1 text-left font-medium">
                  {r.subject?.name}
                </td>
                <BodyCell value={fmt(r.ca1, 0)} />
                <BodyCell value={fmt(r.ca2, 0)} />
                <BodyCell value={fmt(r.caTotal, 0)} />
                <BodyCell value={fmt(r.examScore, 0)} />
                <BodyCell value={fmt(r.totalScore, 0)} />
                <BodyCell value={fmt(r.ltc, 0)} />
                <BodyCell value={fmt(r.overallScore)} />
                <BodyCell value={fmt(r.classAverage)} />
                <BodyCell value={r.grade ?? ""} bold />
                <BodyCell value={ordinal(r.subjectPosition)} />
                <BodyCell value={r.remark || gradeRemark(r.grade)} uppercase />
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== Totals ===== */}
        <table className="mt-2 w-full border-collapse text-xs">
          <tbody>
            <tr>
              <MetaCell label="Number of Subjects" value={summary?.numberOfSubjects} />
              <MetaCell label="Marks Obtainable" value={summary?.marksObtainable} />
              <MetaCell
                label="Total Marks Obtained"
                value={fmt(summary?.totalMarksObtained)}
              />
              <MetaCell label="Average" value={fmt(summary?.average)} />
              <MetaCell label="Previous Average" value="" />
            </tr>
          </tbody>
        </table>

        {/* ===== Affective / psychomotor traits ===== */}
        <table className="mt-3 w-full border-collapse text-xs">
          <tbody>
            {AFFECTIVE_TRAITS.map(([left, leftRating, right, rightRating]) => (
              <tr key={left}>
                <td className="w-1/4 border border-black px-2 py-1 font-medium">
                  {left}
                </td>
                <td className="w-1/4 border border-black px-2 py-1 text-center font-semibold">
                  {leftRating}
                </td>
                <td className="w-1/4 border border-black px-2 py-1 font-medium">
                  {right}
                </td>
                <td className="w-1/4 border border-black px-2 py-1 text-center font-semibold">
                  {rightRating}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== Fees ===== */}
        <table className="mt-3 w-full border-collapse text-xs">
          <tbody>
            <tr>
              <td className="border border-black bg-gray-100 px-2 py-1 text-center font-bold" colSpan={2}>
                FEES
              </td>
            </tr>
            <tr>
              <td className="w-1/2 border border-black px-2 py-1 font-medium">
                Next term&apos;s fee
              </td>
              <td className="w-1/2 border border-black px-2 py-1">
                {nextTermFee ?? ""}
              </td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1 font-medium">
                Next term commences
              </td>
              <td className="border border-black px-2 py-1">
                {nextTermBegins ?? ""}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ===== Grading key + comments ===== */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Grading */}
          <table className="w-full self-start border-collapse text-xs">
            <tbody>
              <tr>
                <td
                  className="border border-black bg-gray-100 px-2 py-1 text-center font-bold"
                  colSpan={2}
                >
                  GRADING
                </td>
              </tr>
              {GRADING_SCALE.map((g) => (
                <tr key={g.grade}>
                  <td className="w-2/3 border border-black px-2 py-1">
                    {g.range}
                  </td>
                  <td className="border border-black px-2 py-1 text-center font-semibold">
                    {g.grade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Comments */}
          <div className="border border-black text-xs">
            <div className="border-b border-black bg-gray-100 px-2 py-1 text-center font-bold">
              TEACHER/PRINCIPAL&apos;S COMMENT
            </div>
            <div className="space-y-4 px-2 py-3">
              <div className="flex items-end justify-between gap-2">
                <p className="font-medium">
                  Form teacher&apos;s Remark:{" "}
                  <span className="font-normal">{teacherRemark ?? ""}</span>
                </p>
                <span className="text-nowrap text-muted-foreground">
                  Sign................
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <p className="font-medium">
                  Principal&apos;s Remark:{" "}
                  <span className="font-normal">{principalRemark ?? ""}</span>
                </p>
                <span className="text-nowrap text-muted-foreground">
                  Sign................
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- small cell helpers ---------- */

function MetaCell({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <td className="border border-black px-2 py-1 align-top">
      <span className="font-semibold">{label}:</span>{" "}
      <span>{value === 0 || value ? value : ""}</span>
    </td>
  );
}

function ColHead({ letter }: { letter: string }) {
  return (
    <th className="w-[7%] border border-black px-1 py-1 italic">{letter}</th>
  );
}

function SubHead({ label }: { label: string }) {
  return <th className="border border-black px-1 py-1 text-[8px] leading-none">{label}</th>;
}

function BodyCell({
  value,
  bold,
  uppercase,
}: {
  value: string;
  bold?: boolean;
  uppercase?: boolean;
}) {
  return (
    <td
      className={`border border-black px-1 py-1 ${bold ? "font-bold" : ""} ${
        uppercase ? "uppercase" : ""
      }`}
    >
      {value || "-"}
    </td>
  );
}
