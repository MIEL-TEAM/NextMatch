"use client";

import { updateMemberProfile } from "@/app/actions/userActions";
import {
  MemberEditSchema,
  memberEditSchema,
} from "@/lib/schemas/memberEditSchema";
import { handleFormServerError } from "@/lib/util";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Textarea } from "@nextui-org/react";
import { Member } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getToastStyle } from "@/hooks/useIsMobile";

type EditFormProps = {
  member: Member;
};

export default function EditForm({ member }: EditFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, isDirty, isSubmitting, errors },
    setError,
  } = useForm<MemberEditSchema>({
    resolver: zodResolver(memberEditSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    if (member) {
      reset({
        name: member.name,
        description: member.description,
        city: member.city,
        country: member.country,
      });
    }
  }, [member, reset]);

  const onSubmit = async (data: MemberEditSchema) => {
    const nameUpdated = data.name !== member.name;
    const result = await updateMemberProfile(data, nameUpdated);

    if (result.status === "success") {
      toast.success("הפרופיל עודכן בהצלחה!", {
        style: getToastStyle(),
      });
      router.refresh();
      reset({ ...data });
    } else {
      handleFormServerError(result, setError);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col space-y-4 p-4"
    >
      <Input
        label="שם"
        variant="bordered"
        {...register("name")}
        defaultValue={member.name}
        isInvalid={!!errors.name}
        errorMessage={errors.name?.message}
        className="w-full"
      />
      <Textarea
        label="תיאור"
        variant="bordered"
        {...register("description")}
        defaultValue={member.description}
        isInvalid={!!errors.description}
        errorMessage={errors.description?.message}
        minRows={4}
        className="w-full"
      />
      <div className="flex flex-col md:flex-row gap-3">
        <Input
          label="עיר"
          variant="bordered"
          {...register("city")}
          defaultValue={member.city}
          isInvalid={!!errors.city}
          errorMessage={errors.city?.message}
          className="w-full"
        />
        <Input
          label="מדינה"
          variant="bordered"
          {...register("country")}
          defaultValue={member.country}
          isInvalid={!!errors.country}
          errorMessage={errors.country?.message}
          className="w-full"
        />
      </div>
      {errors.root?.serverError && (
        <p className="text-danger text-sm">{errors.root.serverError.message}</p>
      )}
      <Button
        type="submit"
        className="w-full md:w-auto self-start"
        variant="solid"
        isDisabled={!isValid || !isDirty}
        isLoading={isSubmitting}
        color="secondary"
      >
        עדכן פרופיל
      </Button>
    </form>
  );
}
