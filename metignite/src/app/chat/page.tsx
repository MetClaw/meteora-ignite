"use client";

import Link from "next/link";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-met-stroke px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm font-bold met-gradient-text hover:opacity-80 transition-opacity"
          >
            MetIgnite
          </Link>
          <span className="text-met-border-primary">/</span>
          <span className="text-sm text-met-text-secondary">Chat</span>
        </div>
        <Link
          href="/"
          className="text-xs text-met-text-tertiary hover:text-met-text-secondary transition-colors"
        >
          Back to Dashboard
        </Link>
      </header>

      {/* Chat */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-3xl mx-auto">
          <ChatWindow />
        </div>
      </main>
    </div>
  );
}
