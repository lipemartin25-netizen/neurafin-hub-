import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp, TrendingDown, PieChart, Plus, Eye, EyeOff,
    ArrowUpRight, ArrowDownRight, BarChart3, DollarSign, Percent, Clock,
} from "lucide-react";

type Investment = {
    id: string;
    name: string;
    ticker: string;
    type: "renda_fixa" | "acao" | "fii" | "cripto" | "fundo";
    invested: number;
    current: number;
    quantity: number;
    monthlyReturn: number;
    institution: string;
    color: string;
};

const TYPE_MAP: Record<string, { label: string; icon: string }> = {
    renda_fixa: { label: "Renda Fixa", icon: "🏦" },
    acao: { label: "Ações", icon: "📊" },
    fii: { label: "FIIs", icon: "🏢" },
    cripto: { label: "Cripto", icon: "₿" },
    fundo: { label: "Fundos", icon: "📁" },
};

const MOCK_INVESTMENTS: Investment[] = [
    { id: "1", name: "Tesouro IPCA+ 2035", ticker: "IPCA35", type: "renda_fixa", invested: 15400, current: 16820.45, quantity: 12.4, monthlyReturn: 124.50, institution: "Nubank", color: "#F59E0B" },
    { id: "2", name: "CDB 110% CDI", ticker: "LCI-INT", type: "renda_fixa", invested: 45000, current: 46230.12, quantity: 1, monthlyReturn: 380, institution: "Inter", color: "#F97316" },
    { id: "3", name: "Petrobras ON", ticker: "PETR4", type: "acao", invested: 12000, current: 14500.80, quantity: 380, monthlyReturn: -120.40, institution: "XP", color: "#3B82F6" },
    { id: "4", name: "Vale ON", ticker: "VALE3", type: "acao", invested: 8500, current: 7200.50, quantity: 120, monthlyReturn: -45.20, institution: "XP", color: "#10B981" },
    { id: "5", name: "Maxi Renda FII", ticker: "MXRF11", type: "fii", invested: 15000, current: 15850.20, quantity: 1450, monthlyReturn: 158.40, institution: "XP", color: "#EC4899" },
    { id: "6", name: "XPML11 FII", ticker: "XPML11", type: "fii", invested: 10000, current: 10450.90, quantity: 95, monthlyReturn: 85.50, institution: "XP", color: "#8B5CF6" },
    { id: "7", name: "Bitcoin", ticker: "BTC", type: "cripto", invested: 25000, current: 38500.45, quantity: 0.12, monthlyReturn: 4200.30, institution: "Binance", color: "#F59E0B" },
    { id: "8", name: "Ethereum", ticker: "ETH", type: "cripto", invested: 10000, current: 12800.22, quantity: 1.5, monthlyReturn: 980, institution: "Binance", color: "#6366F1" },
];

