import type { Tone } from "@/components/ui/data";

/** Consistent tone + label mapping for each module's status enums. */

export function invoiceTone(status: string): Tone {
  switch (status) {
    case "PAID":
      return "success";
    case "PARTIALLY_PAID":
      return "info";
    case "SENT":
      return "primary";
    case "OVERDUE":
      return "danger";
    case "CANCELLED":
      return "neutral";
    default:
      return "warning"; // DRAFT
  }
}

export function orderTone(status: string): Tone {
  switch (status) {
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "warning"; // pending
  }
}

export function appointmentTone(status: string): Tone {
  switch (status) {
    case "completed":
    case "attended":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "primary"; // scheduled
  }
}

/** Humanize an UPPER_SNAKE or lowercase enum for display. */
export function labelize(value: string): string {
  return value.replace(/_/g, " ").toLowerCase();
}
