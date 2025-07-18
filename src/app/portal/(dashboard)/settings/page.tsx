"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { userAtom } from "@/jotai/auth/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorBoundary, safeGet } from "@/components/ui/safe-render";
import { 
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Monitor,
  Save,
  Moon,
  Sun
} from "lucide-react";

interface SettingsData {
  notifications: {
    email: boolean;
    push: boolean;
    announcements: boolean;
    grades: boolean;
    attendance: boolean;
  };
  appearance: {
    theme: string;
    language: string;
    timezone: string;
  };
  privacy: {
    profileVisibility: string;
    contactInfo: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [user] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      push: true,
      announcements: true,
      grades: true,
      attendance: true,
    },
    appearance: {
      theme: "system",
      language: "en",
      timezone: "UTC",
    },
    privacy: {
      profileVisibility: "school",
      contactInfo: "teachers",
    },
  });

  useEffect(() => {
    // TODO: Load user settings from API
    const loadSettings = async () => {
      try {
        // Simulate API call
        console.log("Loading user settings...");
        
        // For now, use default settings
        // In the future, this will load from the database
        
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user]);

  const updateSetting = (category: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Implement settings save API call
      console.log("Saving settings:", settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      
      // TODO: Show success message
      alert("Settings saved successfully!");
      
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      notifications: {
        email: true,
        push: true,
        announcements: true,
        grades: true,
        attendance: true,
      },
      appearance: {
        theme: "system",
        language: "en",
        timezone: "UTC",
      },
      privacy: {
        profileVisibility: "school",
        contactInfo: "teachers",
      },
    });
    setHasChanges(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading settings...</p>
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
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences and application settings
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={resetToDefaults}
              disabled={isLoading}
            >
              Reset to Defaults
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => updateSetting("notifications", "email", e.target.checked)}
                  className="toggle"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser notifications
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => updateSetting("notifications", "push", e.target.checked)}
                  className="toggle"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Announcements</Label>
                  <p className="text-sm text-muted-foreground">
                    School announcements and updates
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.announcements}
                  onChange={(e) => updateSetting("notifications", "announcements", e.target.checked)}
                  className="toggle"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Grade Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    New grades and exam results
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.grades}
                  onChange={(e) => updateSetting("notifications", "grades", e.target.checked)}
                  className="toggle"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Attendance Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Attendance reminders and updates
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.attendance}
                  onChange={(e) => updateSetting("notifications", "attendance", e.target.checked)}
                  className="toggle"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Theme</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) => updateSetting("appearance", "theme", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Language</Label>
                <Select
                  value={settings.appearance.language}
                  onValueChange={(value) => updateSetting("appearance", "language", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es" disabled>Spanish (Coming Soon)</SelectItem>
                    <SelectItem value="fr" disabled>French (Coming Soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Timezone</Label>
                <Select
                  value={settings.appearance.timezone}
                  onValueChange={(value) => updateSetting("appearance", "timezone", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                    <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                    <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                    <SelectItem value="CST">CST (Central Standard Time)</SelectItem>
                    <SelectItem value="MST">MST (Mountain Standard Time)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Profile Visibility</Label>
                <Select
                  value={settings.privacy.profileVisibility}
                  onValueChange={(value) => updateSetting("privacy", "profileVisibility", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Everyone can see</SelectItem>
                    <SelectItem value="school">School Only - School members only</SelectItem>
                    <SelectItem value="teachers">Teachers Only - Teachers and admin</SelectItem>
                    <SelectItem value="private">Private - Only you and admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Contact Information Visibility</Label>
                <Select
                  value={settings.privacy.contactInfo}
                  onValueChange={(value) => updateSetting("privacy", "contactInfo", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="teachers">Teachers and Admin</SelectItem>
                    <SelectItem value="admin">Admin Only</SelectItem>
                    <SelectItem value="none">No one</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current User</Label>
                <p className="text-sm p-2 bg-muted rounded-md">
                  {safeGet(user, "name", "Unknown User")} ({safeGet(user, "role", "User")})
                </p>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm p-2 bg-muted rounded-md">
                  {safeGet(user, "email", "No email provided")}
                </p>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push("/portal/profile")}
                >
                  Edit Profile
                </Button>
                
                {/* TODO: Implement these features */}
                <Button variant="outline" className="w-full" disabled>
                  Change Password
                </Button>
                
                <Button variant="outline" className="w-full" disabled>
                  Two-Factor Authentication
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>About These Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Notifications</h4>
                <p>
                  Control how and when you receive updates about school activities, 
                  grades, and important announcements.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Privacy</h4>
                <p>
                  Manage who can see your profile information and contact details 
                  within the school portal system.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Appearance</h4>
                <p>
                  Customize how the portal looks and feels. Theme changes apply 
                  immediately and are saved to your account.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Account</h4>
                <p>
                  Basic account information and security settings. Contact your 
                  administrator for role or permission changes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Changes Notice */}
        {hasChanges && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <SettingsIcon className="h-4 w-4" />
                <p className="text-sm">
                  You have unsaved changes. Click &quot;Save Changes&quot; to apply your settings.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  );
} 