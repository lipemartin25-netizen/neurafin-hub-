'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, AlertTriangle, CheckCircle2, X, Trash2, Loader2, ChevronDown } from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'
import { C, cardStyle, cardHlStyle, btnGoldStyle, btnOutlineStyle, inputStyle, fmt } from '@/lib/theme'
import { toast } from 'sonner'
import { useBudgets } from '@/hooks/useBudgets'
import type { BudgetWithSpent } from '@/hooks/useBudgets'
import { CATEGORIES } from '@/lib/constants'

export default function BudgetsPage() {
    const { budgets, loading, createBudget, updateBudget, deleteBudget } = useBudgets()

    const [showModal, setShowModal] = useState(false)
    const [editingBudget, setEditingBudget] = useState<BudgetWithSpent | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    // Form State
    const [selectedCategory, setSelectedCategory] = useState('')
    const [limitAmount, setLimitAmount] = useState('')
    const [alertThreshold, setAlertThreshold] = useState('80')

    const totalLimit = budgets.reduce((s, b) => s + b.amount, 0)
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
    const overBudget = budgets.filter(b => b.spent > b.amount)

    // Categorias que ainda não têm budget
    const availableCategories = useMemo(() => {
        const usedIds = new Set(budgets.map(b => b.category_id))
        return CATEGORIES.filter(c => c.type === 'expense' && !usedIds.has(c.id))
    }, [budgets])

    const resetForm = useCallback(() => {
        setSelectedCategory('')
        setLimitAmount('')
        setAlertThreshold('80')
        setEditingBudget(null)
    }, [])

    const openCreate = useCallback(() => {
        resetForm()
        setShowModal(true)
    }, [resetForm])

    const openEdit = useCallback((b: BudgetWithSpent) => {
        setEditingBudget(b)
        setSelectedCategory(b.category_id)
        setLimitAmount(String(b.amount))
        setAlertThreshold(String(b.alert_threshold))
        setShowModal(true)
    }, [])

    const handleSave = async () => {
        if (!limitAmount) {
            toast.error('Preencha o limite do orçamento')
            return
        }

        setSaving(true)

        if (editingBudget) {
            const { error } = await updateBudget(editingBudget.id, {
                amount: parseFloat(limitAmount),
                alert_threshold: parseInt(alertThreshold) || 80,
            })

            setSaving(false)
            if (error) {
                toast.error(error, { style: { background: C.card, color: C.red, border: `1px solid rgba(248,113,113,0.3)` } })
            } else {
                setShowModal(false)
                resetForm()
                toast.success('Orçamento atualizado!', { style: { background: C.card, color: C.text, border: `1px solid ${C.border}` } })
            }
        } else {
            if (!selectedCategory) {
                setSaving(false)
                toast.error('Selecione uma categoria')
                return
            }

            const { error } = await createBudget({
                category_id: selectedCategory,
                amount: parseFloat(limitAmount),
                alert_threshold: parseInt(alertThreshold) || 80,
            })

            setSaving(false)
            if (error) {
                toast.error(error, { style: { background: C.card, color: C.red, border: `1px solid rgba(248,113,113,0.3)` } })
            } else {
                setShowModal(false)
                resetForm()
                toast.success('Orçamento criado!', { style: { background: C.card, color: C.text, border: `1px solid ${C.border}` } })
            }
        }
    }

    const handleDelete = async (id: string) => {
        setDeleting(id)
        const { error } = await deleteBudget(id)
        setDeleting(null)

        if (error) {
            toast.error(error, { style: { background: C.card, color: C.red, border: `1px solid rgba(248,113,113,0.3)` } })
        } else {
            toast.success('Orçamento removido', { style: { background: C.card, color: C.text, border: `1px solid ${C.border}` } })
        }
    }

    const selectStyle: React.CSSProperties = {
        ...inputStyle,
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage: 'none',
        cursor: 'pointer',
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Orçamentos</h1>
                    <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>
                        {loading ? 'Carregando...' : 'Controle seus limites por categoria'}
                    </p>
                </div>
                <button onClick={openCreate} style={btnGoldStyle}><Plus size={16} /> Novo Orçamento</button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Orçamento Total', value: fmt(totalLimit), color: C.textMuted },
                    { label: 'Total Gasto', value: fmt(totalSpent), color: totalSpent > totalLimit ? C.red : C.emerald },
                    { label: 'Disponível', value: fmt(Math.max(0, totalLimit - totalSpent)), color: totalLimit - totalSpent >= 0 ? C.emerald : C.red },
                    { label: 'Estouradas', value: `${overBudget.length} de ${budgets.length}`, color: overBudget.length > 0 ? C.red : C.emerald },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        style={{ ...cardStyle, padding: 20 }}>
                        <p style={{ fontSize: 13, color: C.textMuted }}>{s.label}</p>
                        <p style={{ fontSize: 20, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ ...cardStyle, padding: 64, textAlign: 'center' }}>
                    <Loader2 size={32} style={{ color: C.gold, margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                    <p style={{ fontSize: 14, color: C.textMuted }}>Carregando orçamentos...</p>
                </div>
            )}

            {/* Empty */}
            {!loading && budgets.length === 0 && (
                <div style={{ ...cardStyle, padding: 64, textAlign: 'center' }}>
                    <p style={{ fontSize: 40, margin: '0 auto 16px' }}>📊</p>
                    <p style={{ fontSize: 18, fontWeight: 500, color: C.textMuted }}>Nenhum orçamento definido</p>
                    <p style={{ fontSize: 13, color: 'rgba(107,114,128,0.5)', marginTop: 8 }}>
                        Defina limites por categoria para controlar seus gastos
                    </p>
                </div>
            )}

            {/* Budget Cards */}
            {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
                    {budgets.map((b, i) => {
                        const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0
                        const over = b.spent > b.amount
                        return (
                            <motion.div key={b.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                                style={{ ...cardStyle, padding: 20, cursor: 'pointer', position: 'relative' }}
                                onClick={() => openEdit(b)}>

                                {/* Delete button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(b.id) }}
                                    disabled={deleting === b.id}
                                    style={{
                                        position: 'absolute', top: 12, right: 12,
                                        background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8,
                                        color: 'rgba(248,113,113,0.4)', transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.color = C.red)}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,113,113,0.4)')}
                                    title="Remover orçamento"
                                >
                                    {deleting === b.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                                </button>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 22 }}>{b.category_icon}</span>
                                        <div>
                                            <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{b.category_name}</p>
                                            <p style={{ fontSize: 12, color: C.textMuted }}>Limite: {fmt(b.amount)}</p>
                                        </div>
                                    </div>
                                    {over
                                        ? <AlertTriangle size={18} style={{ color: C.red }} />
                                        : pct < 80 ? <CheckCircle2 size={18} style={{ color: C.emerald }} /> : null
                                    }
                                </div>

                                {/* Progress bar */}
                                <div style={{ height: 10, borderRadius: 999, backgroundColor: C.secondary, marginBottom: 8 }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min(100, pct)}%`,
                                        borderRadius: 999,
                                        background: over ? C.red : pct > 80 ? C.yellow : b.category_color,
                                        transition: 'width 0.8s ease',
                                    }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                    <span style={{ color: over ? C.red : C.textMuted }}>{fmt(b.spent)} ({pct.toFixed(0)}%)</span>
                                    <span style={{ color: C.textMuted }}>
                                        Restam: {over
                                            ? <span style={{ color: C.red }}>+{fmt(b.spent - b.amount)} excesso</span>
                                            : fmt(b.amount - b.spent)
                                        }
                                    </span>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* ========== MODAL ========== */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 16 }}
                        onClick={() => { setShowModal(false); resetForm() }}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()} style={{ ...cardHlStyle, width: '100%', maxWidth: 440, padding: 24 }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>
                                    {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
                                </h2>
                                <button aria-label="Ação" onClick={() => { setShowModal(false); resetForm() }} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            {/* Categoria */}
                            {!editingBudget && (
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Categoria</label>
                                    <div style={{ position: 'relative' }}>
                                        <select aria-label="Selecionar opção" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={selectStyle}>
                                            <option value="">Selecione uma categoria</option>
                                            {availableCategories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }} />
                                    </div>
                                    {availableCategories.length === 0 && (
                                        <p style={{ marginTop: 4, fontSize: 11, color: C.yellow }}>Todas as categorias já possuem orçamento</p>
                                    )}
                                </div>
                            )}

                            {editingBudget && (
                                <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, backgroundColor: C.secondary }}>
                                    <span style={{ fontSize: 22 }}>{editingBudget.category_icon}</span>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{editingBudget.category_name}</p>
                                        <p style={{ fontSize: 12, color: C.textMuted }}>Gasto atual: {fmt(editingBudget.spent)}</p>
                                    </div>
                                </div>
                            )}

                            {/* Limite */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Limite Mensal (R$)</label>
                                <input type="number" value={limitAmount} onChange={e => setLimitAmount(e.target.value)} placeholder="0,00" step="0.01" min="0" style={{ ...inputStyle, fontSize: 24, fontWeight: 700 }} />
                            </div>

                            {/* Alerta */}
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Alertar quando atingir (%)</label>
                                <input type="number" value={alertThreshold} onChange={e => setAlertThreshold(e.target.value)} placeholder="80" min="50" max="100" style={inputStyle} />
                                <p style={{ marginTop: 4, fontSize: 11, color: C.textMuted }}>Você receberá um alerta quando gastar {alertThreshold || 80}% do limite</p>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => { setShowModal(false); resetForm() }} style={{ ...btnOutlineStyle, flex: 1, padding: '12px 0' }}>Cancelar</button>
                                <button onClick={handleSave} disabled={saving} style={{ ...btnGoldStyle, flex: 1, padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
                                    {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                                    {saving ? 'Salvando...' : editingBudget ? 'Atualizar' : 'Criar Orçamento'}
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
