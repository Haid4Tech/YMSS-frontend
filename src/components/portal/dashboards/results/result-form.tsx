import { FC, useState, useEffect } from "react";
import { InputField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { Student } from "@/jotai/students/student-types";
import { Subject } from "@/jotai/subject/subject-types";
import { Grade } from "@/jotai/grades/grades-types";

interface UpdateResultFormProps {
  result?: Grade | null;
  student?: Student;
  subject?: Subject;
  onFormSubmit?: (resultData: Partial<Grade>) => Promise<void>;
  loading?: boolean;
  onFormDataChange?: (formData: Partial<Grade>) => void;
}

interface FormData {
  ca1?: number;
  ca2?: number;
  examScore?: number;
  ltc?: number;
  overallScore?: number;
  grade?: string;
  subjectPosition?: number;
  remark?: string;
}

const UpdateResultForm: FC<UpdateResultFormProps> = ({
  result,
  student,
  subject,
  onFormSubmit,
  loading = false,
  onFormDataChange,
}) => {
  const [formData, setFormData] = useState<FormData>({});

  // Initialize form data when result or props change
  useEffect(() => {
    if (result) {
      setFormData({
        ca1: result.ca1,
        ca2: result.ca2,
        examScore: result.examScore,
        ltc: result.ltc,
        overallScore: result.overallScore,
        grade: result.grade,
        subjectPosition: result.subjectPosition,
        remark: result.remark,
      });
    } else {
      // Reset to default values for new result
      setFormData({});
    }
  }, [result]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    const numericFields: (keyof FormData)[] = [
      "ca1",
      "ca2",
      "examScore",
      "ltc",
      "overallScore",
      "subjectPosition",
    ];

    let newFormData: FormData;
    if (numericFields.includes(field)) {
      const numValue = value === "" ? undefined : parseFloat(value);
      newFormData = { ...formData, [field]: numValue };
    } else {
      newFormData = { ...formData, [field]: value || undefined };
    }

    // Auto-recalculate overall score and grade when individual scores change
    if (["ca1", "ca2", "examScore", "ltc"].includes(field)) {
      const ca1 = newFormData.ca1 || 0;
      const ca2 = newFormData.ca2 || 0;
      const exam = newFormData.examScore || 0;
      const ltc = newFormData.ltc || 0;

      // Calculate overall score: (CA1 + CA2 + Exam + LTC) / 2
      const total = ca1 + ca2 + exam + ltc;
      const overallScore = total > 0 ? total / 2 : undefined;
      newFormData.overallScore = overallScore;

      // Calculate grade based on overall score
      if (overallScore !== undefined) {
        let grade = "F";
        if (overallScore >= 80) grade = "A";
        else if (overallScore >= 65) grade = "B";
        else if (overallScore >= 50) grade = "C";
        else if (overallScore >= 40) grade = "D";
        newFormData.grade = grade;
      } else {
        newFormData.grade = undefined;
      }
    }

    setFormData(newFormData);

    // Notify parent component of form data changes
    if (onFormDataChange) {
      onFormDataChange(newFormData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onFormSubmit) {
      try {
        await onFormSubmit(formData);
      } catch (error) {
        console.error("Failed to update result:", error);
      }
    }
  };

  const calculateOverallScore = () => {
    const ca1 = formData.ca1 || 0;
    const ca2 = formData.ca2 || 0;
    const exam = formData.examScore || 0;
    const ltc = formData.ltc || 0;

    // Backend calculation: (CA1 + CA2 + Exam + LTC) / 2
    const total = ca1 + ca2 + exam + ltc;
    const overallScore = total > 0 ? total / 2 : undefined;

    const newFormData = { ...formData, overallScore };
    setFormData(newFormData);

    // Notify parent component of form data changes
    if (onFormDataChange) {
      onFormDataChange(newFormData);
    }
  };

  const calculateGrade = () => {
    if (formData.overallScore === undefined) return;

    const score = formData.overallScore;
    let grade = "F";

    // Backend grade thresholds: A≥80, B≥65, C≥50, D≥40, F<40
    if (score >= 80) grade = "A";
    else if (score >= 65) grade = "B";
    else if (score >= 50) grade = "C";
    else if (score >= 40) grade = "D";

    const newFormData = { ...formData, grade };
    setFormData(newFormData);

    // Notify parent component of form data changes
    if (onFormDataChange) {
      onFormDataChange(newFormData);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student and Subject Info */}
        {student && subject && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              Student Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-600">Student:</Label>
                <p className="font-medium">
                  {student?.user?.firstname} {student?.user?.lastname}
                </p>
              </div>
              <div>
                <Label className="text-gray-600">Subject:</Label>
                <p className="font-medium">{subject?.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Scores */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900">Scores</h3>
            <p className="text-sm text-gray-600 mt-1">
              Overall Score = (CA1 + CA2 + Exam + LTC) / 2 | Grade: A≥80%,
              B≥65%, C≥50%, D≥40%, F&lt;40%
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="CA1 Score (0-20)"
              type="number"
              placeholder="Enter CA1 score"
              value={formData.ca1?.toString() || ""}
              onChange={(e) => handleInputChange("ca1", e.target.value)}
              min="0"
              max="20"
              step="0.1"
              name="ca1"
            />
            <InputField
              label="CA2 Score (0-20)"
              type="number"
              placeholder="Enter CA2 score"
              value={formData.ca2?.toString() || ""}
              onChange={(e) => handleInputChange("ca2", e.target.value)}
              min="0"
              max="20"
              step="0.1"
              name="ca2"
            />
            <InputField
              label="Exam Score (0-60)"
              type="number"
              placeholder="Enter exam score"
              value={formData.examScore?.toString() || ""}
              onChange={(e) => handleInputChange("examScore", e.target.value)}
              min="0"
              max="60"
              step="0.1"
              name="examScore"
            />
            <InputField
              label="LTC Score (0-100)"
              type="number"
              placeholder="Enter LTC score"
              value={formData.ltc?.toString() || ""}
              onChange={(e) => handleInputChange("ltc", e.target.value)}
              min="0"
              max="100"
              step="0.1"
              name="ltc"
            />
          </div>

          {/* Calculation Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                calculateOverallScore();
                calculateGrade();
              }}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Recalculate All
            </button>
            <button
              type="button"
              onClick={calculateOverallScore}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Calculate Overall
            </button>
            <button
              type="button"
              onClick={calculateGrade}
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              Calculate Grade
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="overallScore" className="text-sm font-semibold">
                Overall Score
              </label>
              <div className="flex items-center h-10 border border-input rounded-sm bg-gray-50">
                <p className="ml-2 font-medium">
                  {formData.overallScore !== undefined
                    ? `${formData.overallScore.toFixed(1)}%`
                    : "Not calculated"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="grade" className="text-sm font-semibold">
                Grade
              </label>
              <div className="flex items-center h-10 border border-input rounded-sm bg-gray-50">
                <p className="ml-2 font-medium">
                  {formData.grade || "Not calculated"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <label htmlFor="subjectPosition" className="text-sm font-semibold">
              Subject Position
            </label>
            <div className="flex items-center h-10 border border-input rounded-sm">
              <p className="ml-2">
                {formData.subjectPosition?.toString() || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Hidden submit button - will be triggered by modal */}
        <button type="submit" className="hidden" disabled={loading}>
          {loading ? "Updating..." : "Update Result"}
        </button>
      </form>
    </div>
  );
};

export { UpdateResultForm };
