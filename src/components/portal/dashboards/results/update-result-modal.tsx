"use client";

import { FC } from "react";
import { Modal } from "@/components/ui/modal";
import { UpdateResultForm } from "./result-form";

import { Grade } from "@/jotai/grades/grades-types";
import { Student } from "@/jotai/students/student-types";
import { Subject } from "@/jotai/subject/subject-types";

interface IUpdateResult {
  onUpdate?: () => void;
  result?: Grade | null;
  student?: Student;
  subject?: Subject;
  onFormSubmit?: (resultData: Partial<Grade>) => Promise<void>;
  loading?: boolean;
  triggerText?: string;
  modalTitle?: string;
  modalDescription?: string;
  btnText?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  onFormDataChange?: (formData: Partial<Grade>) => void;
}

const UpdateResult: FC<IUpdateResult> = ({
  onUpdate,
  result,
  student,
  subject,
  onFormSubmit,
  loading = false,
  triggerText = "Update Results",
  modalTitle = "Results Modal",
  modalDescription = "Update Students Result and Grades",
  btnText = "save changes",
  open,
  onOpenChange,
  hideTrigger = false,
  onFormDataChange,
}) => {
  const handleModalAction = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Call the onUpdate function which will handle form submission with current form data
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <div>
      <Modal
        content={
          <UpdateResultForm
            result={result}
            student={student}
            subject={subject}
            onFormSubmit={onFormSubmit}
            loading={loading}
            onFormDataChange={onFormDataChange}
          />
        }
        onAction={handleModalAction}
        btnText={btnText}
        modalTitle={modalTitle}
        triggerText={triggerText}
        modalDescription={modalDescription}
        open={open}
        onOpenChange={onOpenChange}
        hideTrigger={hideTrigger}
        maxWidth="sm:max-w-[600px]"
      />
    </div>
  );
};

export { UpdateResult };
