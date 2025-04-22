import { format, toZonedTime } from "date-fns-tz";
import { differenceInYears, formatDistance } from "date-fns";
import { he } from "date-fns/locale";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ZodIssue } from "zod";
import { parseDateString } from "./date-parsing";

export function calculateAge(dob: Date) {
  return differenceInYears(new Date(), dob);
}

export function formatShortDateTime(date: Date | string | null | undefined) {
  if (!date) return "";

  try {
    let dateObj: Date;

    if (typeof date === "string") {
      dateObj = parseDateString(date) || new Date(date);

      if (isNaN(dateObj.getTime())) {
        console.error("Invalid date:", date);
        return String(date);
      }
    } else {
      dateObj = date;
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
    let dateObj: Date;

    if (typeof date === "string") {
      // Try parsing non-standard date strings
      dateObj = parseDateString(date) || new Date(date);

      if (isNaN(dateObj.getTime())) {
        console.error("Invalid date:", date);
        return "";
      }
    } else {
      dateObj = date;
    }

    return formatDistance(dateObj, new Date(), {
      addSuffix: true,
      locale: he,
    });
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

export function transformImageUrl(
  imageUrl?: string | null,
  width?: number,
  height?: number
): string {
  if (!imageUrl) return "/images/user.png";

  if (!imageUrl.includes("cloudinary")) return imageUrl;

  const uploadIndex = imageUrl.indexOf("/upload/") + "/upload/".length;

  let transformation = "g_faces";

  if (width) {
    transformation += `,w_${width}`;
  }

  if (height) {
    transformation += `,h_${height}`;
  }

  transformation += ",q_auto";

  transformation += ",f_auto";

  transformation += "/";

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
