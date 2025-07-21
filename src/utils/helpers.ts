/* eslint-disable @typescript-eslint/no-explicit-any */
export const extractErrorMessage = (error: any): string => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error || // sometimes APIs use "error"
    error?.message ||
    "An unexpected error occurred"
  );
};
