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
    <CardWrapper
      headerText="מאמתים את כתובת האימייל שלך... 😉"
      headerIcon={MdOutlineMailOutline}
      body={
        <div className="flex flex-col space-y-4 items-center">
          <div className="flex flex-row items-center">
            <p>כמעט שם! מאמתים את האימייל שלך כדי שתוכל להתחיל להכיר... 😏</p>
            {!result && <Spinner color="secondary" />}
          </div>
        </div>
      }
      footer={<ResultMessage result={result} />}
    />
  );
}
