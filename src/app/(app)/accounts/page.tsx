'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Building2, PiggyBank, TrendingUp, Wallet, Plus, Eye, EyeOff, X } from 'lucide-react'
import { useState } from 'react'
import { C, cardStyle, cardHlStyle, inputStyle, btnGoldStyle, btnOutlineStyle, fmt } from '@/lib/theme'
import GoldText from '@/components/GoldText'
import { toast } from 'sonner'

const ICON_MAP: Record<string, any> = { checking: Building2, savings: PiggyBank, investment: TrendingUp, cash: Wallet }
const TYPE_MAP: Record<string, string> = { checking: 'Conta Corrente', savings: 'Poupança', investment: 'Investimento', cash: 'Dinheiro' }

type Account = { id: string; name: string; type: string; institution: string; balance: number; color: string }

const INITIAL_ACCOUNTS: Account[] = [
    { id: '1', name: 'Nubank', type: 'checking', institution: 'Nubank', balance: 12450.80, color: '#8B5CF6' },
    { id: '2', name: 'Itaú', type: 'checking', institution: 'Itaú Unibanco', balance: 8320.45, color: '#003399' },
    { id: '3', name: 'Inter', type: 'checking', institution: 'Banco Inter', balance: 3200, color: '#FF7A00' },
    { id: '4', name: 'Poupança BB', type: 'savings', institution: 'Banco do Brasil', balance: 45000, color: '#FFEF00' },
    { id: '5', name: 'XP', type: 'investment', institution: 'XP Investimentos', balance: 128500, color: '#1D1D1B' },
    { id: '6', name: 'Tesouro Direto', type: 'investment', institution: 'Tesouro Nacional', balance: 67800, color: '#009B3A' },
    { id: '7', name: 'Carteira', type: 'cash', institution: '', balance: 350, color: '#6B7280' },
]

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS)
    const [showValues, setShowValues] = useState(true)
    const [showModal, setShowModal] = useState(false)

    // Modal State
    const [accName, setAccName] = useState('')
    const [accBalance, setAccBalance] = useState('')
    const [accType, setAccType] = useState('checking')

    const display = (v: number) => showValues ? fmt(v) : '•••••'
    const total = accounts.reduce((s, a) => s + a.balance, 0)

    const byType: Record<string, Account[]> = {}
    accounts.forEach(a => { if (!byType[a.type]) byType[a.type] = []; byType[a.type].push(a) })

    const handleSave = () => {
        if (!accName || !accBalance) {
            toast.error('Preencha o nome e o saldo inicial')
            return
        }

        const newAcc: Account = {
            id: Math.random().toString(),
            name: accName,
            type: accType,
            institution: '',
            balance: parseFloat(accBalance),
            color: '#c9a858' // default gold color for new accounts
        }

        setAccounts([...accounts, newAcc])
        setShowModal(false)
        setAccName('')
        setAccBalance('')
        setAccType('checking')
        toast.success('Conta adicionada com sucesso!', {
            style: { background: C.card, color: C.text, border: `1px solid ${C.border}` }
        })
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Saldos & Bancos</h1>
                    <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Todas as suas contas em um só lugar</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => setShowValues(!showValues)} style={btnOutlineStyle}>
                        {showValues ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button onClick={() => setShowModal(true)} style={btnGoldStyle}><Plus size={16} /> Nova Conta</button>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...cardHlStyle, padding: 32, textAlign: 'center', marginBottom: 32 }}>
                <p style={{ fontSize: 14, color: C.textMuted }}>Patrimônio Total</p>
                <p style={{ fontSize: 36, fontWeight: 700, marginTop: 4 }}><GoldText>{display(total)}</GoldText></p>
                <p style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>{accounts.length} contas conectadas</p>
            </motion.div>

            {Object.entries(byType).map(([type, accs], gi) => {
                const Icon = ICON_MAP[type] || Wallet
                return (
                    <div key={type} style={{ marginBottom: 32 }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, marginBottom: 12 }}>
                            <Icon size={16} /> {TYPE_MAP[type] || 'Outros'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                            <AnimatePresence>
                                {accs.map((acc, i) => (
                                    <motion.div key={acc.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: gi * 0.1 + i * 0.05 }}
                                        style={{ ...cardStyle, padding: 20 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${acc.color}15` }}>
                                                <Icon size={18} style={{ color: acc.color }} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{acc.name}</p>
                                                {acc.institution && <p style={{ fontSize: 12, color: C.textMuted }}>{acc.institution}</p>}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: 22, fontWeight: 700, color: C.text }}>{display(acc.balance)}</p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )
            })}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 16 }}
                        onClick={() => setShowModal(false)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()} style={{ ...cardHlStyle, width: '100%', maxWidth: 440, padding: 24 }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text }}>Nova Conta</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Nome da Conta</label>
                                <input value={accName} onChange={e => setAccName(e.target.value)} placeholder="Ex: Inter, Nubank, Cofre..." style={inputStyle} />
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Saldo Atual</label>
                                <input type="number" value={accBalance} onChange={e => setAccBalance(e.target.value)} placeholder="0,00" style={{ ...inputStyle, fontSize: 24, fontWeight: 700 }} />
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Tipo de Conta</label>
                                <select value={accType} onChange={e => setAccType(e.target.value)} style={{ ...inputStyle, width: '100%', appearance: 'none' }}>
                                    <option value="checking" style={{ color: '#000' }}>Conta Corrente</option>
                                    <option value="savings" style={{ color: '#000' }}>Poupança</option>
                                    <option value="investment" style={{ color: '#000' }}>Investimento</option>
                                    <option value="cash" style={{ color: '#000' }}>Dinheiroísico</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button onClick={() => setShowModal(false)} style={{ ...btnOutlineStyle, flex: 1, padding: '12px 0' }}>Cancelar</button>
                                <button onClick={handleSave} style={{ ...btnGoldStyle, flex: 1, padding: '12px 0' }}>Salvar Conta</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
