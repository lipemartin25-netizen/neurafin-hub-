import { motion } from "framer-motion";
import { Plus, Target, AlertTriangle, CheckCircle2 } from "lucide-react";

const MOCK_BUDGETS = [
    { name: "Alimentação", icon: "🍔", limit: 1500, spent: 1120 },
    { name: "Transporte", icon: "🚗", limit: 800, spent: 650 },
    { name: "Moradia", icon: "🏠", limit: 3500, spent: 3500 },
    { name: "Saúde", icon: "💊", limit: 500, spent: 180 },
    { name: "Lazer", icon: "🎬", limit: 600, spent: 780 },
    { name: "Assinaturas", icon: "📱", limit: 200, spent: 155 },
    { name: "Educação", icon: "📚", limit: 400, spent: 27.90 },
    { name: "Compras", icon: "🛍️", limit: 1000, spent: 890 },
];

const Budgets = () => {
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const totalLimit = MOCK_BUDGETS.reduce((s, b) => s + b.limit, 0);
    const totalSpent = MOCK_BUDGETS.reduce((s, b) => s + b.spent, 0);
    const totalPct = (totalSpent / totalLimit) * 100;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl font-bold text-foreground">Orçamentos</h1>
                    <p className="text-sm text-muted-foreground">Controle seus gastos por categoria</p>
                </motion.div>
                <button className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
                    <Plus size={16} /> Novo Orçamento
                </button>
            </div>

            {/* Total */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-3d p-6">
                <div className="mb-2 flex justify-between">
                    <p className="text-sm text-muted-foreground">Total do Mês</p>
                    <p className="text-sm text-muted-foreground">{totalPct.toFixed(0)}% usado</p>
                </div>
                <div className="mb-2 flex justify-between">
                    <p className="text-lg font-bold text-foreground">{fmt(totalSpent)}</p>
                    <p className="text-sm text-muted-foreground">de {fmt(totalLimit)}</p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, totalPct)}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full rounded-full ${totalPct > 90 ? "bg-red-500" : totalPct > 70 ? "bg-yellow-500" : "bg-gradient-gold"}`}
                    />
                </div>
            </motion.div>

            {/* Budgets Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {MOCK_BUDGETS.map((b, i) => {
                    const pct = (b.spent / b.limit) * 100;
                    const over = pct > 100;
                    const warn = pct > 80 && !over;
                    const remaining = b.limit - b.spent;

                    return (
                        <motion.div
                            key={b.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -3, transition: { duration: 0.25 } }}
                            className="card-3d p-5"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{b.icon}</span>
                                    <p className="font-medium text-foreground">{b.name}</p>
                                </div>
                                {over ? <AlertTriangle size={16} className="text-red-400" /> : pct < 80 ? <CheckCircle2 size={16} className="text-emerald-400/50" /> : null}
                            </div>

                            <div className="mb-2 flex justify-between text-sm">
                                <span className={`font-bold ${over ? "text-red-400" : "text-foreground"}`}>{fmt(b.spent)}</span>
                                <span className="text-muted-foreground">{fmt(b.limit)}</span>
                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, pct)}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.05 }}
                                    className={`h-full rounded-full ${over ? "bg-red-500" : warn ? "bg-yellow-500" : "bg-gradient-gold"}`}
                                />
                            </div>

                            <p className={`mt-2 text-xs ${over ? "text-red-400" : "text-muted-foreground"}`}>
                                {over ? `Estourou ${fmt(Math.abs(remaining))}` : `Resta ${fmt(remaining)} (${(100 - pct).toFixed(0)}%)`}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default Budgets;
