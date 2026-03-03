'use client'

import { motion } from 'framer-motion'
import { Bot, Send, User, Loader2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { C, cardStyle, inputStyle } from '@/lib/theme'

type Msg = { role: 'user' | 'ai'; text: string }

const SUGGESTIONS = [
    '📊 Resuma meus gastos do mês',
    '💡 Como posso economizar mais?',
    '📈 Analise minha carteira',
    '🎯 Estou no caminho certo?',
]

const RESPONSES: Record<string, string> = {
    gasto: '📊 Gastos Fev/2026:\n\n• 🏠 Moradia: R$ 3.500 (34%)\n• 🍔 Alimentação: R$ 1.800 (+18%)\n• 🛍️ Compras: R$ 1.320 (ACIMA)\n\n⚠️ Reduza compras em 25% para ficar no orçamento.',
    econom: '💡 3 formas de economizar:\n\n1. Alimentação: cashback + planejamento → R$ 400/mês\n2. Assinaturas: cancele 2 menos usadas → R$ 80/mês\n3. Transporte: carona 2x/sem → R$ 200/mês\n\n💰 Total: R$ 680/mês extras!',
    carteira: '📊 Sua carteira:\n\n• Renda Fixa: 56% (ideal: 40-50%)\n• Ações: 15% (ideal: 20-30%)\n• FIIs: 15% ✅\n• Cripto: 14% (reduzir para 5-10%)\n\n📈 Rentabilidade: +8.2%\n💡 Rebalanceie: mais ações, menos RF.',
    meta: '🎯 Suas metas:\n\n✅ MacBook: 90% — No caminho!\n✅ Reserva: 90% — Excelente!\n⚠️ Viagem: 74% — Aumentar aportes\n🔴 Carro: 40% — Precisa R$ 4.800/mês',
}

export default function AIPage() {
    const [messages, setMessages] = useState<Msg[]>([
        { role: 'ai', text: 'Olá! Sou a Nexus IA, sua consultora financeira. Como posso ajudar? 🧠' },
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const endRef = useRef<HTMLDivElement>(null)

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

    const send = (text: string) => {
        if (!text.trim() || loading) return
        setMessages(p => [...p, { role: 'user', text }])
        setInput('')
        setLoading(true)

        setTimeout(() => {
            const lower = text.toLowerCase()
            let resp = 'Analisando seus dados financeiros...\n\nSeus investimentos têm +8.2% acumulado — acima do mercado. Quer que eu detalhe algo específico?'
            if (lower.includes('gasto') || lower.includes('resum')) resp = RESPONSES.gasto
            else if (lower.includes('econom') || lower.includes('dica')) resp = RESPONSES.econom
            else if (lower.includes('carteira') || lower.includes('investim')) resp = RESPONSES.carteira
            else if (lower.includes('meta') || lower.includes('caminho')) resp = RESPONSES.meta

            setMessages(p => [...p, { role: 'ai', text: resp }])
            setLoading(false)
        }, 1500)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' }}>
            <div style={{ marginBottom: 16 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Assistente IA</h1>
                <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Nexus IA — consultora financeira pessoal</p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
                {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', gap: 12, marginBottom: 16, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                        {msg.role === 'ai' && (
                            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.goldGrad, flexShrink: 0 }}>
                                <Bot size={18} style={{ color: C.bg }} />
                            </div>
                        )}
                        <div style={{
                            maxWidth: '70%', padding: 16, borderRadius: 16,
                            ...(msg.role === 'user'
                                ? { background: C.goldGrad, color: C.bg, borderBottomRightRadius: 4 }
                                : { background: C.cardGrad, border: `1px solid ${C.borderGold}`, borderBottomLeftRadius: 4, color: C.text }),
                        }}>
                            <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        </div>
                        {msg.role === 'user' && (
                            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: C.secondary, flexShrink: 0 }}>
                                <User size={18} style={{ color: C.textMuted }} />
                            </div>
                        )}
                    </motion.div>
                ))}
                {loading && (
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.goldGrad, flexShrink: 0 }}>
                            <Bot size={18} style={{ color: C.bg }} />
                        </div>
                        <div style={{ ...cardStyle, padding: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Loader2 size={16} style={{ color: C.gold, animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: 13, color: C.textMuted }}>Analisando...</span>
                        </div>
                    </div>
                )}
                <div ref={endRef} />
            </div>

            {messages.length <= 2 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {SUGGESTIONS.map(s => (
                        <button key={s} onClick={() => send(s)} style={{
                            padding: '8px 14px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
                            backgroundColor: 'rgba(201,168,88,0.05)', border: '1px solid rgba(201,168,88,0.15)', color: C.gold,
                        }}>{s}</button>
                    ))}
                </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
                    placeholder="Pergunte sobre suas finanças..." style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => send(input)} disabled={loading || !input.trim()}
                    style={{
                        width: 48, height: 48, borderRadius: 12, border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                        background: input.trim() ? C.goldGrad : C.secondary,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: input.trim() ? 1 : 0.5,
                    }}>
                    <Send size={18} style={{ color: input.trim() ? C.bg : C.textMuted }} />
                </button>
            </div>
            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
