import { motion } from "framer-motion";
import { Plus, TrendingUp, Calendar, Trophy } from "lucide-react";

const MOCK_GOALS = [
    { name: "Viagem Europa", icon: "✈️", target: 25000, current: 18500, deadline: "2026-12-01", color: "#3B82F6" },
    { name: "Carro Novo", icon: "🚗", target: 80000, current: 32000, deadline: "2027-06-01", color: "#8B5CF6" },
    { name: "Reserva de Emergência", icon: "🛡️", target: 50000, current: 45000, deadline: "2026-06-01", color: "#10B981" },
    { name: "MacBook Pro", icon: "💻", target: 18000, current: 18000, deadline: "2026-03-01", color: "#F59E0B" },
    { name: "Entrada Apartamento", icon: "🏠", target: 150000, current: 67000, deadline: "2028-01-01", color: "#EC4899" },
    { name: "Casamento", icon: "💍", target: 60000, current: 12000, deadline: "2027-10-01", color: "#06B6D4" },
];

const Goals = () => {
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const monthsUntil = (d: string) => {
        const diff = new Date(d).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24 * 30)));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl font-bold text-foreground">Metas</h1>
                    <p className="text-sm text-muted-foreground">Acompanhe seus objetivos financeiros</p>
                </motion.div>
                <button className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
                    <Plus size={16} /> Nova Meta
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {MOCK_GOALS.map((goal, i) => {
                    const pct = Math.min(100, (goal.current / goal.target) * 100);
                    const done = pct >= 100;
                    const months = monthsUntil(goal.deadline);
                    const remaining = goal.target - goal.current;
                    const monthly = months > 0 ? remaining / months : 0;

                    return (
                        <motion.div
                            key={goal.name}
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            whileHover={{ y: -4, transition: { duration: 0.25 } }}
                            className={`card-3d p-6 ${done ? "border-emerald-500/20" : ""}`}
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: `${goal.color}15` }}>
                                        {goal.icon}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{goal.name}</p>
                                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar size={11} />
                                            {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                                            {months > 0 && ` (${months} meses)`}
                                        </p>
                                    </div>
                                </div>
                                {done && <Trophy size={18} className="text-gold" />}
                            </div>

                            <div className="mb-2 flex justify-between text-sm">
                                <span className="font-bold text-foreground">{fmt(goal.current)}</span>
                                <span className="text-muted-foreground">{fmt(goal.target)}</span>
                            </div>

                            <div className="h-3 overflow-hidden rounded-full bg-secondary">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 1, delay: i * 0.08 }}
                                    className="h-full rounded-full"
                                    style={{ background: done ? "#10B981" : `linear-gradient(90deg, ${goal.color}, ${goal.color}CC)` }}
                                />
                            </div>

                            <div className="mt-2 flex justify-between text-xs">
                                <span className="text-muted-foreground">{pct.toFixed(1)}%</span>
                                {!done && monthly > 0 && (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <TrendingUp size={11} /> {fmt(monthly)}/mês
                                    </span>
                                )}
                            </div>

                            {done && (
                                <div className="mt-3 rounded-lg bg-emerald-500/10 py-2 text-center text-sm font-medium text-emerald-400">
                                    🎉 Meta atingida!
                                </div>
                            )}

                            {!done && (
                                <button className="mt-3 w-full rounded-lg bg-secondary py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground">
                                    + Depositar
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default Goals;
