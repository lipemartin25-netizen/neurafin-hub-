'use client'

import { motion } from 'framer-motion'
import { User, Bell, Palette, Shield, LogOut, Check } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { C, cardStyle, btnGoldStyle, btnOutlineStyle, inputStyle } from '@/lib/theme'

const THEMES = [
    { id: 'dark-gold', label: 'Dark Gold', color: '#c9a858' },
    { id: 'dark-blue', label: 'Dark Blue', color: '#3B82F6' },
    { id: 'dark-green', label: 'Dark Green', color: '#10B981' },
]

export default function SettingsPage() {
    const router = useRouter()
    const [activeTheme, setActiveTheme] = useState('dark-gold')
    const [saved, setSaved] = useState(false)
    const [notifs, setNotifs] = useState({ boletos: true, budget: true, goals: true, weekly: false, aiTips: false })

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

    const Toggle = ({ on, flip }: { on: boolean; flip: () => void }) => (
        <button onClick={flip} style={{
            width: 44, height: 24, borderRadius: 999, padding: 2, border: 'none', cursor: 'pointer',
            backgroundColor: on ? C.gold : C.muted, transition: 'all 0.3s',
        }}>
            <div style={{ width: 20, height: 20, borderRadius: 999, backgroundColor: 'white', transform: on ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.3s' }} />
        </button>
    )

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text }}>Configurações</h1>
                <p style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Personalize sua experiência</p>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24, maxWidth: 700 }}>
                {/* Profile */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ ...cardStyle, padding: 24 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: C.text, marginBottom: 20 }}>
                        <User size={18} style={{ color: C.gold }} /> Perfil
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Nome</label>
                            <input defaultValue="Felipe Martins" style={inputStyle} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 13, color: C.textMuted, marginBottom: 6 }}>Email</label>
                            <input defaultValue="felipe@email.com" style={inputStyle} />
                        </div>
                    </div>
                    <button onClick={handleSave} style={btnGoldStyle}>{saved ? '✓ Salvo!' : 'Salvar Perfil'}</button>
                </motion.div>

                {/* Theme */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    style={{ ...cardStyle, padding: 24 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: C.text, marginBottom: 20 }}>
                        <Palette size={18} style={{ color: C.gold }} /> Tema
                    </h3>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {THEMES.map(t => (
                            <button key={t.id} onClick={() => setActiveTheme(t.id)} style={{
                                flex: 1, padding: 16, borderRadius: 12, cursor: 'pointer', backgroundColor: C.secondary,
                                border: activeTheme === t.id ? `2px solid ${t.color}` : '2px solid transparent',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                            }}>
                                <div style={{ width: 32, height: 32, borderRadius: 999, background: t.color }} />
                                <span style={{ fontSize: 12, fontWeight: 500, color: activeTheme === t.id ? t.color : C.textMuted }}>{t.label}</span>
                                {activeTheme === t.id && <Check size={14} style={{ color: t.color }} />}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Notifications */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ ...cardStyle, padding: 24 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: C.text, marginBottom: 20 }}>
                        <Bell size={18} style={{ color: C.gold }} /> Notificações
                    </h3>
                    {([
                        { key: 'boletos' as const, label: 'Boletos vencendo', desc: 'Alerta 3 dias antes' },
                        { key: 'budget' as const, label: 'Orçamento estourado', desc: 'Ao ultrapassar limite' },
                        { key: 'goals' as const, label: 'Progresso de metas', desc: 'Atualizações semanais' },
                        { key: 'weekly' as const, label: 'Resumo semanal', desc: 'Relatório toda segunda' },
                        { key: 'aiTips' as const, label: 'Dicas da IA', desc: 'Insights personalizados' },
                    ]).map((n, i) => (
                        <div key={n.key} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0',
                            borderBottom: i < 4 ? `1px solid ${C.border}` : 'none',
                        }}>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{n.label}</p>
                                <p style={{ fontSize: 12, color: C.textMuted }}>{n.desc}</p>
                            </div>
                            <Toggle on={notifs[n.key]} flip={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key] }))} />
                        </div>
                    ))}
                </motion.div>

                {/* Security */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    style={{ ...cardStyle, padding: 24 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: C.text, marginBottom: 20 }}>
                        <Shield size={18} style={{ color: C.gold }} /> Segurança
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <button style={btnOutlineStyle}>Alterar senha</button>
                        <button style={btnOutlineStyle}>Ativar 2FA</button>
                        <button onClick={() => router.push('/login')}
                            style={{ ...btnOutlineStyle, color: C.red, borderColor: 'rgba(248,113,113,0.3)' }}>
                            <LogOut size={16} /> Sair da conta
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
