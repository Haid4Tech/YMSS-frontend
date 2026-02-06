"use client";

/**
 * Form Field Components
 *
 * All components support an optional Icon prop of type LucideIcon.
 * The icon will be displayed next to the label with a size of 15px.
 *
 * Usage:
 * <InputField Icon={User} label="Username" />
 * <PasswordField label="Password" placeholder="Enter your password" />
 * <SelectField Icon={Mail} label="Email" />
 * <TextareaField Icon={MessageSquare} label="Bio" />
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, LucideIcon } from "lucide-react";

// Base FormField wrapper for consistent spacing
interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
  Icon?: LucideIcon;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  children,
  htmlFor,
  Icon,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className={"flex flex-row gap-1"}>
        {Icon && <Icon size={15} />}
        <Label htmlFor={htmlFor} className="px-1">
          {label}
          {required && " *"}
        </Label>
      </div>
      {children}
    </div>
  );
};

// InputField - Label + Input combination
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  Icon?: LucideIcon;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  required,
  Icon,
  ...inputProps
}) => {
  return (
    <FormField
      Icon={Icon}
      label={label}
      required={required}
      htmlFor={inputProps.id}
    >
      <Input {...inputProps} />
    </FormField>
  );
};

// PasswordField - Label + Input with show/hide toggle
interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  required?: boolean;
  Icon?: LucideIcon;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  required,
  Icon,
  id,
  className,
  ...inputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <FormField Icon={Icon} label={label} required={required} htmlFor={id}>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          {...inputProps}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((p) => !p)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff size={18} aria-hidden />
          ) : (
            <Eye size={18} aria-hidden />
          )}
        </button>
      </div>
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
  Icon?: LucideIcon;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  required,
  value,
  onValueChange,
  placeholder,
  children,
  Icon,
}) => {
  return (
    <FormField label={label} required={required} Icon={Icon}>
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
  Icon?: LucideIcon;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  required,
  Icon,
  ...textareaProps
}) => {
  return (
    <FormField
      label={label}
      required={required}
      htmlFor={textareaProps.id}
      Icon={Icon}
    >
      <Textarea {...textareaProps} />
    </FormField>
  );
};
