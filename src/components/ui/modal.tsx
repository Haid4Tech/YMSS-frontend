import { FC, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface IModal {
  content: ReactNode;
  onAction: () => void;
  btnText: string;
  modalTitle: string;
  triggerText: string;
  modalDescription: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  maxWidth?: string;
}

const Modal: FC<IModal> = ({
  content,
  onAction,
  btnText,
  triggerText,
  modalTitle,
  modalDescription,
  open,
  onOpenChange,
  hideTrigger = false,
  maxWidth = "sm:max-w-[425px]",
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline">{triggerText}</Button>
        </DialogTrigger>
      )}
      <DialogContent className={maxWidth}>
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">{content}</div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onAction}>{btnText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { Modal };