const Investments = () => {
    const [view, setView] = useState<"cards" | "table">("cards");
    const [showValues, setShowValues] = useState(true);
    const [filter, setFilter] = useState("all");

    const fmt = (v: number) => showValues ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "•••••";

    const totalInvested = MOCK_INVESTMENTS.reduce((s, i) => s + i.invested, 0);
    const totalCurrent = MOCK_INVESTMENTS.reduce((s, i) => s + i.current, 0);
    const totalProfit = totalCurrent - totalInvested;
    const totalPct = (totalProfit / totalInvested) * 100;

    const filtered = filter === "all" ? MOCK_INVESTMENTS : MOCK_INVESTMENTS.filter(i => i.type === filter);

    const allocation = Object.keys(TYPE_MAP).map(type => {
        const total = MOCK_INVESTMENTS.filter(i => i.type === type).reduce((s, i) => s + i.current, 0);
        return { type, total, pct: (total / totalCurrent) * 100 };
    }).filter(a => a.total > 0).sort((a, b) => b.total - a.total);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl font-bold text-foreground">Investimentos</h1>
                    <p className="text-sm text-muted-foreground">Evolução e portfólio completo</p>
                </motion.div>
                <div className="flex gap-3">
                    <button onClick={() => setShowValues(!showValues)} className="btn-gold-outline flex items-center gap-2 px-4 py-2 text-sm">
                        {showValues ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
                        <Plus size={16} /> Novo Ativo
                    </button>
                </div>
            </div>

            {/* Main Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Patrimônio Investido", value: totalCurrent, sub: `Aplicado: ${fmt(totalInvested)}`, icon: DollarSign, color: "text-gold" },
                    { label: "Rentabilidade Total", value: totalProfit, sub: `${totalPct.toFixed(2)}% no período`, icon: Percent, color: totalProfit >= 0 ? "text-emerald-400" : "text-red-400" },
                    { label: "Proventos Estimados (mês)", value: allocation.reduce((s, a) => s + (MOCK_INVESTMENTS.filter(i => i.type === a.type).reduce((subS, i) => subS + (i.monthlyReturn > 0 ? i.monthlyReturn : 0), 0)), 0), sub: "Rendimento passivo", icon: Clock, color: "text-emerald-400" },
                    { label: "Meta Portfólio", value: 1000000, sub: "Progresso: 18.5%", icon: BarChart3, color: "text-gold" },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card-3d p-5">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-white/5 ${s.color}`}>
                                <s.icon size={18} />
                            </div>
                            <span className="text-sm text-muted-foreground">{s.label}</span>
                        </div>
                        <p className={`mt-3 text-xl font-bold ${i === 1 ? s.color : "text-foreground"}`}>{fmt(s.value)}</p>
                        <p className="mt-1 text-xs text-muted-foreground/60">{s.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Allocation */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card-3d p-6 lg:col-span-1">
                    <h3 className="mb-6 flex items-center gap-2 font-semibold text-foreground">
                        <PieChart size={18} className="text-gold" /> Alocação de Ativos
                    </h3>
                    <div className="space-y-4">
                        {allocation.map((a, i) => (
                            <div key={a.type}>
                                <div className="mb-2 flex justify-between text-xs">
                                    <span className="font-medium text-foreground">{TYPE_MAP[a.type].label}</span>
                                    <span className="text-muted-foreground">{a.pct.toFixed(1)}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${a.pct}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="h-full bg-gradient-gold"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 rounded-xl bg-gold/5 p-4 border border-gold/10">
                        <p className="text-xs text-gold/80 italic font-medium">✨ Nexus IA Insight:</p>
                        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                            Sua exposição em <strong>Ações</strong> está 5% acima do alvo. Considere rebalancear aportando em <strong>Renda Fixa</strong> este mês.
                        </p>
                    </div>
                </motion.div>

                {/* Assets List */}
                <div className="space-y-4 lg:col-span-2">
                    {/* Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {["all", "renda_fixa", "acao", "fii", "cripto"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${filter === t ? "bg-gradient-gold text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {t === "all" ? "Todos" : TYPE_MAP[t].label}
                                </button>
                            ))}
                        </div>
                        <div className="flex rounded-lg bg-secondary p-1">
                            <button onClick={() => setView("cards")} className={`p-1.5 rounded-md ${view === "cards" ? "bg-card shadow-sm text-gold" : "text-muted-foreground"}`}><BarChart3 size={16} /></button>
                            <button onClick={() => setView("table")} className={`p-1.5 rounded-md ${view === "table" ? "bg-card shadow-sm text-gold" : "text-muted-foreground"}`}><PieChart size={16} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {filtered.map((inv, i) => {
                            const profit = inv.current - inv.invested;
                            const profitPct = (profit / inv.invested) * 100;
                            return (
                                <motion.div
                                    key={inv.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="card-3d p-4 group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex items-center justify-center bg-secondary rounded-xl text-lg">
                                                {TYPE_MAP[inv.type].icon}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{inv.ticker}</p>
                                                <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{inv.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-foreground">{fmt(inv.current)}</p>
                                            <div className={`flex items-center justify-end gap-1 text-[10px] ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                                {profit >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                                {profitPct.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-border/30 flex justify-between items-center text-[10px] text-muted-foreground">
                                        <span>Qtd: {inv.quantity}</span>
                                        <span>{inv.institution}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Investments;
