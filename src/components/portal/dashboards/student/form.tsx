import { Dispatch, FC, SetStateAction, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/components/ui/form-field";
import { Card, CardContent } from "@/components/ui/card";
import { SelectItem } from "@/components/ui/select";
import DatePicker from "@/components/general/date-picker";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

import { IStudentFormData } from "@/common/types";
import { Class } from "@/jotai/class/class-type";
import { ParentStudentResponse } from "@/jotai/parent/parent-types";

interface ITabs {
  id: string;
  label?: string;
  Icon?: LucideIcon;
}

interface IDate {
  dob: Date | undefined;
  admissionDate: Date | undefined;
}

interface IStudentForm {
  type: "create" | "update";
  onSubmit: (e: React.FormEvent) => Promise<void>;
  tabs: ITabs[];
  classes: Class[];
  parents?: ParentStudentResponse[];
  isParent: boolean;
  loading: boolean;
  date: IDate;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  handleInputChange: (field: string, value: string) => void;
  handleDateChange: (
    dateType: "dob" | "admissionDate"
  ) => (selectedDate: Date | undefined) => void;
  handleFileChange: (file: ChangeEvent<HTMLInputElement>) => void;
  formData?: IStudentFormData | null;
}

const StudentForm: FC<IStudentForm> = ({
  type,
  onSubmit,
  tabs,
  date,
  classes,
  parents,
  loading,
  isParent,
  activeTab,
  setActiveTab,
  handleInputChange,
  handleDateChange,
  handleFileChange,
  formData,
}) => {
  return (
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
                <div>
                  <InputField
                    label="First Name"
                    id="firstname"
                    placeholder="Enter first name"
                    value={formData?.firstname}
                    onChange={(e) =>
                      handleInputChange("firstname", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <InputField
                    label="Last Name"
                    id="lastname"
                    placeholder="Enter last name"
                    value={formData?.lastname ?? undefined}
                    onChange={(e) =>
                      handleInputChange("lastname", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <InputField
                    label={"Email Address"}
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData?.email ?? undefined}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <DatePicker
                    label={"Date of Birth"}
                    required
                    date={date.dob}
                    setDate={handleDateChange("dob")}
                  />
                </div>
                <div>
                  <SelectField
                    required
                    label={"Gender"}
                    placeholder="Select gender"
                    value={formData?.gender ?? undefined}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                  >
                    {["MALE", "FEMALE", "OTHER"].map((item, index) => (
                      <SelectItem
                        className="capitalize"
                        key={index}
                        value={item}
                      >
                        {item}
                      </SelectItem>
                    ))}
                  </SelectField>
                </div>
                <div>
                  <InputField
                    label={"Phone Number"}
                    id="phone"
                    placeholder="e.g, 08099999999"
                    value={formData?.phone ?? undefined}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
                <div>
                  <InputField
                    label={"Nationality"}
                    id="nationality"
                    placeholder="Enter nationality"
                    value={formData?.nationality ?? undefined}
                    onChange={(e) =>
                      handleInputChange("nationality", e.target.value)
                    }
                  />
                </div>
                <div>
                  <InputField
                    label={"Religion"}
                    id="religion"
                    placeholder="Enter religion"
                    value={formData?.religion ?? undefined}
                    onChange={(e) =>
                      handleInputChange("religion", e.target.value)
                    }
                  />
                </div>
                <div>
                  <SelectField
                    label={"Blood Group"}
                    placeholder="Select blood group"
                    value={formData?.bloodGroup ?? undefined}
                    onValueChange={(value) =>
                      handleInputChange("bloodGroup", value)
                    }
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (item, index) => (
                        <SelectItem
                          className="capitalize"
                          key={index}
                          value={item}
                        >
                          {item}
                        </SelectItem>
                      )
                    )}
                  </SelectField>
                </div>
                <div>
                  <InputField
                    label={"Student Photo"}
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
                    id="street"
                    placeholder="Enter street sddress"
                    value={formData?.street ?? undefined}
                    onChange={(e) =>
                      handleInputChange("street", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <InputField
                    label={"City"}
                    id="city"
                    placeholder="Enter city"
                    value={formData?.city ?? undefined}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <InputField
                    label="State/Province"
                    id="state"
                    placeholder="Enter state or province"
                    value={formData?.state ?? undefined}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <InputField
                    label="ZIP/Postal Code"
                    id="zipCode"
                    placeholder="Enter region ZIP code"
                    value={formData?.zipcode ?? undefined}
                    onChange={(e) =>
                      handleInputChange("zipCode", e.target.value)
                    }
                  />
                </div>
                <div>
                  <InputField
                    label={"Country"}
                    id="country"
                    placeholder={"Enter country"}
                    value={formData?.country ?? undefined}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Academic Information Tab */}
          {activeTab === "academic" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <SelectField
                    label={"Assign to Class"}
                    placeholder="Select class to assign"
                    value={formData?.classId ?? undefined}
                    onValueChange={(value) =>
                      handleInputChange("classId", value)
                    }
                  >
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id.toString()}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectField>
                </div>

                <DatePicker
                  label={"Admission Date"}
                  required
                  date={date.admissionDate}
                  setDate={handleDateChange("admissionDate")}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label={"Previous School"}
                  id="previousSchool"
                  placeholder={"If none, write N/A"}
                  value={formData?.previousSchool}
                  onChange={(e) =>
                    handleInputChange("previousSchool", e.target.value)
                  }
                />
              </div>
            </div>
          )}

          {/* Parent/Guardian Information Tab */}
          {activeTab === "parent" && (
            <div className="space-y-4">
              <div className="space-y-2 pb-3">
                <h3 className="text-lg font-semibold mb-4">
                  Parent/Guardian Information
                </h3>

                <div className="text-sm font-semibold">
                  {isParent ? (
                    <p>Parent/Guardian found</p>
                  ) : (
                    <p>No Parent/Guardian found</p>
                  )}
                </div>
              </div>

              <div>
                {isParent ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label="Select Parent/Guardian"
                      placeholder="Select parent"
                      required
                      value={formData?.parentId ?? undefined}
                      onValueChange={(value) =>
                        handleInputChange("parentId", value)
                      }
                    >
                      <SelectItem value="N/A">No parent assigned</SelectItem>
                      {parents &&
                        parents.map((parent) => (
                          <SelectItem
                            key={parent.id}
                            value={parent.parentId.toString()}
                          >
                            {parent.parent.user.firstname}{" "}
                            {parent.parent.user.lastname}
                          </SelectItem>
                        ))}
                    </SelectField>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label={"Parent/Guardian First Name"}
                      id="parentfirstname"
                      placeholder="Enter Parent/Guardian name"
                      value={formData?.parentfirstname}
                      onChange={(e) =>
                        handleInputChange("parentfirstname", e.target.value)
                      }
                      required
                    />
                    <InputField
                      label={"Parent/Guardian Last Name"}
                      id="parentlastname"
                      type="text"
                      placeholder="Enter Parent/Guardian Email"
                      value={formData?.parentlastname}
                      onChange={(e) =>
                        handleInputChange("parentlastname", e.target.value)
                      }
                      required
                    />

                    <InputField
                      label={"Parent/Guardian Email"}
                      id="parentemail"
                      type="email"
                      placeholder="Enter Parent/Guardian Email"
                      value={formData?.parentemail}
                      onChange={(e) =>
                        handleInputChange("parentemail", e.target.value)
                      }
                      required
                    />

                    <InputField
                      label="Parent/Guardian Phone"
                      id="parentphone"
                      placeholder="e.g 08055223344"
                      value={formData?.parentphone}
                      onChange={(e) =>
                        handleInputChange("parentphone", e.target.value)
                      }
                      required
                    />

                    <SelectField
                      label={"Relationship"}
                      placeholder="Select relationship"
                      required
                      value={formData?.relationship ?? undefined}
                      onValueChange={(value) =>
                        handleInputChange("relationship", value)
                      }
                    >
                      {[
                        "father",
                        "mother",
                        "brother",
                        "sister",
                        "guardian",
                        "grandparent",
                        "uncle",
                        "aunt",
                        "other",
                      ].map((item, index) => (
                        <SelectItem
                          className="capitalize"
                          key={index}
                          value={item}
                        >
                          {item}
                        </SelectItem>
                      ))}
                    </SelectField>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medical Information Tab */}
          {activeTab === "medical" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                Medical Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <TextareaField
                    label={"Medical Conditions"}
                    id="conditions"
                    value={formData?.conditions ?? undefined}
                    onChange={(e) =>
                      handleInputChange("conditions", e.target.value)
                    }
                    placeholder="List any medical conditions or health issues"
                  />
                </div>
                <div className="md:col-span-2">
                  <TextareaField
                    label={"Allergies"}
                    id="allergies"
                    value={formData?.allergies ?? undefined}
                    onChange={(e) =>
                      handleInputChange("allergies", e.target.value)
                    }
                    placeholder="List any known allergies"
                  />
                </div>
                <div className="md:col-span-2">
                  <TextareaField
                    label={"Current Medications"}
                    id="medications"
                    value={formData?.medications ?? undefined}
                    onChange={(e) =>
                      handleInputChange("medications", e.target.value)
                    }
                    placeholder="List current medications and dosages"
                  />
                </div>
                <div>
                  <InputField
                    label="Family Doctor Name"
                    placeholder="Enter Doctors phone name"
                    id="doctorName"
                    value={formData?.doctorName ?? undefined}
                    onChange={(e) =>
                      handleInputChange("doctorName", e.target.value)
                    }
                  />
                </div>
                <div>
                  <InputField
                    label="Doctor's Phone"
                    id="doctorPhone"
                    placeholder="Enter Doctors phone number"
                    value={formData?.doctorPhone ?? undefined}
                    onChange={(e) =>
                      handleInputChange("doctorPhone", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

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
          <Link href="/portal/students">Cancel</Link>
        </Button>
        <div className="flex gap-2">
          {/* Navigation buttons */}
          <Button
            type="button"
            variant="outline"
            disabled={tabs.findIndex((tab) => tab.id === activeTab) === 0}
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
                <>{loading ? "Creating Student..." : "Create Student"}</>
              )}
              {type === "update" && (
                <>{loading ? "Updating Student..." : "Update Student"}</>
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default StudentForm;
