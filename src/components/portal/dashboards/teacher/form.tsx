"use client";

import { Dispatch, FC, SetStateAction, ChangeEvent } from "react";
import Link from "next/link";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import FormDate from "@/components/general/form-date";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/components/ui/form-field";
import { LucideIcon } from "lucide-react";
import { Gender } from "@/common/enum";
import { ITeacherFormData } from "@/common/types";
import { Subject } from "@/jotai/subject/subject-types";
import { CountrySelector, ReligionSelector } from "@/components/ui/selectors";

export interface ITeacherDateFormValues {
  DOB: Date | undefined;
  hireDate: Date | undefined;
}

interface ITabs {
  id: string;
  label?: string;
  Icon?: LucideIcon;
}

interface ITeacherForm {
  type: "create" | "update";
  onSubmit: (e: React.FormEvent) => Promise<void>;
  tabs: ITabs[];
  subjects: Subject[];
  loading: boolean;
  dateForm: UseFormReturn<ITeacherDateFormValues>;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  handleInputChange: (field: string, value: string) => void;
  handleFileChange: (file: ChangeEvent<HTMLInputElement>) => void;
  onSubjectsChange: (subjectIds: number[]) => void;
  formData?: ITeacherFormData | null;
}

const TeacherForm: FC<ITeacherForm> = ({
  type,
  onSubmit,
  tabs,
  dateForm,
  subjects,
  loading,
  activeTab,
  setActiveTab,
  handleInputChange,
  handleFileChange,
  onSubjectsChange,
  formData,
}) => {
  const selectedSubjectIds = formData?.subjectIds ?? [];

  const toggleSubject = (subjectId: number, checked: boolean) => {
    if (checked) {
      onSubjectsChange([...selectedSubjectIds, subjectId]);
    } else {
      onSubjectsChange(selectedSubjectIds.filter((id) => id !== subjectId));
    }
  };

  return (
    <Form {...dateForm}>
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Tab Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs
              .filter((tab) => tab.id !== "finish")
              .map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {tab.Icon && <tab.Icon size={15} />}
                  {tab.label}
                </button>
              ))}
          </div>

          {/* Personal Information Tab */}
          {activeTab === "personal" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  placeholder="Enter First Name"
                  required
                  id="firstname"
                  value={formData?.firstname}
                  onChange={(e) =>
                    handleInputChange("firstname", e.target.value)
                  }
                />

                <InputField
                  label="Last Name"
                  placeholder="Enter Last Name"
                  required
                  id="lastname"
                  value={formData?.lastname}
                  onChange={(e) =>
                    handleInputChange("lastname", e.target.value)
                  }
                />

                <InputField
                  label="Email Address"
                  placeholder="Enter Email Address"
                  required
                  id="email"
                  type="email"
                  value={formData?.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />

                <InputField
                  label="Phone Number"
                  placeholder="e.g, 08083445454"
                  required
                  id="phone"
                  value={formData?.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
                <div>
                  <FormDate
                    name="DOB"
                    label="Date of Birth"
                    placeholder="Select date of birth"
                    rules={{ required: "Date of birth is required" }}
                  />
                </div>
                <div>
                  <SelectField
                    label={"Gender"}
                    value={formData?.gender}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                    placeholder="Select gender"
                  >
                    <SelectContent>
                      {Object.values(Gender).map((item, index) => (
                        <SelectItem
                          className="capitalize"
                          key={index}
                          value={item}
                        >
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectField>
                </div>
                <div>
                  <ReligionSelector
                    label="Religion"
                    value={formData?.religion}
                    onValueChange={(value) =>
                      handleInputChange("religion", value)
                    }
                    placeholder="Select Religion"
                  />
                </div>
                <div>
                  <InputField
                    label={"Profile Photo"}
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Address Information Tab */}
          {activeTab === "address" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <TextareaField
                    label={"Street Address"}
                    placeholder="Enter Street Address"
                    id="street"
                    value={formData?.street}
                    onChange={(e) =>
                      handleInputChange("street", e.target.value)
                    }
                    required
                  />
                </div>

                <InputField
                  id="city"
                  placeholder="Enter City"
                  label={"City"}
                  value={formData?.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                />

                <InputField
                  label={"State/Province"}
                  placeholder="Enter State/Province"
                  id="state"
                  value={formData?.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                />

                <InputField
                  label={"ZIP/Postal Code"}
                  placeholder="Enter ZIP/Postal Code"
                  id="zipcode"
                  value={formData?.zipcode}
                  onChange={(e) => handleInputChange("zipcode", e.target.value)}
                />

                <CountrySelector
                  label="Country"
                  value={formData?.country}
                  onValueChange={(value) => handleInputChange("country", value)}
                  placeholder="Select Country"
                />
              </div>
            </div>
          )}

          {/* Professional Information Tab */}
          {activeTab === "professional" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormDate
                  name="hireDate"
                  label="Hire Date"
                  placeholder="Select hire date"
                  disableRule={() => false}
                />

                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block">
                    Subjects Taught
                  </label>
                  <div className="border rounded-md p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {subjects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No subjects available
                      </p>
                    ) : (
                      subjects.map((subject) => (
                        <label
                          key={subject.id}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedSubjectIds.includes(subject.id)}
                            onCheckedChange={(checked) =>
                              toggleSubject(subject.id, checked === true)
                            }
                          />
                          {subject.name}
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select all subjects this teacher will teach. A teacher can
                    be assigned to more than one subject.
                  </p>
                </div>

                <InputField
                  label="Years of Experience"
                  id="experience"
                  type="number"
                  value={formData?.experience}
                  onChange={(e) =>
                    handleInputChange("experience", e.target.value)
                  }
                  min="0"
                  max="50"
                  placeholder="e.g., 5"
                />

                <SelectField
                  label="Employment Type"
                  value={formData?.employmentType}
                  onValueChange={(value) =>
                    handleInputChange("employmentType", value)
                  }
                  placeholder="Select employment type"
                >
                  <SelectItem value="full-time">Full Time</SelectItem>
                  <SelectItem value="part-time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="substitute">Substitute</SelectItem>
                </SelectField>

                <InputField
                  label="Monthly Salary"
                  id="salary"
                  type="number"
                  value={formData?.salary}
                  onChange={(e) => handleInputChange("salary", e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 5000"
                />

                <InputField
                  label="Previous Institution"
                  id="previousInstitution"
                  value={formData?.previousInstitution}
                  onChange={(e) =>
                    handleInputChange("previousInstitution", e.target.value)
                  }
                  placeholder="e.g., ABC High School"
                />
              </div>
            </div>
          )}

          {/* Education Tab */}
          {activeTab === "education" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                Educational Background
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="Highest Degree"
                  required
                  value={formData?.degree}
                  onValueChange={(value) => handleInputChange("degree", value)}
                  placeholder="Select degree"
                >
                  <SelectItem value="bachelor">
                    Bachelor&apos;s Degree
                  </SelectItem>
                  <SelectItem value="master">Master&apos;s Degree</SelectItem>
                  <SelectItem value="doctorate">Doctorate</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                </SelectField>

                <InputField
                  label="University/Institution"
                  id="university"
                  value={formData?.university}
                  onChange={(e) =>
                    handleInputChange("university", e.target.value)
                  }
                  placeholder="e.g., Harvard University"
                />

                <InputField
                  label="Graduation Year"
                  id="graduationYear"
                  type="number"
                  value={formData?.graduationYear}
                  onChange={(e) =>
                    handleInputChange("graduationYear", e.target.value)
                  }
                  min="1950"
                  max={new Date().getFullYear()}
                  placeholder="e.g., 2020"
                />

                <InputField
                  label="Teaching Qualification"
                  id="qualification"
                  value={formData?.qualification}
                  onChange={(e) =>
                    handleInputChange("qualification", e.target.value)
                  }
                  placeholder="e.g., B.Ed, M.Ed, TESOL"
                />

                {/* <div className="md:col-span-2">
                  <TextareaField
                    label="Additional Certifications"
                    id="additionalCertifications"
                    value={formData?.additionalCertifications}
                    onChange={(e) =>
                      handleInputChange(
                        "additionalCertifications",
                        e.target.value
                      )
                    }
                    placeholder="List any additional certifications, workshops, or professional development courses"
                  />
                </div> */}
              </div>
            </div>
          )}

          {/* Teaching Information Tab */}
          {activeTab === "teaching" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                Teaching Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Max Classes Per Week"
                  id="maxClassesPerWeek"
                  type="number"
                  value={formData?.maxClassesPerWeek}
                  onChange={(e) =>
                    handleInputChange("maxClassesPerWeek", e.target.value)
                  }
                  min="1"
                  max="40"
                  placeholder="e.g., 20"
                />

                {/* <InputField
                  label="Preferred Grade Levels"
                  id="preferredGrades"
                  value={formData?.preferredGrades}
                  onChange={(e) =>
                    handleInputChange("preferredGrades", e.target.value)
                  }
                  placeholder="e.g., Grade 9-12, Elementary"
                /> */}
              </div>
            </div>
          )}

          {/* Form data validation */}
          {activeTab === "finish" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Review & Submit</h3>
              <p>Please review the information before submitting the form.</p>
              {/* You can render a summary here */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" asChild>
          <Link href="/portal/teachers">Cancel</Link>
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const currentIndex = tabs.findIndex(
                (tab) => tab.id === activeTab
              );
              if (currentIndex > 0) {
                setActiveTab(tabs[currentIndex - 1].id);
              }
            }}
          >
            Previous
          </Button>
          {activeTab !== "finish" && (
            <Button
              type="button"
              onClick={() => {
                const currentIndex = tabs.findIndex(
                  (tab) => tab.id === activeTab
                );
                if (currentIndex < tabs.length - 1) {
                  setActiveTab(tabs[currentIndex + 1].id);
                }
              }}
            >
              Next
            </Button>
          )}

          {/* Form submission trigger */}
          {activeTab === "finish" && (
            <Button type="submit" disabled={loading}>
              {type === "create" && (
                <>{loading ? "Creating Teacher..." : "Create Teacher"}</>
              )}
              {type === "update" && (
                <>{loading ? "Updating Teacher..." : "Update Teacher"}</>
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
    </Form>
  );
};

export default TeacherForm;
