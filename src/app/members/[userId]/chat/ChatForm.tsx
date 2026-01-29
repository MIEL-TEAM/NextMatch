"use client";

import { createMessgae } from "@/app/actions/messageActions";
import { MessageSchema, messagesSchema } from "@/lib/schemas/messagesSchema";
import { handleFormServerError } from "@/lib/util";
import { zodResolver } from "@hookform/resolvers/zod";
// Import specific components instead of the entire library
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { HiPaperAirplane } from "react-icons/hi2";

export default function ChatForm() {
  const params = useParams<{ userId: string }>();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { isSubmitting, isValid, errors },
  } = useForm<MessageSchema>({
    resolver: zodResolver(messagesSchema),
  });

  useEffect(() => {
    setFocus("text");
  }, [setFocus]);

  const onSubmit = async (data: MessageSchema) => {
    // Reset form immediately for better UX
    reset();
    
    try {
      const result = await createMessgae(params.userId, data);

      if (result.status === "error") {
        handleFormServerError(result, setError);
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setTimeout(() => {
        setFocus("text");
      }, 50);
    }
  };

  // Get the register props for the textarea
  const textAreaProps = register("text");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="flex items-center gap-2 w-full">
        <Textarea
          fullWidth
          placeholder="הקלד הודעה (Shift+Enter למעבר שורה)"
          variant="faded"
          minRows={1}
          maxRows={3}
          name={textAreaProps.name}
          onBlur={textAreaProps.onBlur}
          onChange={textAreaProps.onChange}
          ref={textAreaProps.ref}
          isInvalid={!!errors.text}
          errorMessage={!!errors.text?.message}
          className="flex-grow"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
          classNames={{
            input: "resize-none py-2",
            inputWrapper: "min-h-12",
          }}
        />
        <Button
          type="submit"
          isIconOnly
          color="secondary"
          radius="full"
          isLoading={isSubmitting}
          isDisabled={!isValid || isSubmitting}
        >
          <HiPaperAirplane size={18} />
        </Button>
      </div>
      <div className="flex flex-col">
        {errors.root?.serverError && (
          <p className="text-danger text-sm">
            {errors.root.serverError.message}
          </p>
        )}
      </div>
    </form>
  );
}
