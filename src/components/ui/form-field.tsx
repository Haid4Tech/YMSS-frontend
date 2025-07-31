"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Base FormField wrapper for consistent spacing
interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  children,
  htmlFor,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor} className="px-1">
        {label}
        {required && " *"}
      </Label>
      {children}
    </div>
  );
};

// InputField - Label + Input combination
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  required,
  ...inputProps
}) => {
  return (
    <FormField label={label} required={required} htmlFor={inputProps.id}>
      <Input {...inputProps} />
    </FormField>
  );
};

// SelectField - Label + Select combination
interface SelectFieldProps {
  label: string;
  required?: boolean;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  required,
  value,
  onValueChange,
  placeholder,
  children,
}) => {
  return (
    <FormField label={label} required={required}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </FormField>
  );
};

// TextareaField - Label + Textarea combination
interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  required,
  ...textareaProps
}) => {
  return (
    <FormField label={label} required={required} htmlFor={textareaProps.id}>
      <Textarea {...textareaProps} />
    </FormField>
  );
};
