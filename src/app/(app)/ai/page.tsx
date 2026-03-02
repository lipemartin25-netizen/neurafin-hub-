'use client'

import { useState, useRef, useEffect } from 'react'
import { Brain, Send, Sparkles, X, User } from 'lucide-react'
import { cn } from '@/lib/utils'

type ChatMessage = {
    id: string
    role: 'user' | 'model'
    text: string
    loading?: boolean
}

const STARTER_PROMPTS = [
    '📊 Analise meus gastos deste mês',
    '💡 Onde posso economizar mais?',
    '🎯 Como atingir minha meta de reserva?',
    '📈 Qual a minha taxa de poupança ideal?',
]

function renderText(text: string) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>')
}

export default function AIPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'model',
            text: '👋 Olá! Sou a **NeuraFin IA**, sua assistente financeira pessoal. Tenho acesso ao seu contexto financeiro em tempo real. Como posso ajudar você hoje?',
        },
    ])
    const [input, setInput] = useState('')
    const [isStreaming, setIsStreaming] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function sendMessage(text: string) {
        if (!text.trim() || isStreaming) return
        setInput('')
        setIsStreaming(true)

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text }
        const aiMsgId = (Date.now() + 1).toString()
        const aiMsg: ChatMessage = { id: aiMsgId, role: 'model', text: '', loading: true }
        setMessages(prev => [...prev, userMsg, aiMsg])

        try {
            const history = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({ role: m.role, text: m.text }))

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...history, { role: 'user', text }] }),
            })

            if (!res.ok) throw new Error('Falha na comunicação com IA')

            const reader = res.body?.getReader()
            const decoder = new TextDecoder()
            let fullText = ''

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    fullText += decoder.decode(value, { stream: true })
                    setMessages(prev =>
                        prev.map(m => m.id === aiMsgId ? { ...m, text: fullText, loading: false } : m)
                    )
                }
            }
        } catch {
            setMessages(prev =>
                prev.map(m =>
                    m.id === aiMsgId
                        ? { ...m, text: '❌ Erro ao conectar com a IA. Tente novamente.', loading: false }
                        : m
                )
            )
        } finally {
            setIsStreaming(false)
            inputRef.current?.focus()
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage(input)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto animate-fade-in relative px-4 md:px-0">
            {/* Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-[#ffffff10] pt-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00F260] to-[#10B981] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,242,96,0.3)] border border-[#ffffff20]">
                    <Brain className="w-6 h-6 text-[#03050C]" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2 tracking-tight" style={{ fontFamily: 'Outfit' }}>
                        NeuraFin IA <Sparkles className="w-4 h-4 text-[#F5A623]" />
                    </h1>
                    <p className="text-[13px] font-medium text-[#8e9bb0] tracking-wide mt-0.5">Assistente financeiro de inteligência avançada</p>
                </div>
                <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00F260]/20 bg-[#00F260]/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00F260] animate-pulse shadow-[0_0_8px_rgba(0,242,96,0.8)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#00F260]">Online</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto py-8 space-y-6 scrollbar-none">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn('flex gap-4 animate-fade-in', msg.role === 'user' && 'flex-row-reverse')}
                    >
                        <div className={cn(
                            'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner',
                            msg.role === 'model'
                                ? 'bg-gradient-to-tr from-[#00F260] to-[#10B981] border-[#ffffff20] shadow-[0_0_15px_rgba(0,242,96,0.2)]'
                                : 'bg-[#ffffff05] border-[#ffffff15]'
                        )}>
                            {msg.role === 'model' ? <Brain className="w-5 h-5 text-[#03050C]" /> : <User className="w-5 h-5 text-[#8e9bb0]" />}
                        </div>
                        <div className={cn(
                            'max-w-[85%] rounded-3xl px-6 py-4 text-[15px] leading-relaxed shadow-inner border',
                            msg.role === 'model'
                                ? 'bg-[#ffffff03] text-white border-[#ffffff10] rounded-tl-none'
                                : 'bg-gradient-to-bl from-[#00F260]/10 to-transparent border-[#00F260]/20 text-white rounded-tr-none font-medium'
                        )}>
                            {msg.loading ? (
                                <div className="flex gap-1.5 py-2">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-2 h-2 rounded-full bg-[#00F260] animate-bounce shadow-[0_0_8px_rgba(0,242,96,0.5)]" style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                            ) : (
                                <span dangerouslySetInnerHTML={{ __html: renderText(msg.text) }} className="styled-markup" />
                            )}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Starter Prompts */}
            {messages.length <= 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6">
                    {STARTER_PROMPTS.map((prompt) => (
                        <button
                            key={prompt}
                            onClick={() => sendMessage(prompt)}
                            className="text-left px-5 py-3.5 rounded-2xl bg-[#ffffff05] hover:bg-[#ffffff08] border border-[#ffffff10] hover:border-[#00F260]/30 transition-all font-medium text-[#8e9bb0] hover:text-white text-sm"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="pb-8 pt-2">
                <div className="flex gap-3 items-end bg-[#ffffff05] border border-[#ffffff15] p-2 rounded-3xl shadow-inner focus-within:border-[#00F260]/50 focus-within:shadow-[0_0_20px_rgba(0,242,96,0.1)] transition-all">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Pergunte sobre seus gastos, metas, ou projeções futuras..."
                        rows={1}
                        className="flex-1 bg-transparent text-[15px] text-white placeholder:text-[#8e9bb0] placeholder:font-medium outline-none resize-none leading-relaxed py-3.5 px-4"
                        style={{ maxHeight: 150 }}
                    />
                    {isStreaming ? (
                        <button
                            onClick={() => setIsStreaming(false)}
                            title="Parar de gerar"
                            className="p-3.5 m-1 rounded-2xl bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 border border-[#ef4444]/20 transition-all shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim()}
                            title="Enviar Mensagem"
                            className="p-3.5 m-1 rounded-2xl bg-gradient-to-r from-[#00F260] to-[#10B981] text-[#03050C] disabled:opacity-30 disabled:pointer-events-none hover:shadow-[0_0_15px_rgba(0,242,96,0.4)] transition-all shrink-0"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <p className="text-center text-[10px] text-[#8e9bb0] mt-4 font-bold uppercase tracking-widest pl-1">
                    Powered by SuperIntelligence · Privacidade Total Garantida
                </p>
            </div>
        </div>
    )
}
