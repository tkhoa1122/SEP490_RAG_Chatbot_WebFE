"use client";

import { useState, useCallback, useRef } from "react";
import { useChatStore } from "@/application/store/chatStore";
import { chatRepositoryImpl } from "@/infrastructure/repositories/ChatRepositoryImpl";
import { CreateChatSessionUseCase } from "@/application/usecases/chat/CreateChatSessionUseCase";
import { SendMessageUseCase } from "@/application/usecases/chat/SendMessageUseCase";
import type { ChatMessage } from "@/domain/entities/Chat";

export function useChat(tenantId: string) {
  const { session, messages, isLoading, setSession, addMessage, setLoading, setError } =
    useChatStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const initSession = useCallback(async () => {
    try {
      setLoading(true);
      const useCase = new CreateChatSessionUseCase(chatRepositoryImpl);
      const response = await useCase.execute(tenantId);
      if (response.success && response.data) {
        setSession(response.data as any); // Type assertion in case store uses older types
      } else {
        setError(response.message || "Failed to start chat session");
      }
    } catch (err) {
      setError("Failed to start chat session");
    } finally {
      setLoading(false);
    }
  }, [tenantId, setSession, setLoading, setError]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !session) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage as any); // Type assertion for store compatibility
    setInput("");
    setLoading(true);

    try {
      const useCase = new SendMessageUseCase(chatRepositoryImpl);
      const response = await useCase.execute({
        sessionId: session.id,
        tenantId,
        message: input,
      });
      if (response.success && response.data) {
        addMessage(response.data as any);
      } else {
        setError(response.message || "Failed to send message. Please try again.");
      }
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [input, session, tenantId, addMessage, setLoading, setError]);

  return { messages, isLoading, input, setInput, sendMessage, initSession, bottomRef };
}
