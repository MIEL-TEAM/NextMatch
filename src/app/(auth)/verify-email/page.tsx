import { verifyEmail } from "@/app/actions/authActions";
import CardWrapper from "@/components/CardWrapper";
import ResultMessage from "@/components/ResultMessage";
import { Spinner } from "@nextui-org/react";
import { MdOutlineMailOutline } from "react-icons/md";

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = params.token ?? "";

  const result = await verifyEmail(token);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen overflow-hidden text-black fixed inset-0 px-6 sm:px-12">
      <CardWrapper
        headerText="מאמתים את כתובת האימייל שלך... 😉"
        headerIcon={MdOutlineMailOutline}
        body={
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <p className="text-center sm:text-right text-base sm:text-lg">
              כמעט שם! מאמתים את האימייל שלך כדי שתוכל להתחיל להכיר... 😏
            </p>
            {!result && (
              <div className="flex justify-center">
                <Spinner color="secondary" />
              </div>
            )}
          </div>
        }
        footer={<ResultMessage result={result} />}
      />
    </div>
  );
}
