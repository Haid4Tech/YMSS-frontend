// Example: Safe Dynamic Page Implementation
// This shows the recommended pattern for handling dynamic pages with proper error handling

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonAvatar } from "@/components/ui/person-avatar";
import { DataState, safeProp } from "@/components/ui/data-state";
import { SafeRender, SafeText, ErrorBoundary, safeGet } from "@/components/ui/safe-render";

// Example of how to implement a safe dynamic page
export default function SafeDynamicPageExample() {
  const params = useParams();
  const itemId = params.id as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Your API call here
      // const response = await apiCall(itemId);
      // setData(response);
      
      // For demo purposes, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate different scenarios:
      // setData(null); // Not found
      // throw new Error("API Error"); // Error case
      // setData({ user: { name: "John Doe", email: "john@example.com" } }); // Success
      
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchData();
    }
  }, [itemId]);

  return (
    <ErrorBoundary>
      <DataState
        loading={loading}
        error={error}
        data={data && data.user} // Check for nested data
        dataName="Student"
        backUrl="/portal/students"
        backLabel="Back to Students"
        onRetry={fetchData}
      >
        <div className="space-y-6">
          {/* Header with safe property access */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/portal/students">← Back</Link>
              </Button>
              
              <PersonAvatar 
                name={safeGet(data, "user.name", "Unknown User")}
                size="xl"
              />
              
              <div>
                <h1 className="text-3xl font-bold">
                  <SafeText fallback="Unknown User">
                    {safeGet(data, "user.name", "")}
                  </SafeText>
                </h1>
                <p className="text-muted-foreground">Profile</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">Edit Profile</Button>
              <Button>Send Message</Button>
            </div>
          </div>

          {/* Information Cards with safe rendering */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  <SafeText fallback="No email provided">
                    {safeGet(data, "user.email", "")}
                  </SafeText>
                </div>
                
                <SafeRender condition={!!safeGet(data, "phone", null)}>
                  <div>
                    <span className="font-medium">Phone:</span>{" "}
                    <SafeText>{safeGet(data, "phone", "")}</SafeText>
                  </div>
                </SafeRender>
                
                <div>
                  <span className="font-medium">Role:</span>{" "}
                  <SafeText fallback="No role assigned">
                    {safeGet(data, "user.role", "")}
                  </SafeText>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <SafeRender 
                  condition={!!safeGet(data, "class", null)}
                  fallback={
                    <p className="text-muted-foreground italic">
                      No class assigned
                    </p>
                  }
                >
                  <div>
                    <span className="font-medium">Class:</span>{" "}
                    <SafeText>{safeGet(data, "class.name", "")}</SafeText>
                  </div>
                </SafeRender>
                
                <div>
                  <span className="font-medium">Student ID:</span>{" "}
                  <SafeText fallback="No ID">
                    {safeGet(data, "id", "")}
                  </SafeText>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Example of handling arrays safely */}
          <SafeRender condition={Array.isArray(safeGet(data, "subjects", []))}>
            <Card>
              <CardHeader>
                <CardTitle>Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <SafeRender 
                  condition={safeGet(data, "subjects", []).length > 0}
                  fallback={
                    <p className="text-muted-foreground italic">
                      No subjects assigned
                    </p>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {safeGet(data, "subjects", []).map((subject: any, index: number) => (
                      <div key={index} className="p-2 bg-secondary rounded-md">
                        <SafeText fallback={`Subject ${index + 1}`}>
                          {safeGet(subject, "name", "")}
                        </SafeText>
                      </div>
                    ))}
                  </div>
                </SafeRender>
              </CardContent>
            </Card>
          </SafeRender>
        </div>
      </DataState>
    </ErrorBoundary>
  );
}

/* 
Usage Pattern Summary:

1. **Use DataState for main loading/error states:**
   - Handles loading, error, and not-found states
   - Provides retry functionality
   - Only renders children when data is valid

2. **Use safeGet() for property access:**
   - safeGet(object, "path.to.property", defaultValue)
   - Prevents "Cannot read properties of undefined" errors

3. **Use SafeText for displaying values:**
   - Shows fallback for null/undefined/empty values
   - Styles fallback text as muted

4. **Use SafeRender for conditional rendering:**
   - Only renders children when condition is true
   - Provides fallback content

5. **Wrap with ErrorBoundary:**
   - Catches any unexpected errors
   - Prevents entire page crash

6. **Handle arrays safely:**
   - Check if array exists and has length
   - Provide meaningful fallbacks
*/ 