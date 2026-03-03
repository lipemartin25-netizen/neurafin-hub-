'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
    LayoutDashboard, ArrowLeftRight, CreditCard, FileText, Building2,
    TrendingUp, PieChart, Heart, Target, BarChart3, Bot, FlaskConical,
    Settings, Menu, X, LogOut, Bell, ChevronLeft, DollarSign,
} from 'lucide-react'
import { C } from '@/lib/theme'
import GoldText from './GoldText'

const MENU = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Transações', icon: ArrowLeftRight, href: '/transactions' },
    { label: 'Cartões', icon: CreditCard, href: '/cards' },
    { label: 'Contas a Pagar', icon: FileText, href: '/boletos' },
    { label: 'Saldos & Bancos', icon: Building2, href: '/accounts' },
    { label: 'Investimentos', icon: TrendingUp, href: '/investments' },
    { label: 'Patrimônio', icon: PieChart, href: '/patrimony' },
    { label: 'Saúde Financeira', icon: Heart, href: '/health' },
    { label: 'Orçamentos', icon: DollarSign, href: '/budgets' },
    { label: 'Metas', icon: Target, href: '/goals' },
    { label: 'Relatórios', icon: BarChart3, href: '/reports' },
    { label: 'Assistente IA', icon: Bot, href: '/ai' },
    { label: 'Wealth Lab', icon: FlaskConical, href: '/wealth-lab', highlight: true },
    { label: 'Configurações', icon: Settings, href: '/settings' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 1024)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    const handleLogout = () => {
        // TODO: integrar com Supabase auth.signOut()
        router.push('/login')
    }

    const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo */}
            <div style={{
                padding: mobile ? '20px 16px' : '20px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: `1px solid ${C.border}`,
            }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: C.goldGrad, flexShrink: 0 }} />
                    {(mobile || sidebarOpen) && (
                        <span style={{ fontSize: 16, fontWeight: 700, color: C.text, whiteSpace: 'nowrap' }}>
                            Aurum<GoldText>Fin</GoldText>
                        </span>
                    )}
                </Link>
                {mobile ? (
                    <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: 4 }}>
                        <X size={18} />
                    </button>
                ) : (
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: 4 }}>
                        <ChevronLeft size={16} style={{ transform: sidebarOpen ? 'none' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
                    </button>
                )}
            </div>

            {/* Menu */}
            <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
                {MENU.map((item) => {
                    const active = pathname === item.href
                    const Icon = item.icon
                    const showLabel = mobile || sidebarOpen
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={!showLabel ? item.label : undefined}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: showLabel ? '10px 12px' : '10px 0',
                                justifyContent: showLabel ? 'flex-start' : 'center',
                                marginBottom: 2,
                                borderRadius: 10,
                                fontSize: 13,
                                fontWeight: active ? 600 : 400,
                                color: active ? C.gold : C.textMuted,
                                backgroundColor: active ? 'rgba(201,168,88,0.08)' : 'transparent',
                                borderLeft: active ? `2px solid ${C.gold}` : '2px solid transparent',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => {
                                if (!active) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
                            }}
                            onMouseLeave={(e) => {
                                if (!active) e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                        >
                            <Icon size={18} style={{ flexShrink: 0 }} />
                            {showLabel && item.label}
                            {showLabel && item.highlight && (
                                <span style={{
                                    marginLeft: 'auto', padding: '2px 6px', borderRadius: 999,
                                    fontSize: 9, fontWeight: 600, color: C.bg, background: C.goldGrad,
                                }}>NEW</span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div style={{ padding: '12px 8px', borderTop: `1px solid ${C.border}` }}>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                        padding: (mobile || sidebarOpen) ? '10px 12px' : '10px 0',
                        justifyContent: (mobile || sidebarOpen) ? 'flex-start' : 'center',
                        background: 'none', border: 'none', borderRadius: 10,
                        fontSize: 13, color: C.red, cursor: 'pointer',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <LogOut size={18} style={{ flexShrink: 0 }} />
                    {(mobile || sidebarOpen) && 'Sair'}
                </button>
            </div>
        </div>
    )

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg, color: C.text }}>
            {/* Sidebar — Desktop */}
            {!isMobile && (
                <aside style={{
                    position: 'fixed', top: 0, left: 0, bottom: 0,
                    width: sidebarOpen ? 260 : 72,
                    backgroundColor: '#0d0f14',
                    borderRight: `1px solid ${C.border}`,
                    transition: 'width 0.3s ease',
                    zIndex: 40,
                    overflow: 'hidden',
                }}>
                    <SidebarContent />
                </aside>
            )}

            {/* Mobile Header */}
            {isMobile && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, height: 56,
                    backgroundColor: 'rgba(11,13,16,0.9)', backdropFilter: 'blur(20px)',
                    borderBottom: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 16px', zIndex: 50,
                }}>
                    <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', color: C.text, cursor: 'pointer' }}>
                        <Menu size={22} />
                    </button>
                    <Link href="/dashboard" style={{ textDecoration: 'none', fontWeight: 700, color: C.text }}>
                        Aurum<GoldText>Fin</GoldText>
                    </Link>
                    <button onClick={() => router.push('/settings')} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}>
                        <Bell size={18} />
                    </button>
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {isMobile && mobileOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.6)' }}
                    onClick={() => setMobileOpen(false)}
                >
                    <div
                        style={{
                            width: 280, height: '100%', backgroundColor: '#0d0f14',
                            borderRight: `1px solid ${C.border}`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SidebarContent mobile />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: isMobile ? 0 : (sidebarOpen ? 260 : 72),
                paddingTop: isMobile ? 72 : 24,
                padding: isMobile ? '72px 16px 24px' : 24,
                minHeight: '100vh',
                transition: 'margin-left 0.3s ease',
            }}>
                {children}
            </main>
        </div>
    )
}
