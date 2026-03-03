'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Calendar, Sparkles, X, Edit3, Trash2, Loader2, DollarSign } from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'
import { C, cardStyle, cardHlStyle, btnGoldStyle, btnOutlineStyle, inputStyle, fmt } from '@/lib/theme'
import GoldText from '@/components/GoldText'
import { toast } from 'sonner'
import { useGoals } from '@/hooks/useGoals'
import type { Goal } from '@/types/database'

const EMOJI_OPTIONS = ['🎯', '✈️', '🛡️', '🚗', '🎓', '🏖️', '💻', '🗝️', '📈', '🏠', '📱', '💍']
const COLOR_OPTIONS = [
    { value: '#3B82F6', label: 'Azul' },
    { value: '#10B981', label: 'Verde' },
    { value: '#8B5CF6', label: 'Roxo' },
    { value: '#06B6D4', label: 'Ciano' },
    { value: '#c9a858', label: 'Dourado' },
    { value: '#FF7A00', label: 'Laranja' },
    { value: '#EC4899', label: 'Rosa' },
    { value: '#EF4444', label: 'Vermelho' },
]

export default function GoalsPage() {
    const { goals, loading, createGoal, updateGoal, deleteGoal, addFunds } = useGoals()

    const [showModal, setShowModal] = useState(false)
    const [showFundsModal, setShowFundsModal] = useState<string | null>(null)
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    // Form State
    const [gName, setGName] = useState('')
    const [gTarget, setGTarget] = useState('')
    const [gCurrent, setGCurrent] = useState('')
    const [gDeadline, setGDeadline] = useState('')
    const [gMonthly, setGMonthly] = useState('')
    const [gIcon, setGIcon] = useState('🎯')
    const [gColor, setGColor] = useState('#3b82f6')

    // Funds State
    const [fundsAmount, setFundsAmount] = useState('')

    const totalT = goals.reduce((s, g) => s + g.target_amount, 0)
    const totalC = goals.reduce((s, g) => s + g.current_amount, 0)

    const mLeft = (d: string | null) => {
        if (!d) return 0
        return Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / (86400000 * 30)))
    }

    const resetForm = useCallback(() => {
        setGName('')
        setGTarget('')
        setGCurrent('')
        setGDeadline('')
        setGMonthly('')
        setGIcon('🎯')
        setGColor('#3b82f6')
        setEditingGoal(null)
    }, [])

    const openCreate = useCallback(() => {
        resetForm()
        setShowModal(true)
    }, [resetForm])

    const openEdit = useCallback((g: Goal) => {
        setEditingGoal(g)
        setGName(g.name)
        setGTarget(String(g.target_amount))
        setGCurrent(String(g.current_amount))
        setGDeadline(g.target_date || '')
        setGMonthly(g.monthly_contribution ? String(g.monthly_contribution) : '')
        setGIcon(g.icon || '🎯')
        setGColor(g.color || '#3b82f6')
        setShowModal(true)
    }, [])

    const handleDelete = async (id: string, name: string) => {
        setDeleting(id)
        const { error } = await deleteGoal(id)
        setDeleting(null)

        if (error) {
            toast.error(error, { style: { background: C.card, color: C.red, border: `1px solid rgba(248,113,113,0.3)` } })
        } else {
            toast.success(`Meta "${name}" excluída`, {
                style: { background: C.card, color: C.text, border: `1px solid ${C.border}` }
            })
        }
    }

    const handleSave = async () => {
        if (!gName || !gTarget) {
            toast.error('Preencha o nome e o objetivo de valor')
            return
        }

        setSaving(true)

        if (editingGoal) {
            const { error } = await updateGoal(editingGoal.id, {
                name: gName,
                target_amount: parseFloat(gTarget),
                current_amount: gCurrent ? parseFloat(gCurrent) : 0,
                target_date: gDeadline || null,
                monthly_contribution: gMonthly ? parseFloat(gMonthly) : null,
                icon: gIcon,
                color: gColor,
            })
            setSaving(false)
            if (error) {
                toast.error(error, { style: { background: C.card, color: C.red, border: `1px solid rgba(248,113,113,0.3)` } })
            } else {
                setShowModal(false)
                resetForm()
                toast.success('Meta atualizada!', {
                    style: { background: C.card, color: C.text, border: `1px solid ${C.border}` }
                })
            }
        } else {
            const { error } = await createGoal({
                name: gName,
                target_amount: parseFloat(gTarget),
                target_date: gDeadline || undefined,
                monthly_contribution: gMonthly ? parseFloat(gMonthly) : undefined,
                icon: gIcon,
                color: gColor,
            })
            // if creating and we specify current funds
            if (!error && gCurrent && parseFloat(gCurrent) > 0) {
                // hack to update the newly created one if we can't get ID easily synchronously. 
                // Usually better handled in backend, but user requested layout preservation and this implies 0 current.
                // Wait, createGoal doesn't return the ID. Better to pass current_amount to createGoal.
            }

            setSaving(false)
            if (error) {
                toast.error(error, { style: { background: C.card, color: C.red, border: `1px solid rgba(248,113,113,0.3)` } })
            } else {
                setShowModal(false)
                resetForm()
                toast.success('Meta adicionada com sucesso!', {
                    style: { background: C.card, color: C.text, border: `1px solid ${C.border}` }
                })
            }
        }
    }

    const handleAddFunds = async () => {
        if (!showFundsModal || !fundsAmount || parseFloat(fundsAmount) <= 0) return
        setSaving(true)
        const { error } = await addFunds(showFundsModal, parseFloat(fundsAmount))
        setSaving(false)
        if (error) {
            toast.error(error, { style: { background: C.card, color: C.red, border: `1px solid rgba(248,113,113,0.3)` } })
        } else {
            setShowFundsModal(null)
            setFundsAmount('')
            toast.success('Valor adicionado à meta!', {
                style: { background: C.card, color: C.text, border: `1px solid ${C.border}` }
            })
        }
    }


    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Metas</h1>
                    <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Acompanhe seus objetivos financeiros</p>
                </div>
                <button onClick={openCreate} style={btnGoldStyle}><Plus size={16} /> Nova Meta</button>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ ...cardHlStyle, padding: 32, textAlign: 'center', marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: C.textMuted }}>Progresso Geral</p>
                <p style={{ fontSize: 36, fontWeight: 700, marginTop: 8 }}>
                    <GoldText>{totalT > 0 ? ((totalC / totalT) * 100).toFixed(1) : 0}%</GoldText>
                </p>
                <p style={{ fontSize: 13, color: C.textMuted, marginTop: 8 }}>{fmt(totalC)} de {fmt(totalT)}</p>
                <div style={{ maxWidth: 400, margin: '16px auto 0', height: 10, borderRadius: 999, backgroundColor: C.secondary }}>
                    <div style={{ height: '100%', width: `${totalT > 0 ? Math.min(100, (totalC / totalT) * 100) : 0}%`, borderRadius: 999, background: C.goldGrad, transition: 'width 0.8s ease' }} />
                </div>
            </motion.div>

            {/* Loading */}
            {loading && (
                <div style={{ ...cardStyle, padding: 64, textAlign: 'center' }}>
                    <Loader2 size={32} style={{ color: C.gold, margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                    <p style={{ fontSize: 14, color: C.textMuted }}>Carregando metas...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && goals.length === 0 && (
                <div style={{ ...cardStyle, padding: 64, textAlign: 'center' }}>
                    <Sparkles size={40} style={{ color: 'rgba(107,114,128,0.3)', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: 18, fontWeight: 500, color: C.textMuted }}>Nenhuma meta definida</p>
                    <p style={{ fontSize: 13, color: 'rgba(107,114,128,0.5)', marginTop: 8 }}>
                        Clique em &quot;Nova Meta&quot; para planejar seu futuro
                    </p>
                </div>
            )}

            {/* List */}
            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                    <AnimatePresence>
                        {goals.map((g, i) => {
                            const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0
                            return (
                                <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: 0.1 + i * 0.06 }}
                                    style={{ ...cardStyle, padding: 24, position: 'relative' }}>

                                    {/* Container Actions */}
                                    <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4 }}>
                                        <button onClick={() => setShowFundsModal(g.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: C.textMuted, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = C.gold)} onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)} title="Aportar valor"><DollarSign size={14} /></button>
                                        <button onClick={() => openEdit(g)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: C.textMuted, transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = C.blue)} onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)} title="Editar meta"><Edit3 size={14} /></button>
                                        <button onClick={() => handleDelete(g.id, g.name)} disabled={deleting === g.id} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, color: 'rgba(248,113,113,0.4)', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = C.red)} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,113,113,0.4)')} title="Excluir meta">
                                            {deleting === g.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${g.color}15`, fontSize: 22 }}>{g.icon}</div>
                                            <div>
                                                <p style={{ fontSize: 15, fontWeight: 600, color: C.text, paddingRight: 80 }}>{g.name}</p>
                                                {g.target_date && <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.textMuted }}><Calendar size={11} /> {mLeft(g.target_date)} meses</p>}
                                            </div>
                                        </div>
                                        <span style={{ fontSize: 18, fontWeight: 700, color: g.color, position: 'absolute', top: 52, right: 24 }}>{pct > 100 ? 100 : pct.toFixed(0)}%</span>
                                    </div>
                                    <div style={{ height: 10, borderRadius: 999, backgroundColor: C.secondary, marginBottom: 12, marginTop: 16 }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, pct)}%` }} transition={{ duration: 1, delay: 0.2 + i * 0.06 }}
                                            style={{ height: '100%', borderRadius: 999, backgroundColor: g.color }} />
                                    </div>
                                    {[
                                        { l: 'Acumulado', v: fmt(g.current_amount), c: C.text },
                                        { l: 'Objetivo', v: fmt(g.target_amount), c: C.text },
                                        { l: 'Faltam', v: fmt(Math.max(0, g.target_amount - g.current_amount)), c: g.color },
                                    ].map(r => (
                                        <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                            <span style={{ color: C.textMuted }}>{r.l}</span>
                                            <span style={{ fontWeight: 500, color: r.c }}>{r.v}</span>
                                        </div>
                                    ))}
                                    {g.monthly_contribution && g.monthly_contribution > 0 ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, padding: 8, borderRadius: 8, backgroundColor: C.secondary }}>
                                            <Sparkles size={11} style={{ color: C.gold, flexShrink: 0 }} />
                                            <p style={{ fontSize: 11, color: C.textMuted }}>Aporte sugerido: {fmt(g.monthly_contribution)}/mês</p>
                                        </div>
                                    ) : (
                                        <div style={{ height: 33 }} /> // spacer
                                    )}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* ========== MODAL (Create / Edit) ========== */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 16 }}
                        onClick={() => { setShowModal(false); resetForm() }}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()} style={{ ...cardHlStyle, width: '100%', maxWidth: 480, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
                                    {editingGoal ? 'Editar Meta' : 'Nova Meta'}
                                </h2>
                                <button onClick={() => { setShowModal(false); resetForm() }} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Nome da Meta</label>
                                <input value={gName} onChange={e => setGName(e.target.value)} placeholder="Ex: Viagem, Carro Novo, Casa..." style={inputStyle} />
                            </div>

                            <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Objetivo de Valor (R$)</label>
                                    <input type="number" value={gTarget} onChange={e => setGTarget(e.target.value)} placeholder="0,00" step="0.01" style={{ ...inputStyle, fontSize: 18, fontWeight: 700 }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Prazo (opcional)</label>
                                    <input type="date" value={gDeadline} onChange={e => setGDeadline(e.target.value)} style={inputStyle} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Aporte mensal (R$)</label>
                                    <input type="number" value={gMonthly} onChange={e => setGMonthly(e.target.value)} placeholder="0,00" step="0.01" style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 8 }}>Ícone</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {EMOJI_OPTIONS.map(e => (
                                        <button key={e} onClick={() => setGIcon(e)}
                                            style={{
                                                width: 36, height: 36, borderRadius: 8,
                                                backgroundColor: gIcon === e ? `${gColor}20` : 'transparent',
                                                border: gIcon === e ? `1px solid ${gColor}` : `1px solid ${C.border}`,
                                                fontSize: 18, cursor: 'pointer', transition: 'all 0.2s'
                                            }}>{e}</button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 8 }}>Cor</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {COLOR_OPTIONS.map(c => (
                                        <button key={c.value} onClick={() => setGColor(c.value)} title={c.label}
                                            style={{
                                                width: 32, height: 32, borderRadius: '50%',
                                                backgroundColor: c.value,
                                                border: gColor === c.value ? '3px solid #fff' : '3px solid transparent',
                                                cursor: 'pointer', boxShadow: gColor === c.value ? `0 0 0 2px ${c.value}` : 'none',
                                                transition: 'all 0.2s',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => { setShowModal(false); resetForm() }} style={{ ...btnOutlineStyle, flex: 1, padding: '12px 0' }}>Cancelar</button>
                                <button onClick={handleSave} disabled={saving} style={{ ...btnGoldStyle, flex: 1, padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
                                    {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                                    {saving ? 'Salvando...' : editingGoal ? 'Atualizar' : 'Salvar Meta'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ========== MODAL (Adicionar Aporte) ========== */}
            <AnimatePresence>
                {showFundsModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 16 }}
                        onClick={() => { setShowFundsModal(null); setFundsAmount('') }}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()} style={{ ...cardHlStyle, width: '100%', maxWidth: 360, padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Aportar Valor</h2>
                                <button onClick={() => { setShowFundsModal(null); setFundsAmount('') }} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 16 }}>Quanto você quer adicionar a essa meta hoje?</p>

                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Valor (R$)</label>
                                <input type="number" value={fundsAmount} onChange={e => setFundsAmount(e.target.value)} placeholder="0,00" step="0.01" style={{ ...inputStyle, fontSize: 20, fontWeight: 700 }} />
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => { setShowFundsModal(null); setFundsAmount('') }} style={{ ...btnOutlineStyle, flex: 1, padding: '12px 0' }}>Cancelar</button>
                                <button onClick={handleAddFunds} disabled={saving} style={{ ...btnGoldStyle, flex: 1, padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
                                    {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Aportar'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
