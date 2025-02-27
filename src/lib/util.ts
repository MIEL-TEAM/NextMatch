import { differenceInYears, formatDistance } from "date-fns";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { format, toZonedTime } from "date-fns-tz";
import { ZodIssue } from "zod";

export function calculateAge(dob: Date) {
  return differenceInYears(new Date(), dob);
}

export function formatShortDateTime(date: Date | string | null | undefined) {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      console.error("Invalid date:", date);
      return String(date);
    }

    const israelTime = toZonedTime(dateObj, "Asia/Jerusalem");

    return format(israelTime, "dd MMM HH:mm", { timeZone: "Asia/Jerusalem" });
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(date);
  }
}
export function timeAgo(date: string | null | undefined) {
  if (!date) return "";

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    return formatDistance(dateObj, new Date());
  } catch (error) {
    console.error("Error calculating time ago:", error);
    return "";
  }
}
export function handleFormServerError<TFeildValues extends FieldValues>(
  errorResponse: { error: string | ZodIssue[] },
  setError: UseFormSetError<TFeildValues>
) {
  if (Array.isArray(errorResponse.error)) {
    errorResponse.error.forEach((err) => {
      const fieldName = err.path.join(".") as Path<TFeildValues>;
      setError(fieldName, { message: err.message });
    });
  } else {
    setError("root.serverError", { message: errorResponse.error });
  }
}

export function transformImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return null;
  if (!imageUrl.includes("cloudinary")) return imageUrl;

  const uploadIndex = imageUrl.indexOf("/upload/") + "/upload/".length;

  const transformation = "g_faces/";

  return `${imageUrl.slice(0, uploadIndex)}${transformation}${imageUrl.slice(
    uploadIndex
  )}`;
}

export function truncateString(text?: string | null, num = 50) {
  if (!text) return null;
  if (text.length <= num) {
    return text;
  }
  return text.slice(0, num) + "...";
}

export function createChatId(a: string, b: string) {
  return a > b ? `${b}-${a}` : `${a}-${b}`;
}
