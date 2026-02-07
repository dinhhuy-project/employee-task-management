type FirestoreTimestamp = {
  _seconds: number;
  _nanoseconds: number;
};

type DateInput = string | number | Date | FirestoreTimestamp | null | undefined;

function toDate(value: DateInput): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === "object" && "_seconds" in value) {
    const ms =
      value._seconds * 1000 +
      Math.floor((value._nanoseconds || 0) / 1_000_000);

    return new Date(ms);
  }

  return null;
}

export function formatDate(value: DateInput): string {
  const date = toDate(value);
  return date ? date.toLocaleDateString() : "";
}

export function formatTime(value: DateInput): string {
  const date = toDate(value);
  return date ? date.toLocaleTimeString() : "";
}

export function getTimestampMs(value: DateInput): number {
  const date = toDate(value);
  return date ? date.getTime() : 0;
}

export function formatDateForInput(value: DateInput): string {
  const date = toDate(value);
  if (!date) return "";

  return date.toISOString().slice(0, 10);
}
