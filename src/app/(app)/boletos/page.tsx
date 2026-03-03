'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, AlertTriangle, Clock, CheckCircle2, Search, Calendar, X } from 'lucide-react'
import { useState } from 'react'
import { C, cardStyle, cardHlStyle, btnGoldStyle, btnOutlineStyle, inputStyle, fmt } from '@/lib/theme'
import { toast } from 'sonner'

const STATUS = {
    pending: { label: 'Pendente', color: C.yellow, bg: 'rgba(251,191,36,0.1)', Icon: Clock },
    paid: { label: 'Pago', color: C.emerald, bg: 'rgba(52,211,153,0.1)', Icon: CheckCircle2 },
    overdue: { label: 'Vencido', color: C.red, bg: 'rgba(248,113,113,0.1)', Icon: AlertTriangle },
}

type Boleto = { id: string; name: string; desc: string; amount: number; due: string; status: 'pending' | 'paid' | 'overdue'; type: string }

const INITIAL_BOLETOS: Boleto[] = [
    { id: '1', name: 'CPFL Energia', desc: 'Conta de luz', amount: 287.45, due: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], status: 'pending', type: '💡' },
    { id: '2', name: 'Sanasa', desc: 'Conta de água', amount: 98.30, due: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], status: 'overdue', type: '💧' },
    { id: '3', name: 'Condomínio', desc: 'Taxa condominial', amount: 850, due: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], status: 'pending', type: '🏢' },
    { id: '4', name: 'IPTU', desc: '3ª parcela', amount: 412.67, due: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0], status: 'pending', type: '📋' },
    { id: '5', name: 'Unimed', desc: 'Plano de saúde', amount: 680, due: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0], status: 'paid', type: '💊' },
    { id: '6', name: 'Vivo Fibra', desc: 'Internet', amount: 149.90, due: new Date(Date.now() - 86400000 * 12).toISOString().split('T')[0], status: 'paid', type: '🌐' },
]

