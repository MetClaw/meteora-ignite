"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SKILL_DESCRIPTIONS } from "@/lib/skills/registry";
import { SkillResultCard } from "./SkillResultCard";
import { getProject, saveSkillResult } from "@/lib/project-store";
import { buildSkillParams } from "@/lib/agent";
import type { SkillResponse } from "@/lib/skills/types";
import type { Project } from "@/lib/project-store";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  skillResult?: SkillResponse;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  "Review my tokenomics",
  "Configure my pool",
  "Check my trust score",
  "Draft launch content",
  "What are my listing costs?",
  "Build my comms calendar",
  "Am I ready to launch?",
  "Show my launch sequence",
  "Help -- price is dumping",
  "Generate a buyback report",
  "Run my growth playbook",
  "Check my analytics",
];

export function ChatWindow() {
  const [project, setProjectState] = useState<Project | null>(null);

  useEffect(() => {
    setProjectState(getProject());
  }, []);

  const projectName = project?.context.projectName ?? "your project";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update welcome message once project loads
  useEffect(() => {
    if (project) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: `Working on ${project.context.projectName}. ${Object.keys(project.skillResults).length} skills completed so far. Ask me anything or run a skill -- all results are personalized to your project.`,
        timestamp: new Date(),
      }]);
    } else {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Welcome to MetIgnite. Set up your project on the dashboard first, or ask me anything about launching on Meteora.",
        timestamp: new Date(),
      }]);
    }
  }, [project]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const detectSkill = (
    text: string
  ): { skillId: string } | null => {
    const lower = text.toLowerCase();

    if (lower.includes("intake") || lower.includes("start my project") || lower.includes("new project")) return { skillId: "intake" };
    if (lower.includes("trust") || lower.includes("screening")) return { skillId: "trust-score" };
    if (lower.includes("tokenomics") || lower.includes("distribution") || lower.includes("vesting")) return { skillId: "tokenomics-review" };
    if (lower.includes("pool") || lower.includes("dlmm") || lower.includes("dbc") || lower.includes("damm")) return { skillId: "pool-setup" };
    if (lower.includes("content") || lower.includes("draft") || lower.includes("announcement") || lower.includes("thread")) return { skillId: "content-draft" };
    if (lower.includes("listing") || lower.includes("dexscreener") || lower.includes("coingecko") || lower.includes("jupiter")) return { skillId: "listing-ops" };
    if (lower.includes("community") || lower.includes("telegram") || lower.includes("discord")) return { skillId: "community-setup" };
    if (lower.includes("outreach") || lower.includes("kol") || lower.includes("podcast")) return { skillId: "outreach" };
    if (lower.includes("comms") || lower.includes("calendar") || lower.includes("what should i post")) return { skillId: "comms-calendar" };
    if (lower.includes("ready") || lower.includes("readiness") || lower.includes("gate")) return { skillId: "readiness-gate" };
    if (lower.includes("launch sequence") || lower.includes("launch day") || lower.includes("minute by minute")) return { skillId: "launch-sequence" };
    if (lower.includes("monitor") || lower.includes("health") || lower.includes("post-launch") || lower.includes("post launch")) return { skillId: "post-launch-monitor" };
    if (lower.includes("crisis") || lower.includes("dump") || lower.includes("fud") || lower.includes("price drop") || lower.includes("help")) return { skillId: "crisis-response" };
    if (lower.includes("growth") || lower.includes("playbook") || lower.includes("marketing")) return { skillId: "growth-playbook" };
    if (lower.includes("buyback") || lower.includes("burn")) return { skillId: "buyback-reporter" };
    if (lower.includes("analytics") || lower.includes("performance") || lower.includes("volume") || lower.includes("metrics")) return { skillId: "analytics" };

    return null;
  };

  const runSkill = async (
    skillId: string
  ): Promise<SkillResponse | null> => {
    // Build params from project context if available
    const params = project
      ? buildSkillParams(skillId, project)
      : { projectName: "DemoProject", assetType: "utility", budget: "bootstrap", existingCommunitySize: 200 };

    try {
      const res = await fetch(`/api/skills/${skillId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ params }),
      });
      if (!res.ok) return null;
      const result: SkillResponse = await res.json();

      // Save result to project store
      if (project) {
        const updated = saveSkillResult(skillId, result);
        if (updated) setProjectState(updated);
      }

      return result;
    } catch (error) {
      console.error(`Skill ${skillId} failed:`, error);
      return null;
    }
  };

  const handleSend = async (text?: string) => {
    const message = text || input.trim();
    if (!message || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const detected = detectSkill(message);

    if (detected) {
      const thinkingMsg: Message = {
        id: crypto.randomUUID(),
        role: "system",
        content: `Running ${SKILL_DESCRIPTIONS[detected.skillId]?.name ?? detected.skillId} for ${projectName}...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, thinkingMsg]);

      const result = await runSkill(detected.skillId);

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== thinkingMsg.id);
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result?.summary ?? "Skill execution failed. Try again.",
          skillResult: result ?? undefined,
          timestamp: new Date(),
        };
        return [...filtered, assistantMsg];
      });
    } else {
      // No skill detected -- use Claude API for conversational response
      const thinkingMsg: Message = {
        id: crypto.randomUUID(),
        role: "system",
        content: "Thinking...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, thinkingMsg]);

      try {
        // Build conversation history for Claude (last 10 messages)
        const history = messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content }));
        history.push({ role: "user", content: message });

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            context: project?.context ?? null,
          }),
        });

        const data = await res.json();

        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== thinkingMsg.id);
          return [...filtered, {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            content: data.content ?? data.error ?? "Something went wrong. Try again.",
            timestamp: new Date(),
          }];
        });
      } catch {
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== thinkingMsg.id);
          return [...filtered, {
            id: crypto.randomUUID(),
            role: "assistant" as const,
            content: "Failed to connect. Try running a skill instead -- type \"review my tokenomics\" or \"configure my pool\".",
            timestamp: new Date(),
          }];
        });
      }
    }

    setIsLoading(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={
                msg.role === "user" ? "flex justify-end" : "flex justify-start"
              }
            >
              {msg.role === "system" ? (
                <div className="flex items-center gap-2 text-sm text-met-text-tertiary">
                  <span className="inline-block w-2 h-2 rounded-full bg-met-accent-400 animate-pulse-glow" />
                  {msg.content}
                </div>
              ) : (
                <div
                  className={
                    msg.role === "user"
                      ? "max-w-[75%]"
                      : "max-w-[85%] space-y-3"
                  }
                >
                  <Card
                    variant={msg.role === "user" ? "elevated" : "default"}
                    className={
                      msg.role === "user"
                        ? "bg-met-primary-400/10 border-met-primary-400/20"
                        : ""
                    }
                  >
                    <CardBody className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </CardBody>
                  </Card>
                  {msg.skillResult && (
                    <SkillResultCard result={msg.skillResult} />
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 text-xs text-met-text-secondary bg-met-container border border-met-stroke rounded-full hover:border-met-stroke-active hover:text-met-text-primary transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-met-stroke px-4 py-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={project ? `Ask about ${project.context.projectName}...` : "Ask about your launch..."}
            className="flex-1 h-10 px-4 rounded-[8px] bg-met-base-dark border border-met-stroke text-sm text-met-text-primary placeholder:text-met-text-tertiary focus:outline-none focus:border-met-stroke-active transition-colors"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            size="md"
          >
            {isLoading ? "..." : "Send"}
          </Button>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Badge size="sm" variant={project ? "success" : "default"}>
            {project ? `${Object.keys(project.skillResults).length}/17 Complete` : "No Project"}
          </Badge>
          <span className="text-xs text-met-text-tertiary">
            {project ? `${project.context.assetType} -- ${project.context.budget}` : "Set up your project on the dashboard"}
          </span>
        </div>
      </div>
    </div>
  );
}
