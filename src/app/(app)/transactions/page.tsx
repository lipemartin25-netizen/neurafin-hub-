'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Search, Plus, Calendar, Download, X, Sparkles, Trash2, Edit3, Loader2, ChevronDown } from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'
import { C, cardStyle, cardHlStyle, inputStyle, btnGoldStyle, btnOutlineStyle, fmt } from '@/lib/theme'
import { toast } from 'sonner'
import { useTransactions } from '@/hooks/useTransactions'
import { useAccounts } from '@/hooks/useAccounts'
import type { TransactionWithCategory } from '@/types/database'
import { CATEGORIES } from '@/lib/constants'

// =========== Tipos de UI (sem alterar layout) ===========
type UiTx = {
    id: string
    name: string
    desc: string
    amount: number
    type: 'in' | 'out'
    category: string
    categoryIcon: string
    date: string
    account: string
    accountId: string
    raw: TransactionWithCategory
}

function mapToUi(tx: TransactionWithCategory): UiTx {
    const catIcon = tx.categories?.icon ?? (tx.type === 'income' ? '💰' : '🏷️')
    const catName = tx.categories?.name ?? (tx.type === 'income' ? 'Entrada' : 'Geral')
    const accName = tx.accounts?.name ?? 'Conta Principal'
    return {
        id: tx.id,
        name: tx.description?.split(' ')[0] || 'Transação',
        desc: tx.description,
        amount: Number(tx.amount),
        type: tx.type === 'income' ? 'in' : 'out',
        category: catName,
        categoryIcon: catIcon,
        date: tx.date,
        account: accName,
        accountId: tx.account_id,
        raw: tx,
    }
}

