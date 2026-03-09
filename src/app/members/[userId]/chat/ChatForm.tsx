"use client";

import { createMessgae } from "@/app/actions/messageActions";
import { MessageSchema, messagesSchema } from "@/lib/schemas/messagesSchema";
import { handleFormServerError, createChatId } from "@/lib/util";
import useUpgradeModal from "@/hooks/useUpgradeModal";
import useConversationStore from "@/store/conversationStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/input";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Icon from "@/lib/table/Icon";

type ChatFormProps = {
  currentUserId: string;
};

export default function ChatForm({ currentUserId }: ChatFormProps) {
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
    const recipientId = params.userId;
    const chatId = createChatId(currentUserId, recipientId);
    const optimisticId = `optimistic-${Date.now()}`;
    const store = useConversationStore.getState();

    // Optimistically add the message so the UI feels instant
    const prev = store.threads[chatId] ?? [];
    const myPrevMsg = [...prev].reverse().find((m) => m.senderId === currentUserId);
    store.patchThread(chatId, [
      ...prev,
      {
        id: optimisticId,
        text: data.text,
        created: new Date().toISOString(),
        dateRead: null,
        senderId: currentUserId,
        senderName: myPrevMsg?.senderName,
        senderImage: myPrevMsg?.senderImage,
        currentUserId,
        locked: false,
      },
    ]);

    try {
      const result = await createMessgae(recipientId, data);

      if (result.status === "success") {
        const real = result.data.message;

        reset();

        if (result.data.remainingQuota !== null) {
          store.setQuota(result.data.remainingQuota);
        }

        const current = useConversationStore.getState().threads[chatId] ?? [];
        const withoutOptimistic = current.filter((m) => m.id !== optimisticId);
        if (!withoutOptimistic.some((m) => m.id === real.id)) {
          store.patchThread(chatId, [...withoutOptimistic, real]);
        } else {
          store.patchThread(chatId, withoutOptimistic);
        }

        store.handleConversationEvent({
          version: 1,
          eventId: `client-send-${real.id}`,
          type: "MESSAGE_CREATED",
          conversationId: chatId,
          actorId: currentUserId,
          timestamp: real.created,
          payload: { message: real },
        });
      } else {
        // Revert optimistic on error
        const current = useConversationStore.getState().threads[chatId] ?? [];
        store.patchThread(chatId, current.filter((m) => m.id !== optimisticId));

        if (result.error === "MESSAGE_LIMIT_REACHED") {
          useUpgradeModal.getState().open();
        } else {
          handleFormServerError(result, setError);
          toast.error("Failed to send message");
        }
      }
    } catch (error) {
      // Revert optimistic on network error
      const current = useConversationStore.getState().threads[chatId] ?? [];
      store.patchThread(chatId, current.filter((m) => m.id !== optimisticId));
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setTimeout(() => {
        setFocus("text");
      }, 50);
    }
  };

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
          <Icon name="paper-plane-top" className="size-[18px] bg-white" />
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