export default function BoletosPage() {
    const [boletos, setBoletos] = useState<Boleto[]>(INITIAL_BOLETOS)
    const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all')
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)

    // Form State
    const [bName, setBName] = useState('')
    const [bDesc, setBDesc] = useState('')
    const [bAmount, setBAmount] = useState('')
    const [bDue, setBDue] = useState(new Date().toISOString().split('T')[0])

    const filtered = boletos.filter(b => {
        if (filter !== 'all' && b.status !== filter) return false
        if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false
        return true
    }).sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()) // Sort by due date natively

    const overdueItems = boletos.filter(b => b.status === 'overdue')

    const daysUntil = (date: string) => {
        const d = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
        if (d === 0) return 'Hoje'
        if (d < 0) return `${Math.abs(d)}d atrás`
        return `${d}d`
    }

    const markAsPaid = (id: string) => {
        setBoletos(prev => prev.map(b => b.id === id ? { ...b, status: 'paid' } : b))
        toast.success('Boleto marcado como pago!', { style: { background: C.card, color: C.text, border: `1px solid ${C.border}` } })
    }

    const handleSave = () => {
        if (!bName || !bAmount) {
            toast.error('Preencha o nome e o valor')
            return
        }

        const dueDate = new Date(bDue)
        const isOverdue = dueDate.getTime() < Date.now() && dueDate.toISOString().split('T')[0] !== new Date().toISOString().split('T')[0]

        const newB: Boleto = {
            id: Math.random().toString(),
            name: bName,
            desc: bDesc || 'Novo boleto',
            amount: parseFloat(bAmount),
            due: bDue,
            status: isOverdue ? 'overdue' : 'pending',
            type: '🧾'
        }

        setBoletos([...boletos, newB])
        setShowModal(false)
        setBName('')
        setBDesc('')
        setBAmount('')
        toast.success('Boleto adicionado com sucesso!', { style: { background: C.card, color: C.text, border: `1px solid ${C.border}` } })
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Contas a Pagar</h1>
                    <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Acompanhe e controle seus boletos</p>
                </div>
                <button onClick={() => setShowModal(true)} style={btnGoldStyle}><Plus size={16} /> Novo Boleto</button>
            </div>

            <AnimatePresence>
                {overdueItems.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16, border: '1px solid rgba(248,113,113,0.2)', backgroundColor: 'rgba(248,113,113,0.05)', marginBottom: 24, overflow: 'hidden' }}>
                        <AlertTriangle size={24} style={{ color: C.red, flexShrink: 0 }} />
                        <div>
                            <p style={{ fontWeight: 600, color: C.red }}>{overdueItems.length} boleto(s) vencido(s)</p>
                            <p style={{ fontSize: 13, color: 'rgba(248,113,113,0.6)' }}>Total: {fmt(overdueItems.reduce((s, b) => s + b.amount, 0))}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={{ ...inputStyle, paddingLeft: 40 }} />
                </div>
                {(['all', 'pending', 'overdue', 'paid'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={filter === f ? btnGoldStyle : btnOutlineStyle}>
                        {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendentes' : f === 'overdue' ? 'Vencidos' : 'Pagos'}
                    </button>
                ))}
            </div>

            <AnimatePresence>
                {filtered.map((b, i) => {
                    const st = STATUS[b.status]
                    return (
                        <motion.div key={b.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                            style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, marginBottom: 8, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: st.bg }}>
                                    <st.Icon size={18} style={{ color: st.color }} />
                                </div>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 500, color: b.status === 'paid' ? C.textMuted : C.text, textDecoration: b.status === 'paid' ? 'line-through' : 'none' }}>{b.name}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                        <span style={{ fontSize: 12, color: C.textMuted }}>{b.type} {b.desc}</span>
                                        <span style={{ fontSize: 12, color: C.textMuted }}>·</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.textMuted }}>
                                            <Calendar size={10} />
                                            {new Date(b.due + 'T12:00:00').toLocaleDateString('pt-BR')}
                                            <span style={{ fontWeight: 500, color: b.status === 'overdue' ? C.red : b.status === 'pending' ? C.yellow : C.textMuted }}>
                                                ({daysUntil(b.due)})
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <p style={{
                                    fontSize: 16, fontWeight: 700,
                                    color: b.status === 'paid' ? C.textMuted : b.status === 'overdue' ? C.red : C.text,
                                    textDecoration: b.status === 'paid' ? 'line-through' : 'none',
                                }}>{fmt(b.amount)}</p>
                                {b.status !== 'paid' && (
                                    <button onClick={() => markAsPaid(b.id)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', backgroundColor: 'rgba(52,211,153,0.1)', color: C.emerald, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                                        Paguei ✓
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </AnimatePresence>

            {filtered.length === 0 && (
                <div style={{ ...cardStyle, padding: 64, textAlign: 'center' }}>
                    <FileText size={40} style={{ color: 'rgba(107,114,128,0.3)', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: 18, fontWeight: 500, color: C.textMuted }}>Nenhum boleto encontrado</p>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 16 }}
                        onClick={() => setShowModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()} style={{ ...cardHlStyle, width: '100%', maxWidth: 440, padding: 24 }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Novo Boleto</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Nome / Empresa</label>
                                <input value={bName} onChange={e => setBName(e.target.value)} placeholder="Ex: CPFL, Sabesp, Escola..." style={inputStyle} />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Valor (R$)</label>
                                <input type="number" value={bAmount} onChange={e => setBAmount(e.target.value)} placeholder="0,00" style={{ ...inputStyle, fontSize: 24, fontWeight: 700 }} />
                            </div>

                            <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Vencimento</label>
                                    <input type="date" value={bDue} onChange={e => setBDue(e.target.value)} style={inputStyle} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Categoria</label>
                                    <input value={bDesc} onChange={e => setBDesc(e.target.value)} placeholder="Ex: Conta de luz" style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                <button onClick={() => setShowModal(false)} style={{ ...btnOutlineStyle, flex: 1, padding: '12px 0' }}>Cancelar</button>
                                <button onClick={handleSave} style={{ ...btnGoldStyle, flex: 1, padding: '12px 0' }}>Salvar Boleto</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