export default function TransactionsPage() {
    const { transactions: rawTx, loading, createTransaction, updateTransaction, deleteTransaction } = useTransactions({ limit: 200 })
    const { accounts, loading: loadingAccounts } = useAccounts()

    const transactions = useMemo(() => rawTx.map(mapToUi), [rawTx])

    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all')
    const [showModal, setShowModal] = useState(false)
    const [editingTx, setEditingTx] = useState<UiTx | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)

    // Form State
    const [amount, setAmount] = useState('')
    const [desc, setDesc] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [type, setType] = useState<'out' | 'in'>('out')
    const [selectedAccountId, setSelectedAccountId] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [notes, setNotes] = useState('')
    const [saving, setSaving] = useState(false)

    const filtered = useMemo(() => {
        return transactions.filter((tx) => {
            if (filterType !== 'all' && tx.type !== filterType) return false
            if (search && !tx.name.toLowerCase().includes(search.toLowerCase()) && !tx.desc.toLowerCase().includes(search.toLowerCase())) return false
            return true
        })
    }, [transactions, filterType, search])

    const totalIn = filtered.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0)
    const totalOut = filtered.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0)

    // Group by date
    const grouped = useMemo(() => {
        const g: Record<string, UiTx[]> = {}
        filtered.forEach(tx => { if (!g[tx.date]) g[tx.date] = []; g[tx.date].push(tx) })
        return g
    }, [filtered])

    const sortedDates = useMemo(() =>
        Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
        [grouped]
    )

    const formatDate = (d: string) => {
        const dateObj = new Date(d + 'T12:00:00')
        const today = new Date().toISOString().split('T')[0]
        if (d === today) return 'Hoje'
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        if (d === yesterday.toISOString().split('T')[0]) return 'Ontem'
        return dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const resetForm = useCallback(() => {
        setAmount('')
        setDesc('')
        setDate(new Date().toISOString().split('T')[0])
        setType('out')
        setSelectedAccountId(accounts[0]?.id ?? '')
        setSelectedCategory('')
        setNotes('')
        setEditingTx(null)
    }, [accounts])

    const openCreate = useCallback(() => {
        resetForm()
        setShowModal(true)
    }, [resetForm])

    const openEdit = useCallback((tx: UiTx) => {
        setEditingTx(tx)
        setAmount(String(tx.amount))
        setDesc(tx.desc)
        setDate(tx.date)
        setType(tx.type)
        setSelectedAccountId(tx.accountId)
        setSelectedCategory(tx.raw.category_id ?? '')
        setNotes(tx.raw.notes ?? '')
        setShowModal(true)
    }, [])

    const handleSave = async () => {
        if (!amount || !desc) {
            toast.error('Preencha o valor e a descrição')
            return
        }

        // Se não tem conta selecionada e existem contas, selecionar a primeira
        const accountId = selectedAccountId || accounts[0]?.id
        if (!accountId) {
            toast.error('Crie uma conta bancária antes de adicionar transações', {
                style: { background: C.card, color: C.text, border: `1px solid ${C.border}` }
            })
            return
        }

        setSaving(true)

        if (editingTx) {
            // ========== EDITAR ==========
            const { error } = await updateTransaction(editingTx.id, {
                amount: parseFloat(amount),
                type: type === 'in' ? 'income' : 'expense',
                description: desc,
                date,
                account_id: accountId,
                category_id: selectedCategory || null,
                notes: notes || null,
            })

            setSaving(false)
            if (error) {
                toast.error(error, { style: { background: C.card, color: C.red, border: `1px solid rgba(248,113,113,0.3)` } })
            } else {
                setShowModal(false)
                resetForm()
                toast.success('Transação atualizada!', {
                    style: { background: C.card, color: C.text, border: `1px solid ${C.border}` }
                })
            }
        } else {
            // ========== CRIAR ==========
            const { error } = await createTransaction({
                account_id: accountId,
                amount: parseFloat(amount),
                type: type === 'in' ? 'income' : 'expense',
                description: desc,
                date,
                category_id: selectedCategory || null,
                notes: notes || null,
            })

            setSaving(false)
            if (error) {
                toast.error(error, { style: { background: C.card, color: C.red, border: `1px solid rgba(248,113,113,0.3)` } })
            } else {
                setShowModal(false)
                resetForm()
                toast.success('Transação adicionada com sucesso!', {
                    style: { background: C.card, color: C.text, border: `1px solid ${C.border}` }
                })
            }
        }
    }

    const handleDelete = async (id: string) => {
        setDeleting(id)
        const { error } = await deleteTransaction(id)
        setDeleting(null)

        if (error) {
            toast.error(error, { style: { background: C.card, color: C.red, border: `1px solid rgba(248,113,113,0.3)` } })
        } else {
            toast.success('Transação excluída', {
                style: { background: C.card, color: C.text, border: `1px solid ${C.border}` }
            })
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Transações</h1>
                    <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>
                        {loading ? 'Carregando...' : `${transactions.length} movimentações`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => toast('Em breve: exportar CSV/PDF', { style: { background: C.card, color: C.text, border: `1px solid ${C.border}` } })} style={btnOutlineStyle}>
                        <Download size={16} /> Exportar
                    </button>
                    <button onClick={openCreate} style={btnGoldStyle}><Plus size={16} /> Nova Transação</button>
                </div>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Receitas', value: totalIn, color: C.emerald, Icon: ArrowUpRight },
                    { label: 'Despesas', value: totalOut, color: C.red, Icon: ArrowDownRight },
                    { label: 'Saldo', value: totalIn - totalOut, color: totalIn - totalOut >= 0 ? C.emerald : C.red, Icon: Calendar },
                ].map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        style={{ ...cardStyle, padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, color: C.textMuted }}>{s.label}</span>
                            <s.Icon size={16} style={{ color: s.color }} />
                        </div>
                        <p style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{fmt(s.value)}</p>
                    </motion.div>
                ))}
            </div>

            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textMuted }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar transação..."
                        style={{ ...inputStyle, paddingLeft: 40 }}
                    />
                </div>
                {(['all', 'in', 'out'] as const).map(t => (
                    <button key={t} onClick={() => setFilterType(t)}
                        style={filterType === t ? btnGoldStyle : btnOutlineStyle}>
                        {t === 'all' ? 'Todos' : t === 'in' ? 'Receitas' : 'Despesas'}
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{ ...cardStyle, padding: 64, textAlign: 'center' }}>
                    <Loader2 size={32} style={{ color: C.gold, margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                    <p style={{ fontSize: 14, color: C.textMuted }}>Carregando transações...</p>
                </div>
            )}

            {/* Transaction List */}
            {!loading && sortedDates.map((date, gi) => (
                <div key={date} style={{ marginBottom: 32 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, marginBottom: 12 }}>
                        {formatDate(date)}
                    </p>
                    <AnimatePresence>
                        {grouped[date].map((tx, i) => (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto', x: 0 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                transition={{ delay: gi * 0.05 + i * 0.03 }}
                                style={{
                                    ...cardStyle,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: 16, marginBottom: 8, overflow: 'hidden',
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }} onClick={() => openEdit(tx)}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: tx.type === 'in' ? 'rgba(201,168,88,0.08)' : C.secondary, fontSize: 18,
                                    }}>
                                        {tx.categoryIcon}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{tx.name}</p>
                                        <p style={{ fontSize: 12, color: C.textMuted }}>{tx.desc} · {tx.account}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: tx.type === 'in' ? C.emerald : C.text }}>
                                            {tx.type === 'in' ? '+' : '-'}{fmt(tx.amount)}
                                        </p>
                                        <p style={{ fontSize: 11, color: C.textMuted }}>{tx.category}</p>
                                    </div>

                                    {/* Botão Excluir */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(tx.id) }}
                                        disabled={deleting === tx.id}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8,
                                            color: 'rgba(248,113,113,0.5)', transition: 'color 0.2s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.color = C.red)}
                                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,113,113,0.5)')}
                                        title="Excluir transação"
                                    >
                                        {deleting === tx.id ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ))}

            {!loading && filtered.length === 0 && (
                <div style={{ ...cardStyle, padding: 64, textAlign: 'center' }}>
                    <Search size={40} style={{ color: 'rgba(107,114,128,0.3)', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: 18, fontWeight: 500, color: C.textMuted }}>
                        {transactions.length === 0 ? 'Nenhuma transação ainda' : 'Nenhuma transação encontrada'}
                    </p>
                    {transactions.length === 0 && (
                        <p style={{ fontSize: 13, color: 'rgba(107,114,128,0.5)', marginTop: 8 }}>
                            Clique em &quot;Nova Transação&quot; para começar
                        </p>
                    )}
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
                                    {editingTx ? 'Editar Transação' : 'Nova Transação'}
                                </h2>
                                <button onClick={() => { setShowModal(false); resetForm() }} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            {/* Tipo */}
                            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                                <button onClick={() => setType('out')} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${type === 'out' ? C.red : C.border}`, backgroundColor: type === 'out' ? 'rgba(248,113,113,0.1)' : 'transparent', color: type === 'out' ? C.red : C.textMuted, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Despesa</button>
                                <button onClick={() => setType('in')} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${type === 'in' ? C.emerald : C.border}`, backgroundColor: type === 'in' ? 'rgba(52,211,153,0.1)' : 'transparent', color: type === 'in' ? C.emerald : C.textMuted, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Receita</button>
                            </div>

                            {/* Valor */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Valor</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" style={{ ...inputStyle, fontSize: 24, fontWeight: 700 }} step="0.01" min="0" />
                            </div>

                            {/* Descrição */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: C.textMuted, marginBottom: 6 }}>
                                    Descrição <Sparkles size={12} style={{ color: C.gold }} />
                                </label>
                                <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Supermercado, Uber..." style={inputStyle} />
                                <p style={{ marginTop: 4, fontSize: 11, color: 'rgba(201,168,88,0.5)' }}>IA categoriza automaticamente</p>
                            </div>

                            {/* Conta */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Conta</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={selectedAccountId}
                                        onChange={e => setSelectedAccountId(e.target.value)}
                                        style={selectStyle}
                                    >
                                        <option value="">Selecione uma conta</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name} {acc.bank_name ? `(${acc.bank_name})` : ''}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }} />
                                </div>
                                {accounts.length === 0 && !loadingAccounts && (
                                    <p style={{ marginTop: 4, fontSize: 11, color: C.red }}>
                                        Nenhuma conta cadastrada. Vá em Contas para criar uma.
                                    </p>
                                )}
                            </div>

                            {/* Categoria */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Categoria (opcional)</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={selectedCategory}
                                        onChange={e => setSelectedCategory(e.target.value)}
                                        style={selectStyle}
                                    >
                                        <option value="">Auto-detectar pela IA</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }} />
                                </div>
                            </div>

                            {/* Data */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Data</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
                            </div>

                            {/* Notas */}
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Notas (opcional)</label>
                                <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observações..." style={inputStyle} />
                            </div>

                            {/* Botões */}
                            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                <button onClick={() => { setShowModal(false); resetForm() }} style={{ ...btnOutlineStyle, flex: 1, padding: '12px 0' }}>Cancelar</button>
                                <button onClick={handleSave} disabled={saving} style={{ ...btnGoldStyle, flex: 1, padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
                                    {saving && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                                    {saving ? 'Salvando...' : editingTx ? 'Atualizar' : 'Salvar'}
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
