/*
 * SakuMari - Japanese Kana Flashcard App
 * Copyright (C) 2025  Sakan Nirattisaykul
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

"use client";

import { useState, useRef, useEffect } from "react";

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TipMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function TipsModal({ isOpen, onClose }: TipsModalProps) {
  const [messages, setMessages] = useState<TipMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const userMessage: TipMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/tips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userQuery: userMessage.content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get learning tips");
      }

      const assistantMessage: TipMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.tip,
        timestamp: data.timestamp,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessages([]);
    setInputValue("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-[80vh] bg-white rounded-lg shadow-2xl border-2 border-[#705a39] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#d1622b] to-[#ae0d13] text-white flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="text-2xl flex-shrink-0">💡</div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold truncate">Kana Learning Tips</h2>
              <p className="text-sm opacity-90 truncate">
                Ask questions about Japanese kana
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors flex-shrink-0 ml-2"
            aria-label="Close tips modal"
          >
            <div className="w-6 h-6 text-xl leading-none">×</div>
          </button>
        </div>

        {/* Messages Display Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-[#fad182]/10 to-[#f5c55a]/10 min-h-0">
          {messages.length === 0 && (
            <div className="text-center text-[#705a39] py-8">
              <div className="text-4xl mb-4">🌸</div>
              <h3 className="text-lg font-semibold mb-2">
                Welcome to Kana Learning Tips!
              </h3>
              <p className="text-sm">
                Ask me anything about learning Japanese hiragana and katakana.
              </p>
              <div className="mt-4 text-xs text-[#705a39]/80">
                Example: "How can I memorize hiragana faster?" or "Tips for
                katakana practice?"
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="mb-4">
              {message.type === "user" ? (
                <div className="flex justify-between gap-4">
                  <div className="w-1/2"></div>
                  <div className="w-1/2">
                    <div className="bg-[#d1622b] text-white rounded-lg rounded-br-none p-3 shadow-sm">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between gap-4">
                  <div className="w-1/2">
                    <div className="bg-white border-2 border-[#705a39]/20 text-[#403933] rounded-lg rounded-bl-none p-3 shadow-sm">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="mb-4">
              <div className="flex justify-between gap-4">
                <div className="w-1/2">
                  <div className="bg-white border-2 border-[#705a39]/20 rounded-lg rounded-bl-none p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#d1622b] rounded-full animate-pulse"></div>
                        <div
                          className="w-2 h-2 bg-[#d1622b] rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-[#d1622b] rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-[#705a39]">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-1/2"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t-2 border-[#705a39]/20 bg-white flex-shrink-0">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about kana learning techniques..."
                  className="w-full p-3 border-2 border-[#705a39]/30 rounded-lg focus:border-[#d1622b] focus:outline-none text-sm"
                  disabled={isLoading}
                  maxLength={500}
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="px-6 py-3 bg-[#d1622b] text-white rounded-lg hover:bg-[#ae0d13] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isLoading ? "..." : "Ask"}
                </button>
              </div>
            </div>
          </form>
          <div className="text-xs text-[#705a39]/70 mt-2">
            Ask questions about Japanese kana learning techniques and
            strategies.
          </div>
        </div>
      </div>
    </div>
  );
}
