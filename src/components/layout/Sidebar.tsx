'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
    Brain, LayoutDashboard, ArrowLeftRight, CreditCard, Target,
    PiggyBank, FileText, Landmark, Sparkles, GraduationCap,
    Settings, LogOut, ChevronLeft, ChevronRight, Zap
} from 'lucide-react'
import { toast } from 'sonner'
import type { Profile } from '@/types/database'

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Transações', href: '/transactions', icon: ArrowLeftRight },
    { label: 'Contas', href: '/accounts', icon: CreditCard },
    { label: 'Orçamentos', href: '/budgets', icon: PiggyBank },
    { label: 'Metas', href: '/goals', icon: Target },
    { label: 'Boletos (DDA)', href: '/boletos', icon: FileText },
    { label: 'Open Finance', href: '/open-finance', icon: Landmark },
    { label: 'Wealth Lab', href: '/wealth-lab', icon: Zap },
    { label: 'Academia IA', href: '/academy', icon: GraduationCap },
    { label: 'NeuraFin IA', href: '/ai', icon: Sparkles },
]

interface SidebarProps {
    profile: Profile | null
}

export function Sidebar({ profile }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [collapsed, setCollapsed] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)
    const supabase = createClient()

    async function handleLogout() {
        setLoggingOut(true)
        await supabase.auth.signOut()
        toast.success('Até logo!')
        router.push('/login')
    }

    return (
        <aside
            className={cn(
                'relative flex flex-col border-r transition-all duration-300',
                'border-white/[0.04] bg-[#03050B] shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-40',
                collapsed ? 'w-[80px]' : 'w-[280px]'
            )}
        >
            {/* Logo */}
            <div className={cn(
                'flex items-center gap-4 px-6 py-6 border-b border-white/[0.04]',
                collapsed ? 'justify-center px-0' : ''
            )}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F260] to-[#059669] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(0,242,96,0.3)]">
                    <Brain className="w-5 h-5 text-black" />
                </div>
                {!collapsed && (
                    <div className="animate-fade-in flex flex-col">
                        <div className="text-xl font-bold leading-none tracking-tight text-white mb-1" style={{ fontFamily: 'Outfit' }}>Neura<span className="text-[#00F260]">Fin</span></div>
                        <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#00F260]/70">Finance Hub</div>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-none">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href || pathname.startsWith(href + '/')
                    return (
                        <Link key={href} href={href}>
                            <div
                                className={cn('sidebar-item group', isActive && 'active', collapsed && 'justify-center px-0')}
                                title={collapsed ? label : undefined}
                            >
                                <Icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-[#00F260]" : "text-muted-foreground group-hover:text-white")} />
                                {!collapsed && (
                                    <span className={cn("animate-fade-in text-[15px] font-medium transition-colors", isActive ? "text-white font-semibold" : "")}>{label}</span>
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Bottom: Profile + Settings */}
            <div className="px-4 py-6 border-t border-white/[0.04] space-y-2">
                <Link href="/settings">
                    <div className={cn('sidebar-item group', collapsed && 'justify-center px-0')}>
                        <Settings className="w-5 h-5 shrink-0 text-muted-foreground group-hover:text-white transition-colors" />
                        {!collapsed && <span className="text-[15px] group-hover:text-white transition-colors">Configurações</span>}
                    </div>
                </Link>

                {/* Profile */}
                {!collapsed && profile && (
                    <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center text-white text-sm font-bold shrink-0 border border-white/10">
                            {profile.full_name?.[0]?.toUpperCase() ?? profile.email[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-foreground truncate">
                                {profile.full_name ?? 'Usuário'}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate">{profile.email}</div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className={cn('sidebar-item w-full text-red-400 hover:bg-red-500/10 group mt-2', collapsed && 'justify-center px-0')}
                >
                    <LogOut className="w-5 h-5 shrink-0 group-hover:text-red-400" />
                    {!collapsed && <span className="text-[15px]">Sair</span>}
                </button>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3.5 top-[76px] w-7 h-7 rounded-full bg-[#03050B] border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:border-[#00F260]/50 hover:bg-[#00F260]/10 transition-all z-50 cursor-pointer shadow-lg"
                title={collapsed ? 'Expandir' : 'Recolher'}
            >
                {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
        </aside>
    )
}
