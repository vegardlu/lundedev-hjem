"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";

interface Message {
    role: "user" | "model";
    text: string;
}

interface ChatInterfaceProps {
    token?: string;
    userName?: string;
}

export function ChatInterface({ token, userName }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
        setInput("");
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

            const res = await fetch(`${apiUrl}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!res.ok) {
                throw new Error(`Error: ${res.status}`);
            }

            const data = await res.json();
            setMessages((prev) => [...prev, { role: "model", text: data.response }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "model", text: "Sorry, I encountered an error. Please try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="w-full max-w-3xl mx-auto mb-12">
            <div className="flex flex-col gap-6">

                {/* Messages Area - Only shows when there are messages */}
                {messages.length > 0 && (
                    <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6 max-h-[500px] overflow-y-auto backdrop-blur-sm">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user"
                                        ? "bg-blue-600"
                                        : "bg-gradient-to-tr from-blue-500 to-purple-600"
                                        }`}>
                                        {msg.role === "user" ? (
                                            <span className="text-xs font-bold text-white">
                                                {userName?.charAt(0).toUpperCase() || "U"}
                                            </span>
                                        ) : (
                                            <Sparkles size={14} className="text-white" />
                                        )}
                                    </div>

                                    <div
                                        className={`rounded-2xl px-5 py-3 text-sm leading-relaxed ${msg.role === "user"
                                            ? "bg-blue-600/20 text-blue-100 border border-blue-500/30"
                                            : "bg-zinc-800/50 text-zinc-300 border border-zinc-700/50"
                                            }`}
                                    >
                                        <div className="whitespace-pre-wrap">{msg.text}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                                        <Loader2 size={14} className="animate-spin text-white" />
                                    </div>
                                    <div className="bg-zinc-800/50 rounded-2xl px-5 py-3 text-sm text-zinc-400 border border-zinc-700/50 flex items-center">
                                        Thinking...
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Input Area - Search Bar Style */}
                <div className="relative group w-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <form onSubmit={handleSubmit} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Styr hjemmet vårt med en prat...`}
                            className="w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 focus:border-zinc-500 rounded-full py-4 pl-6 pr-14 text-lg text-zinc-100 placeholder:text-zinc-500 shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 p-2.5 rounded-full bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800/50 transition-all duration-200"
                        >
                            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
