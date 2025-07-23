"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { userAtom, authAPI } from "@/jotai/auth/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { SafeText, ErrorBoundary, safeGet } from "@/components/ui/safe-render";
import { Edit, Save, X, User, Mail, Calendar, Shield } from "lucide-react";
import { Spinner } from "@radix-ui/themes";
import { toast } from "sonner";
import { isAdminAtom } from "@/jotai/auth/auth";
import { extractErrorMessage } from "@/utils/helpers";

export default function ProfilePage() {
  const router = useRouter();
  const [user] = useAtom(userAtom);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [navigationLoading, setNavigationLoading] = useState(false);

  const [isAdmin] = useAtom(isAdminAtom);
  const [, updateProfile] = useAtom(authAPI.updateProfile);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    // TODO: Add when these fields are added to User schema
    // phone: "",
    // bio: "",
    // dateOfBirth: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        // TODO: Uncomment when added to schema
        // phone: user.phone || "",
        // bio: user.bio || "",
        // dateOfBirth: user.dateOfBirth || "",
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Prepare the update data - only send fields that can be updated
      const updateData = {
        name: formData.name,
        email: formData.email,
        // Add other fields when they're available in the schema
        // phone: formData.phone,
        // bio: formData.bio,
      };

      console.log("Saving profile data:", updateData);

      // Use Jotai updateProfile atom
      await updateProfile(updateData);

      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      const errorMessage = extractErrorMessage(
        error ?? "Failed to update profile. Please try again."
      );
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        // TODO: Reset other fields when added to schema
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Not provided";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and preferences
            </p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex flex-row gap-2 items-center">
                        <Spinner />
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit size={18} className="mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Picture Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <PersonAvatar
                name={safeGet(user, "name", "User")}
                size="xl"
                className="mx-auto w-24 h-24"
              />

              {/* TODO: Uncomment when image upload is implemented */}
              {/* {isEditing && (
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              )} */}

              <div className="text-sm text-muted-foreground">
                <SafeText fallback="No name provided">
                  {safeGet(user, "name", "")}
                </SafeText>
              </div>

              <div className="text-xs text-muted-foreground">
                {safeGet(user, "role", "User")}
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User size={15} />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-sm mt-1 p-2 bg-muted rounded-md">
                      <SafeText fallback="Not provided">
                        {formData.name}
                      </SafeText>
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail size={15} />
                    Email Address
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p className="text-sm mt-1 p-2 bg-muted rounded-md">
                      <SafeText fallback="Not provided">
                        {formData.email}
                      </SafeText>
                    </p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield size={15} />
                    Role
                  </Label>
                  <p className="text-sm mt-1 p-2 bg-muted rounded-md">
                    <SafeText fallback="Not provided">
                      {safeGet(user, "role", "")}
                    </SafeText>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact admin to change your role
                  </p>
                </div>

                {/* Member Since */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar size={15} />
                    Member Since
                  </Label>
                  <p className="text-sm mt-1 p-2 bg-muted rounded-md">
                    {formatDate(safeGet(user, "createdAt", ""))}
                  </p>
                </div>

                {/* TODO: Uncomment when phone is added to User schema */}
                {/* <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-sm mt-1 p-2 bg-muted rounded-md">
                      <SafeText fallback="Not provided">
                        {formData.phone}
                      </SafeText>
                    </p>
                  )}
                </div> */}

                {/* TODO: Uncomment when bio is added to User schema */}
                {/* <div className="md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm mt-1 p-2 bg-muted rounded-md min-h-[80px]">
                      <SafeText fallback="No bio provided">
                        {formData.bio}
                      </SafeText>
                    </p>
                  )}
                </div> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>User ID</Label>
                <p className="text-sm mt-1 p-2 bg-muted rounded-md">
                  {safeGet(user, "id", "N/A")}
                </p>
              </div>

              <div>
                <Label>Account Type</Label>
                <p className="text-sm mt-1 p-2 bg-muted rounded-md">
                  <SafeText fallback="Standard User">
                    {safeGet(user, "role", "")} Account
                  </SafeText>
                </p>
              </div>

              <div>
                <Label>Account Status</Label>
                <p className="text-sm mt-1 p-2 bg-green-100 text-green-800 rounded-md">
                  Active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setNavigationLoading(true);
                  router.push("/portal/settings");
                }}
                disabled={navigationLoading}
              >
                {navigationLoading ? (
                  <div className="flex flex-row gap-2 items-center">
                    Going to Settings... <Spinner />
                  </div>
                ) : (
                  "Go to Settings"
                )}
              </Button>

              {/* TODO: Implement these actions */}
              <Button variant="outline" disabled>
                Change Password
              </Button>

              <Button variant="outline" disabled>
                Download Data
              </Button>

              <Button variant="destructive" disabled>
                Delete Account
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Some actions are currently under development and will be available
              soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
