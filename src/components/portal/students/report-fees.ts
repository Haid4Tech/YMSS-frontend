import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormat);

/*
  Shared formatting helpers for the FEES section of the report card, used by
  both the individual print (student detail page) and the batch print (class
  roster).
*/

// Format a fee entry for live display while typing, adding thousands
// separators and keeping up to two decimals, e.g. "33000" -> "33,000",
// "33000.5" -> "33,000.5". Non-numeric characters are stripped.
export const formatFeeInput = (raw: string): string => {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const [intRaw = "", ...rest] = cleaned.split(".");
  const intPart = intRaw.replace(/^0+(?=\d)/, "");
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (cleaned.includes(".")) {
    const decPart = rest.join("").slice(0, 2);
    return `${intFormatted}.${decPart}`;
  }
  return intFormatted;
};

// Format a fee value as Naira currency with two decimal places, e.g.
// "33,000" -> "₦33,000.00". Returns "" for empty/invalid input.
export const formatNaira = (value: string): string => {
  const amount = Number(value.replace(/[^0-9.]/g, ""));
  if (!value.trim() || Number.isNaN(amount)) return "";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format a date string (yyyy-mm-dd) as it appears on the sheet, e.g.
// "4th May, 2026". Returns "" for empty input.
export const formatTermDate = (dateStr: string): string =>
  dateStr ? dayjs(dateStr).format("Do MMMM, YYYY") : "";
