import { ActionResult } from "@/types";
import clsx from "clsx";
import Icon from "@/lib/table/Icon";

type ResultMessageProps = {
  result: ActionResult<string> | null;
};

export default function ResultMessage({ result }: ResultMessageProps) {
  if (!result) return null;

  return (
    <div
      className={clsx(
        "p-3 rounded-xl w-full flex items-center justify-center gap-x-2 text-sm",
        {
          "text-danger-800 bg-danger-50": result.status === "error",
          "text-success-800 bg-success-50": result.status === "success",
        }
      )}
    >
      {result.status === "success" ? (
        <Icon name="circle-check" className="size-5 bg-success-800" />
      ) : (
        <Icon name="triangle-exclamation" className="size-5 bg-danger-800" />
      )}

      <p>
        {result.status === "success" ? result.data : (result.error as string)}
      </p>
    </div>
  );
}
