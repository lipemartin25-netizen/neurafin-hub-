'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Plus, Eye, EyeOff, Calendar, AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { C, cardStyle, cardHlStyle, btnGoldStyle, btnOutlineStyle, inputStyle, fmt } from '@/lib/theme'
import { toast } from 'sonner'

type InvoiceItem = { desc: string; amount: number; date: string }
type CardData = {
    id: string; name: string; last4: string; limit: number; used: number;
    closing: number; due: number; color: string; invoice: InvoiceItem[]
}

const INITIAL_CARDS: CardData[] = [
    {
        id: '1', name: 'Nubank Mastercard', last4: '4321', limit: 15000, used: 4250, closing: 8, due: 15, color: 'linear-gradient(135deg, #7c3aed, #581c87)',
        invoice: [{ desc: 'iFood', amount: 67.80, date: '28 Fev' }, { desc: 'Amazon', amount: 14.90, date: '27 Fev' }, { desc: 'Posto Shell', amount: 280, date: '26 Fev' }]
    },
    {
        id: '2', name: 'Inter Visa', last4: '8765', limit: 8000, used: 1890, closing: 1, due: 8, color: 'linear-gradient(135deg, #f97316, #c2410c)',
        invoice: [{ desc: 'Uber', amount: 45, date: '01 Mar' }, { desc: 'Spotify', amount: 34.90, date: '28 Fev' }]
    },
    {
        id: '3', name: 'Itaú Platinum', last4: '1234', limit: 25000, used: 12450, closing: 15, due: 22, color: 'linear-gradient(135deg, #1d4ed8, #1e3a5f)',
        invoice: [{ desc: 'Passagem aérea', amount: 2800, date: '20 Fev' }, { desc: 'Hotel', amount: 1450, date: '18 Fev' }]
    },
]

export default function CardsPage() {
    const [cards, setCards] = useState<CardData[]>(INITIAL_CARDS)
    const [showValues, setShowValues] = useState(true)
    const [selected, setSelected] = useState(INITIAL_CARDS[0].id)
    const [showModal, setShowModal] = useState(false)

    // Form State
    const [cName, setCName] = useState('')
    const [cLimit, setCLimit] = useState('')
    const [cLast4, setCLast4] = useState('')

    const display = (v: number) => showValues ? fmt(v) : '•••••'
    const card = cards.find(c => c.id === selected) || cards[0]
    const utilization = card ? (card.used / card.limit) * 100 : 0

    const handleSave = () => {
        if (!cName || !cLimit || !cLast4) {
            toast.error('Preencha os campos obrigatórios')
            return
        }

        const newC: CardData = {
            id: Math.random().toString(),
            name: cName,
            last4: cLast4.slice(0, 4),
            limit: parseFloat(cLimit),
            used: 0,
            closing: 1,
            due: 10,
            color: 'linear-gradient(135deg, #12151a, #0b0d10)', // dark metal gradient
            invoice: []
        }

        setCards([...cards, newC])
        setSelected(newC.id)
        setShowModal(false)
        setCName('')
        setCLimit('')
        setCLast4('')
        toast.success('Cartão adicionado com sucesso!', { style: { background: C.card, color: C.text, border: `1px solid ${C.border}` } })
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Cartões</h1>
                    <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Gerencie seus cartões de crédito</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => setShowValues(!showValues)} style={btnOutlineStyle}>
                        {showValues ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={() => setShowModal(true)} style={btnGoldStyle}><Plus size={16} /> Novo Cartão</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 350px) 1fr', gap: 24 }}>
                {/* Card Visuals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <AnimatePresence>
                        {cards.map((c, i) => (
                            <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                onClick={() => setSelected(c.id)}
                                style={{
                                    background: c.color, borderRadius: 16, padding: 24, cursor: 'pointer',
                                    opacity: selected === c.id ? 1 : 0.6,
                                    outline: selected === c.id ? `2px solid ${C.gold}` : 'none',
                                    outlineOffset: 3, transition: 'all 0.3s ease',
                                }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
                                    <CreditCard size={28} style={{ color: 'rgba(255,255,255,0.5)' }} />
                                </div>
                                <p style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>
                                    •••• •••• •••• {c.last4}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Fatura atual</p>
                                        <p style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{display(c.used)}</p>
                                    </div>
                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{c.name}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Invoice Detail */}
                {card && (
                    <motion.div key={selected} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ ...cardStyle, padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div>
                                <h3 style={{ fontWeight: 600, color: C.text }}>{card.name}</h3>
                                <p style={{ fontSize: 12, color: C.textMuted }}>Fatura atual</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 12, color: C.textMuted }}>Vencimento</p>
                                <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 500, color: C.gold }}>
                                    <Calendar size={14} /> Dia {card.due}
                                </p>
                            </div>
                        </div>

                        {/* Utilization */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                                <span style={{ color: C.textMuted }}>{utilization.toFixed(0)}% utilizado</span>
                                <span style={{ color: C.textMuted }}>Limite: {display(card.limit)}</span>
                            </div>
                            <div style={{ height: 10, borderRadius: 999, backgroundColor: C.secondary }}>
                                <div style={{
                                    height: '100%', width: `${utilization}%`, borderRadius: 999, transition: 'width 0.8s ease',
                                    background: utilization > 80 ? C.red : utilization > 60 ? C.yellow : C.goldGrad,
                                }} />
                            </div>
                            {utilization > 80 && (
                                <p style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 12, color: C.red }}>
                                    <AlertTriangle size={12} /> Utilização alta!
                                </p>
                            )}
                        </div>

                        {/* Items */}
                        <h4 style={{ fontSize: 13, color: C.textMuted, marginBottom: 12 }}>Lançamentos</h4>
                        {card.invoice.length === 0 ? (
                            <div style={{ padding: 24, textAlign: 'center', color: C.textMuted, backgroundColor: C.secondary, borderRadius: 12 }}>Nenhum lançamento nesta fatura</div>
                        ) : (
                            card.invoice.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: 12, borderRadius: 8, backgroundColor: C.secondary, marginBottom: 8,
                                }}>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{item.desc}</p>
                                        <p style={{ fontSize: 11, color: C.textMuted }}>{item.date}</p>
                                    </div>
                                    <p style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{display(item.amount)}</p>
                                </div>
                            ))
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 16 }}>
                            <span style={{ fontWeight: 500, color: C.textMuted }}>Total da fatura</span>
                            <span style={{ fontSize: 20, fontWeight: 700, color: C.text }}>{display(card.used)}</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 16 }}
                        onClick={() => setShowModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()} style={{ ...cardHlStyle, width: '100%', maxWidth: 440, padding: 24 }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Novo Cartão</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Nome do Cartão</label>
                                <input value={cName} onChange={e => setCName(e.target.value)} placeholder="Ex: Nu, Black, Azul..." style={inputStyle} />
                            </div>

                            <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Limite (R$)</label>
                                    <input type="number" value={cLimit} onChange={e => setCLimit(e.target.value)} placeholder="0,00" style={inputStyle} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Final (4 dígitos)</label>
                                    <input value={cLast4} onChange={e => setCLast4(e.target.value)} placeholder="1234" maxLength={4} style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                <button onClick={() => setShowModal(false)} style={{ ...btnOutlineStyle, flex: 1, padding: '12px 0' }}>Cancelar</button>
                                <button onClick={handleSave} style={{ ...btnGoldStyle, flex: 1, padding: '12px 0' }}>Salvar Cartão</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
