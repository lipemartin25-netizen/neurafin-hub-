import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, PieChart, Download, Calendar, Filter, ChevronRight } from "lucide-react";

const Reports = () => {
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const CATEGORIES = [
        { name: "Moradia", icon: "🏠", amount: 3500, pct: 35, color: "#3B82F6" },
        { name: "Alimentação", icon: "🍔", amount: 1850.40, pct: 18.5, color: "#F59E0B" },
        { name: "Transporte", icon: "🚗", amount: 1200, pct: 12, color: "#10B981" },
        { name: "Lazer", icon: "🎬", amount: 950, pct: 9.5, color: "#EC4899" },
        { name: "Saúde", icon: "💊", amount: 600, pct: 6, color: "#EF4444" },
        { name: "Outros", icon: "📦", amount: 1899.60, pct: 19, color: "#6B7280" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
                    <p className="text-sm text-muted-foreground">Análise profunda do seu fluxo de caixa</p>
                </motion.div>
                <div className="flex gap-3">
                    <button className="btn-gold-outline flex items-center gap-2 px-4 py-2 text-sm">
                        <Filter size={16} /> Filtros
                    </button>
                    <button className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
                        <Download size={16} /> Gerar PDF
                    </button>
                </div>
            </div>

            {/* Main Trends Chart Placeholder */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-3d p-6 h-80 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <BarChart3 size={18} className="text-gold" /> Fluxo de Caixa Mensal
                    </h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-emerald-400" />
                            <span className="text-xs text-muted-foreground">Receitas</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-400" />
                            <span className="text-xs text-muted-foreground">Despesas</span>
                        </div>
                    </div>
                </div>

                {/* Simple CSS bars for visualization since we don't have libraries yet */}
                <div className="flex-1 flex items-end gap-3 sm:gap-6 px-4">
                    {[40, 60, 45, 80, 55, 90, 70, 65, 85, 45, 60, 75].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-1 items-center group">
                            <div className="w-full flex flex-col gap-[2px] items-center">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: i * 0.05, duration: 0.8 }}
                                    className="w-full max-w-[12px] bg-emerald-400/40 rounded-t-sm group-hover:bg-emerald-400/60 transition-colors"
                                />
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h * 0.7}%` }}
                                    transition={{ delay: i * 0.05 + 0.1, duration: 0.8 }}
                                    className="w-full max-w-[12px] bg-red-400/40 rounded-b-sm group-hover:bg-red-400/60 transition-colors"
                                />
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-2">{["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Category Breakdown */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card-3d p-6">
                    <h3 className="mb-6 flex items-center gap-2 font-semibold text-foreground">
                        <PieChart size={18} className="text-gold" /> Gastos por Categoria
                    </h3>
                    <div className="space-y-4">
                        {CATEGORIES.map((cat, i) => (
                            <div key={cat.name} className="group">
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{cat.icon}</span>
                                        <span className="font-medium text-foreground">{cat.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-foreground">{fmt(cat.amount)}</span>
                                        <span className="ml-2 text-muted-foreground">{cat.pct}%</span>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cat.pct}%` }}
                                        transition={{ delay: 0.3 + i * 0.05 }}
                                        style={{ backgroundColor: cat.color }}
                                        className="h-full rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Top Expenses & Insights */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                    <div className="card-3d p-6">
                        <h3 className="mb-4 text-sm font-semibold text-foreground">Maiores Despesas do Mês</h3>
                        <div className="space-y-3">
                            {[
                                { name: "Aluguel", date: "01 Mar", amount: 2800 },
                                { name: "Supermercado", date: "28 Fev", amount: 487.32 },
                                { name: "Posto Shell", date: "26 Fev", amount: 280 },
                            ].map((ex, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 group hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex items-center justify-center bg-secondary rounded-lg">
                                            <TrendingDown size={14} className="text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{ex.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{ex.date}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-foreground">{fmt(ex.amount)}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 flex items-center justify-center gap-1 text-[11px] font-semibold text-gold py-2 border border-gold/10 rounded-lg hover:bg-gold/5 transition-colors">
                            Ver lista completa <ChevronRight size={12} />
                        </button>
                    </div>

                    <div className="card-3d p-6 border-gold/10 bg-gold/5">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={16} className="text-gold" />
                            <p className="text-xs font-bold text-gold uppercase tracking-wider">Insight Mensal</p>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Sua taxa de poupança subiu <strong>3%</strong> comparado ao mês passado. Isso se deve principalmente à redução de 12% nos gastos com <strong>Lazer</strong>. Continue assim!
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Reports;
