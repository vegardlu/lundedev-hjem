"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";

interface Message {
    role: "user" | "model";
    text: string;
}

interface ChatWidgetProps {
    token?: string;
    userName?: string;
}

export function ChatWidget({ token, userName }: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
        setInput("");
        setIsLoading(true);

        try {
            // Determine API URL: similar logic to dashboard, but we are client side.
            // We'll use relative path if possible, but the backend is on port 8080/8085 usually?
            // Wait, lundedev-hjem and lundedev-core are different services.
            // In dev, Nextjs is 3000, Core is 8080.
            // We need to proxy or use full URL. 
            // page.tsx used env vars for server-side fetch.
            // For client-side fetch, we usually need NEXT_PUBLIC_API_URL or a Next.js rewrite.
            // Let's assume NEXT_PUBLIC_API_URL is set in .env

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

    if (!token) {
        // Don't show chat if not authenticated? Or show but prompt login?
        // Based on layout, we might not have token if not logged in.
        // For now, let's return null if no token.
        return null;
    }

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-300 z-50 ${isOpen
                        ? "bg-zinc-800 text-zinc-400 rotate-90"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-110"
                    }`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>

            {/* Chat Window */}
            <div
                className={`fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl transition-all duration-300 origin-bottom-right z-50 flex flex-col overflow-hidden ${isOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 translate-y-10 pointer-events-none"
                    }`}
                style={{ height: "500px", maxHeight: "80vh" }}
            >
                {/* Header */}
                <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">AI</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-100">Gemini Assistant</h3>
                        <p className="text-xs text-zinc-400">Powered by Vertex AI</p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50">
                    {messages.length === 0 && (
                        <div className="text-center text-zinc-500 mt-10">
                            <p className="mb-2">👋 Hi {userName?.split(" ")[0] || "there"}!</p>
                            <p className="text-sm">I can help you control your home.</p>
                            <p className="text-xs mt-4 opacity-50">Try "Turn on the kitchen lights"</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-zinc-800 text-zinc-200 rounded-bl-none"
                                    }`}
                            >
                                <div className="whitespace-pre-wrap">{msg.text}</div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-zinc-800 rounded-2xl rounded-bl-none px-4 py-3">
                                <Loader2 size={16} className="animate-spin text-zinc-400" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-zinc-900 border-t border-zinc-800">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask something..."
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
