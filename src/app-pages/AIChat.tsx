import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Sparkles, User, Loader2 } from "lucide-react";

type Message = { role: "user" | "ai"; content: string };

const STARTERS = [
    "📊 Analise meus gastos do mês",
    "💡 Dicas para economizar mais",
    "📈 Como investir meu dinheiro?",
    "🎯 Me ajude a criar uma meta financeira",
];

const AIChat = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: "ai", content: "Olá! Sou o **Nexus**, seu assistente financeiro com IA. Como posso ajudar hoje?" },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;
        setMessages((m) => [...m, { role: "user", content: text }]);
        setInput("");
        setLoading(true);

        // Simulate AI response
        setTimeout(() => {
            setMessages((m) => [
                ...m,
                {
                    role: "ai",
                    content: `Entendi! Você perguntou sobre "${text}". Aqui estão minhas recomendações baseadas no seu perfil financeiro:\n\n1. **Revise seus gastos fixos** — identifique oportunidades de redução\n2. **Aumente seus aportes mensais** — mesmo R$ 100 a mais faz diferença no longo prazo\n3. **Diversifique investimentos** — considere Tesouro IPCA+ para proteção contra inflação\n\n💡 *Quer que eu detalhe algum desses pontos?*`,
                },
            ]);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] flex-col">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-gold">
                    <Sparkles size={18} className="text-background" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-foreground">Nexus AI</h1>
                    <p className="text-xs text-muted-foreground">Assistente financeiro inteligente</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-xs text-emerald-400">Online</span>
                </div>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-border/30 bg-card/50 p-4">
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${msg.role === "ai" ? "bg-gradient-gold text-background" : "bg-secondary text-gold"
                            }`}>
                            {msg.role === "ai" ? <Bot size={14} /> : <User size={14} />}
                        </div>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "ai"
                                ? "bg-secondary text-foreground"
                                : "bg-gradient-gold text-background"
                            }`}>
                            {msg.content.split("\n").map((line, j) => (
                                <p key={j} className={j > 0 ? "mt-2" : ""}>
                                    {line.split("**").map((part, k) =>
                                        k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                                    )}
                                </p>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-gold text-background">
                            <Bot size={14} />
                        </div>
                        <div className="rounded-2xl bg-secondary px-4 py-3">
                            <Loader2 size={16} className="animate-spin text-gold" />
                        </div>
                    </motion.div>
                )}
                <div ref={endRef} />
            </div>

            {/* Starters */}
            {messages.length <= 1 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {STARTERS.map((s) => (
                        <button
                            key={s}
                            onClick={() => sendMessage(s)}
                            className="rounded-full border border-border/50 bg-card px-4 py-2 text-xs text-muted-foreground transition-all hover:border-gold/30 hover:text-gold"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="mt-3 flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                    placeholder="Pergunte sobre suas finanças..."
                    className="flex-1 rounded-xl border border-border/50 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-gold/40"
                />
                <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="btn-gold flex items-center justify-center rounded-xl px-4 disabled:opacity-50"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
};

export default AIChat;
