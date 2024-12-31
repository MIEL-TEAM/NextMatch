import { differenceInYears } from "date-fns";
import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ZodIssue } from "zod";

export function calculateAge(dob: Date) {
  return differenceInYears(new Date(), dob);
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
