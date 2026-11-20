"use client";

import { useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { userAtom } from "@/jotai/auth/auth";
import { useAcademicPeriod } from "@/components/portal/academic-period/academic-period-provider";
import { AcademicPeriodFields } from "@/components/portal/dashboards/results/academic-period-fields";
import { PageHeader } from "@/components/general/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/form-field";
import { SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { defaultPromotionDestination, promotionDestinations } from "@/lib/promotions/default-destination";
import { promotionsAPI, PromotionBatch, PromotionClass, PromotionDecision, PromotionOutcome, PromotionRoster } from "@/jotai/promotions/promotions";

const labels: Record<PromotionOutcome, string> = { PROMOTE: "Promote", REPEAT: "Repeat", GRADUATE: "Graduate", WITHDRAW: "Withdraw" };
const inputClass = "h-10 w-full rounded-md border bg-background px-3 text-sm";
function message(error: unknown) {
  return (error as { response?: { data?: { error?: string } } })?.response?.data?.error || (error instanceof Error ? error.message : "Unable to process promotions");
}

export default function PromotionsPage() {
  const user = useAtomValue(userAtom);
  const { academicYear, term, setPeriod } = useAcademicPeriod();
  const [classes, setClasses] = useState<PromotionClass[]>([]);
  const [sourceClassId, setSourceClassId] = useState("");
  const [roster, setRoster] = useState<PromotionRoster | null>(null);
  const [decisions, setDecisions] = useState<Record<number, PromotionDecision>>({});
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState<PromotionBatch | null>(null);
  const [revision, setRevision] = useState(0);
  const generation = useRef(0);
  const destinationStart = Number(academicYear.split("/")[0]) + 1;
  const destinationAcademicYear = `${destinationStart}/${destinationStart + 1}`;
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) return;
    promotionsAPI.classes().then(setClasses).catch(e => setError(message(e)));
  }, [isAdmin]);

  useEffect(() => {
    generation.current++;
    setRoster(null);
    setDecisions({});
    setReviewed(null);
    setError(null);
    setLoading(false);
    if (!isAdmin || !sourceClassId) return;
    const abort = new AbortController();
    setLoading(true);
    promotionsAPI.roster({ sourceClassId: Number(sourceClassId), sourceAcademicYear: academicYear, destinationAcademicYear }, abort.signal)
      .then(data => { if (!abort.signal.aborted) setRoster(data); })
      .catch(e => { if (!abort.signal.aborted) setError(message(e)); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [isAdmin, sourceClassId, academicYear, destinationAcademicYear, revision]);

  if (!isAdmin) return <p className="py-10 text-center text-muted-foreground">Promotions are available to administrators only.</p>;

  const destinationsFor = (outcome: PromotionOutcome) => {
    return roster ? promotionDestinations(roster.sourceClass, roster.destinationClasses, outcome) : [];
  };
  const eligible = roster?.students.filter(s => !s.promotionDecisions.length && s.classId === Number(sourceClassId) && s.schoolStatus === "ACTIVE" && (!s.currentAcademicYear || s.currentAcademicYear === academicYear)) ?? [];
  const defaultDecision = (studentId: number, outcome: PromotionOutcome): PromotionDecision => {
    const destination = roster
      ? defaultPromotionDestination(roster.sourceClass, roster.destinationClasses, outcome)
      : null;
    return { studentId, outcome, destinationClassId: destination?.id ?? null, subjectIds: destination?.subjects.map(s => s.id) ?? [], notes: "" };
  };
  const updateDecision = (decision: PromotionDecision) => { setDecisions(prev => ({ ...prev, [decision.studentId]: decision })); setReviewed(null); };
  const prepareReview = async () => {
    const request = generation.current;
    const batch: PromotionBatch = { sourceClassId: Number(sourceClassId), sourceAcademicYear: academicYear, destinationAcademicYear, decisions: Object.values(decisions) };
    setBusy(true);
    setError(null);
    try {
      await promotionsAPI.review(batch);
      if (generation.current === request) setReviewed(batch);
    } catch (e) { if (generation.current === request) setError(message(e)); }
    finally { setBusy(false); }
  };
  const apply = async () => {
    if (!reviewed || busy) return;
    setBusy(true);
    try {
      const result = await promotionsAPI.apply(reviewed);
      toast.success(`${result.processed} student decision(s) applied for ${reviewed.destinationAcademicYear}.`);
      setReviewed(null);
      setRevision(v => v + 1);
    } catch (e) { setError(message(e)); setReviewed(null); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Promotions" subtitle="Review annual class changes and new-session subject enrolments." />
      <Card>
        <CardHeader><CardTitle>Source session and class</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <AcademicPeriodFields academicYear={academicYear} term={term} onChange={setPeriod} disabled={busy} />
          <p className="text-sm text-muted-foreground">Promotions cover the whole academic session, regardless of term. Destination session: <strong>{destinationAcademicYear}</strong>.</p>
          <div className="max-w-xl">
            <SelectField label="Source class" value={sourceClassId} onValueChange={value => { if (!busy) setSourceClassId(value); }} placeholder="Select the class to process">
              {classes.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectField>
          </div>
          <p className="text-sm text-muted-foreground">Existing classes can be reused each session. Configure their grade levels, streams and subjects before applying promotions. <Link href="/portal/classes" className="underline">Manage classes</Link></p>
        </CardContent>
      </Card>
      {error && <p role="alert" className="rounded-md border border-destructive p-4 text-destructive">{error}</p>}
      {loading && <p role="status">Loading promotion roster...</p>}
      {roster && !loading && <>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{roster.sourceClass.name} · {roster.students.length} students</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={busy || !eligible.length} onClick={() => {
              const outcome = roster.sourceClass.gradeLevel === "SS3" ? "GRADUATE" : "PROMOTE";
              setDecisions(Object.fromEntries(eligible.map(s => [s.id, defaultDecision(s.id, outcome)])));
            }}>Propose for all eligible students</Button>
            <Button variant="outline" disabled={busy || !Object.keys(decisions).length} onClick={() => setDecisions({})}>Clear selections</Button>
          </div>
        </div>
        {!roster.students.length && <p className="text-muted-foreground">No students found in this class for {academicYear}.</p>}
        <div className="space-y-4">
          {roster.students.map(student => {
            const decision = decisions[student.id];
            const completed = student.promotionDecisions[0];
            const canProcess = eligible.some(s => s.id === student.id);
            const destination = roster.destinationClasses.find(c => c.id === decision?.destinationClassId);
            return <Card
              key={student.id}
              className={`relative transition-colors ${decision ? "border-primary bg-primary/5" : canProcess && !busy ? "hover:border-primary/40" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="after:absolute after:inset-0 after:rounded-xl after:cursor-pointer focus-visible:after:ring-2 focus-visible:after:ring-ring disabled:after:cursor-default"
                    aria-label={`Select ${student.user.firstname} ${student.user.lastname ?? ""}`} checked={!!decision} disabled={busy || !canProcess} onCheckedChange={checked => {
                    if (checked) updateDecision(defaultDecision(student.id, roster.sourceClass.gradeLevel === "SS3" ? "GRADUATE" : "PROMOTE"));
                    else setDecisions(prev => { const next = { ...prev }; delete next[student.id]; return next; });
                  }} />
                  <div><CardTitle className="text-base">{student.user.firstname} {student.user.lastname}</CardTitle><p className="text-sm text-muted-foreground">{student.admissionNumber || `Student #${student.id}`}</p></div>
                </div>
                {completed && <p className="text-sm text-muted-foreground">Applied: {labels[completed.outcome]}{completed.destinationClass ? ` → ${completed.destinationClass.name}` : ""} for {destinationAcademicYear}, by {completed.appliedBy.firstname} {completed.appliedBy.lastname} on {new Date(completed.appliedAt).toLocaleDateString()}.</p>}
                {!canProcess && !completed && <p className="text-sm text-muted-foreground">This student is no longer active in the source session.</p>}
              </CardHeader>
              {decision && <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="relative z-10 space-y-2"><Label htmlFor={`outcome-${student.id}`}>Decision</Label><select id={`outcome-${student.id}`} className={inputClass} value={decision.outcome} disabled={busy} onChange={e => updateDecision({ ...defaultDecision(student.id, e.target.value as PromotionOutcome), notes: decision.notes })}>
                    {Object.entries(labels).filter(([value]) => value !== "GRADUATE" || roster.sourceClass.gradeLevel === "SS3").map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select></div>
                  {(decision.outcome === "PROMOTE" || decision.outcome === "REPEAT") && <div className="relative z-10 space-y-2"><Label htmlFor={`destination-${student.id}`}>Destination class</Label><select id={`destination-${student.id}`} className={inputClass} value={decision.destinationClassId ?? ""} disabled={busy} onChange={e => {
                    const selected = roster.destinationClasses.find(c => c.id === Number(e.target.value));
                    updateDecision({ ...decision, destinationClassId: selected?.id ?? null, subjectIds: selected?.subjects.map(s => s.id) ?? [] });
                  }}><option value="">Choose a destination class</option>{destinationsFor(decision.outcome).map(c => <option key={c.id} value={c.id}>{c.name}{c.stream ? ` · ${c.stream}` : ""}</option>)}</select>
                    {!destinationsFor(decision.outcome).length && <p className="text-sm text-amber-700">No destination classes configured for this grade level. Set the class grade level in Classes.</p>}
                  </div>}
                </div>
                {destination && <div className="space-y-2"><p className="text-sm font-medium">New-session subjects · {destination.subjects.length}</p>
                  {!destination.subjects.length && <p className="text-sm text-destructive">Configure subjects for this class before applying promotions.</p>}
                  <div className="flex flex-wrap gap-4">{destination.subjects.map(subject => <label key={subject.id} className="relative z-10 flex items-center gap-2 text-sm"><Checkbox checked={decision.subjectIds.includes(subject.id)} disabled={busy || !subject.isElective} onCheckedChange={checked => updateDecision({ ...decision, subjectIds: checked ? [...decision.subjectIds, subject.id] : decision.subjectIds.filter(id => id !== subject.id) })} />{subject.name} ({subject.isElective ? "elective" : "compulsory"})</label>)}</div>
                </div>}
                <div className="relative z-10 space-y-2"><Label htmlFor={`notes-${student.id}`}>Decision notes (optional)</Label><Input id={`notes-${student.id}`} maxLength={1000} value={decision.notes} disabled={busy} onChange={e => updateDecision({ ...decision, notes: e.target.value })} /></div>
              </CardContent>}
            </Card>;
          })}
        </div>
        <Button disabled={busy || !Object.keys(decisions).length} onClick={prepareReview}>{busy ? "Validating..." : `Review ${Object.keys(decisions).length} decision(s)`}</Button>
      </>}
      <Dialog open={!!reviewed} onOpenChange={open => { if (!open && !busy) setReviewed(null); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Apply promotions for {reviewed?.destinationAcademicYear}?</DialogTitle><DialogDescription>This updates current classes and creates new-session subject enrolments. Previous results, enrolments and attendance remain unchanged.</DialogDescription></DialogHeader>
          <ul className="space-y-2 text-sm">{reviewed?.decisions.map(d => {
            const student = roster?.students.find(s => s.id === d.studentId);
            const destination = roster?.destinationClasses.find(c => c.id === d.destinationClassId);
            return <li key={d.studentId}>{student?.user.firstname} {student?.user.lastname}: {labels[d.outcome]}{destination ? ` → ${destination.name} (${d.subjectIds.length} subjects)` : ""}</li>;
          })}</ul>
          <DialogFooter><Button variant="outline" disabled={busy} onClick={() => setReviewed(null)}>Back to decisions</Button><Button disabled={busy} onClick={apply}>{busy ? "Applying..." : "Apply decisions"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
