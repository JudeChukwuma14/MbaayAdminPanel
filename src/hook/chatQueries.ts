import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  create_or_get_chat,
  sendMessage,
  getUserChats,
  getChatMessages,
  editMessage,
  deleteMessage,
  sendMediaMessage,
  prepareMediaFormData,
} from "../utils/vendorChatApi";

export const useChats = (token: string | null) => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: () => getUserChats(token),
    enabled: !!token,
  });
};

export const useMessages = (chatId: string) => {
  return useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => getChatMessages(chatId),
    enabled: !!chatId,
  });
};

export const useCreateOrGetChat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ receiverId, token }: { receiverId: string; token: any }) =>
      create_or_get_chat({ receiverId }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      chatId,
      content,
      token,
      replyTo,
    }: {
      chatId: string;
      content: string;
      token: string | null;
      replyTo?: string;
    }) => sendMessage(chatId, { content, replyTo }, token),

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", variables.chatId],
      });

      const prev = queryClient.getQueryData(["messages", variables.chatId]);

      const optimisticId = `opt-${Date.now()}`;
      const optimisticMessage = {
        _id: optimisticId,
        content: variables.content,
        replyTo: variables.replyTo,
        sender: {
          _id: "current-user",
          name: "You",
          isVendor: false,
        },
        createdAt: new Date().toISOString(),
        isOptimistic: true,
        failed: false,
        files: [],
        deletedFor: "none",
        isEdited: false,
      };

      queryClient.setQueryData(["messages", variables.chatId], (old: any) => {
        // server returns { success:true, messages:[...] }
        if (old?.messages && Array.isArray(old.messages)) {
          return { ...old, messages: [...old.messages, optimisticMessage] };
        }
        // fallback (should never happen)
        return { success: true, messages: [optimisticMessage] };
      });

      return { previousMessages: prev, chatId: variables.chatId, optimisticId };
    },

    onError: (_err, variables, context) => {
      // Mark the optimistic message as failed instead of rolling back, so UI can show a failure indicator
      const chatId = context?.chatId || variables.chatId;
      const optId = context?.optimisticId;
      queryClient.setQueryData(["messages", chatId], (old: any) => {
        if (!old?.messages) return old;
        return {
          ...old,
          messages: old.messages.map((m: any) =>
            m._id === optId
              ? { ...m, isOptimistic: false, failed: true }
              : m
          ),
        };
      });
    },
    onSettled: (_data, _error, _variables) => {
      // Avoid re-fetching messages to prevent flicker; socket will sync them.
      // Still refresh chat list metadata (last message, time)
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};

export const useEditMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      messageId,
      text,
      token,
    }: {
      messageId: string;
      text: string;
      token: string | null;
    }) => editMessage(messageId, { text }, token),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["messages"],
      });

      let chatIdForOptimisticUpdate: string | undefined;
      const allQueryData = queryClient.getQueriesData({
        queryKey: ["messages"],
      });

      for (const [queryKey, data] of allQueryData) {
        if (
          queryKey[0] === "messages" &&
          data &&
          typeof data === "object" &&
          "messages" in data &&
          Array.isArray(data.messages)
        ) {
          const foundMessage = data.messages.find(
            (msg: any) => msg._id === variables.messageId
          );
          if (foundMessage) {
            chatIdForOptimisticUpdate = queryKey[1] as string;
            break;
          }
        }
      }

      const previousMessages = chatIdForOptimisticUpdate
        ? queryClient.getQueryData(["messages", chatIdForOptimisticUpdate])
        : undefined;

      if (chatIdForOptimisticUpdate) {
        queryClient.setQueryData(
          ["messages", chatIdForOptimisticUpdate],
          (old: any) => {
            if (old && old.messages && Array.isArray(old.messages)) {
              return {
                ...old,
                messages: old.messages.map((msg: any) =>
                  msg._id === variables.messageId
                    ? { ...msg, content: variables.text, isEdited: true }
                    : msg
                ),
              };
            } else if (Array.isArray(old)) {
              return old.map((msg: any) =>
                msg._id === variables.messageId
                  ? { ...msg, content: variables.text, isEdited: true }
                  : msg
              );
            }
            return old;
          }
        );
      }

      return { previousMessages, chatId: chatIdForOptimisticUpdate };
    },
    onError: (err, _unused, context) => {
      console.error("Edit message error:", err);
      if (context?.chatId && context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", context.chatId],
          context.previousMessages
        );
      }
    },
    // Apply server response directly to cache instead of refetching to avoid latency/flicker
    onSuccess: (serverUpdatedMsg: any, _vars, context) => {
      const targetChatId = context?.chatId;
      if (!targetChatId) return;
      queryClient.setQueryData(["messages", targetChatId], (old: any) => {
        if (old && old.messages && Array.isArray(old.messages)) {
          return {
            ...old,
            messages: old.messages.map((msg: any) =>
              msg._id === serverUpdatedMsg?._id ? { ...msg, ...serverUpdatedMsg } : msg
            ),
          };
        }
        return old;
      });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      messageId,
      token,
    }: {
      messageId: string;
      token: string | null;
    }) => deleteMessage(messageId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};

export const useSendMediaMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      chatId,
      files,
      token,
      content,
      replyTo,
      onProgress,
    }: {
      chatId: string;
      files: { images?: File[]; video?: File; documents?: File[] };
      token: string | null;
      content?: string;
      replyTo?: string;
      onProgress?: (percent: number) => void;
    }) => {
      const formData = prepareMediaFormData(files, content, replyTo);
      return sendMediaMessage(chatId, formData, token, onProgress);
    },

    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", variables.chatId],
      });

      const prev = queryClient.getQueryData(["messages", variables.chatId]);

      const optimisticFiles: Array<{
        type: "image" | "video" | "document";
        url: string;
        name: string;
        size: number;
      }> = [];
      variables.files.images?.forEach((f) =>
        optimisticFiles.push({
          type: "image" as const,
          url: URL.createObjectURL(f),
          name: f.name,
          size: f.size,
        })
      );
      if (variables.files.video)
        optimisticFiles.push({
          type: "video" as const,
          url: URL.createObjectURL(variables.files.video),
          name: variables.files.video.name,
          size: variables.files.video.size,
        });
      variables.files.documents?.forEach((f) =>
        optimisticFiles.push({
          type: "document" as const,
          url: URL.createObjectURL(f),
          name: f.name,
          size: f.size,
        })
      );

      const optimisticMsg = {
        _id: `opt-media-${Date.now()}`,
        content: variables.content || "",
        sender: { _id: "current-user", name: "You", isVendor: false },
        createdAt: new Date().toISOString(),
        isVendor: false,
        replyTo: variables.replyTo,
        isOptimistic: true,
        files: optimisticFiles,
        deletedFor: "none",
      };

      queryClient.setQueryData(["messages", variables.chatId], (old: any) => {
        if (old?.messages)
          return { ...old, messages: [...old.messages, optimisticMsg] };
        return { success: true, messages: [optimisticMsg] };
      });

      return { previousMessages: prev, chatId: variables.chatId };
    },

    onError: (_err, _vars, context) => {
      if (context?.chatId && context?.previousMessages)
        queryClient.setQueryData(
          ["messages", context.chatId],
          context.previousMessages
        );
    },

    onSuccess: (serverMsg, vars) => {
      // swap optimistic entry for real one (socket will also deliver)
      queryClient.setQueryData(["messages", vars.chatId], (old: any) => {
        if (!old?.messages) return old;
        return {
          ...old,
          messages: old.messages.map((m: any) =>
            m._id.startsWith("opt-media-") ? serverMsg : m
          ),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};
