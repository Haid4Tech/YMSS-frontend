# Dynamic Page Error Handling - Quick Fix Guide

## Problem
Error: "Cannot read properties of undefined (reading 'name')" occurs when accessing nested properties on undefined objects in dynamic pages.

## Root Cause
- Code tries to access `student.user.name` before data is fully loaded
- Missing comprehensive null/undefined checks
- Race conditions between loading states and data access

## Solution Components Created

### 1. `DataState` Component (`/components/ui/data-state.tsx`)
Handles loading, error, and empty states with retry functionality.

### 2. `SafeRender` Components (`/components/ui/safe-render.tsx`)
- `SafeRender`: Conditional rendering with fallbacks
- `SafeText`: Safe text display with fallback styling
- `ErrorBoundary`: Catches unexpected errors
- `safeGet()`: Safe property access function

## Quick Fix for Student Detail Page

### Before (Causing Error):
```tsx
// ❌ This causes: "Cannot read properties of undefined (reading 'name')"
<h1>{student.user.name}</h1>
<PersonAvatar name={student.user.name} />
```

### After (Safe):
```tsx
// ✅ Safe with null checks and fallbacks
import { safeGet } from "@/components/ui/safe-render";

<h1>{safeGet(student, "user.name", "Unknown Student")}</h1>
<PersonAvatar name={safeGet(student, "user.name", "Unknown Student")} />
```

## Comprehensive Fix Pattern

### 1. Import the Components
```tsx
import { DataState } from "@/components/ui/data-state";
import { SafeRender, SafeText, ErrorBoundary, safeGet } from "@/components/ui/safe-render";
```

### 2. Wrap Your Page
```tsx
export default function DynamicPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <ErrorBoundary>
      <DataState
        loading={loading}
        error={error}
        data={data && data.user} // Ensure nested data exists
        dataName="Student"
        backUrl="/portal/students"
        onRetry={fetchData}
      >
        {/* Your safe content here */}
        <div>
          <h1>{safeGet(data, "user.name", "Unknown")}</h1>
          <SafeText fallback="No email">
            {safeGet(data, "user.email", "")}
          </SafeText>
        </div>
      </DataState>
    </ErrorBoundary>
  );
}
```

### 3. Apply to All Property Access
```tsx
// ❌ Unsafe
student.user.name
student.class.name
teacher.subjects[0].name

// ✅ Safe
safeGet(student, "user.name", "Unknown Student")
safeGet(student, "class.name", "No class")
safeGet(teacher, "subjects.0.name", "No subject")
```

## Files That Need Fixing

### High Priority (Causing Runtime Errors):
1. `/app/portal/(dashboard)/students/[id]/page.tsx` ✅ Partially Fixed
2. `/app/portal/(dashboard)/teachers/[id]/page.tsx` ✅ Partially Fixed
3. `/app/portal/(dashboard)/classes/[id]/page.tsx`
4. `/app/portal/(dashboard)/subjects/[id]/page.tsx`
5. `/app/portal/(dashboard)/exams/[id]/page.tsx`

### Medium Priority (Potential Issues):
- Any component accessing user.role, user.email, nested object properties
- List pages with filter/map operations on potentially undefined arrays

## Implementation Steps

### Step 1: Add Safe Property Access
Replace all direct property access with `safeGet()`:
```tsx
// Before
{student.user.name}

// After  
{safeGet(student, "user.name", "Unknown Student")}
```

### Step 2: Add Data Validation
Update your null checks:
```tsx
// Before
if (!student) return <NotFound />;

// After
if (!student || !student.user) return <DataError />;
```

### Step 3: Wrap with Error Boundary
```tsx
// Wrap your entire page component
<ErrorBoundary>
  <YourPageContent />
</ErrorBoundary>
```

## Testing Different Scenarios

Test your pages with:
1. **Loading state**: Data is null/undefined
2. **Error state**: API throws error
3. **Partial data**: Object exists but nested properties are missing
4. **Empty arrays**: Lists that might be empty
5. **Network issues**: Slow/failed requests

## Benefits of This Approach

✅ **Prevents crashes** - No more "Cannot read properties" errors
✅ **Better UX** - Loading states and error messages
✅ **Retry functionality** - Users can try again if something fails  
✅ **Consistent styling** - Fallback text styled appropriately
✅ **Type safety** - Safe property access with defaults
✅ **Graceful degradation** - App works even with incomplete data

## Example Usage in Current Code

The student and teacher detail pages have been partially updated with this pattern. You can see the safe property access in action:

- Safe avatar rendering with fallback names
- Proper null checking before rendering
- Error boundary protection

For full implementation, apply the `safeGet()` pattern throughout the rest of each page's property access. 