import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, AlertTriangle, Clock, CheckCircle2, Search, X, Barcode, Calendar } from "lucide-react";

type Boleto = {
    id: string;
    beneficiary: string;
    description: string;
    amount: number;
    dueDate: string;
    status: "pending" | "paid" | "overdue";
    type: string;
    barcode?: string;
};

const MOCK_BOLETOS: Boleto[] = [
    { id: "1", beneficiary: "CPFL Energia", description: "Conta de luz - Mar/2026", amount: 287.45, dueDate: "2026-03-10", status: "pending", type: "💡 Concessionária" },
    { id: "2", beneficiary: "Sanasa", description: "Conta de água - Mar/2026", amount: 98.30, dueDate: "2026-03-05", status: "overdue", type: "💧 Concessionária" },
    { id: "3", beneficiary: "Condomínio Res. Premium", description: "Taxa condominial", amount: 850.00, dueDate: "2026-03-15", status: "pending", type: "🏢 Condomínio" },
    { id: "4", beneficiary: "Prefeitura Campinas", description: "IPTU 2026 - 3ª parcela", amount: 412.67, dueDate: "2026-03-20", status: "pending", type: "📋 Imposto" },
    { id: "5", beneficiary: "Unimed", description: "Plano de saúde", amount: 680.00, dueDate: "2026-02-28", status: "paid", type: "💊 Saúde" },
    { id: "6", beneficiary: "Vivo Fibra", description: "Internet 600mb", amount: 149.90, dueDate: "2026-02-25", status: "paid", type: "🌐 Telecom" },
];

const STATUS_MAP = {
    pending: { label: "Pendente", color: "text-yellow-400", bg: "bg-yellow-400/10", icon: Clock },
    paid: { label: "Pago", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: CheckCircle2 },
    overdue: { label: "Vencido", color: "text-red-400", bg: "bg-red-400/10", icon: AlertTriangle },
};

const Boletos = () => {
    const [filter, setFilter] = useState<"all" | "pending" | "overdue" | "paid">("all");
    const [search, setSearch] = useState("");
    const [showNew, setShowNew] = useState(false);

    const filtered = MOCK_BOLETOS.filter((b) => {
        if (filter !== "all" && b.status !== filter) return false;
        if (search && !b.beneficiary.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const stats = {
        overdue: MOCK_BOLETOS.filter((b) => b.status === "overdue"),
        pending: MOCK_BOLETOS.filter((b) => b.status === "pending"),
    };

    const daysUntil = (date: string) => {
        const d = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
        if (d === 0) return "Hoje";
        if (d < 0) return `${Math.abs(d)}d atrás`;
        return `${d}d`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl font-bold text-foreground">Contas a Pagar</h1>
                    <p className="text-sm text-muted-foreground">Acompanhe e controle seus boletos</p>
                </motion.div>
                <button onClick={() => setShowNew(true)} className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
                    <Plus size={16} /> Novo Boleto
                </button>
            </div>

            {/* Alerts */}
            {stats.overdue.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                    <AlertTriangle size={24} className="shrink-0 text-red-400" />
                    <div>
                        <p className="font-semibold text-red-400">{stats.overdue.length} boleto(s) vencido(s)</p>
                        <p className="text-sm text-red-300/60">Total: {fmt(stats.overdue.reduce((s, b) => s + b.amount, 0))}</p>
                    </div>
                </motion.div>
            )}

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar boleto..."
                        className="w-full rounded-xl border border-border/50 bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-gold/40"
                    />
                </div>
                <div className="flex gap-2">
                    {(["all", "pending", "overdue", "paid"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${filter === f ? "btn-gold" : "btn-gold-outline"
                                }`}
                        >
                            {f === "all" ? "Todos" : f === "pending" ? "Pendentes" : f === "overdue" ? "Vencidos" : "Pagos"}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {filtered.map((boleto, i) => {
                    const st = STATUS_MAP[boleto.status];
                    const StIcon = st.icon;

                    return (
                        <motion.div
                            key={boleto.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ x: 4, transition: { duration: 0.2 } }}
                            className="card-3d flex items-center justify-between p-5"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${st.bg}`}>
                                    <StIcon size={18} className={st.color} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{boleto.beneficiary}</p>
                                    <div className="mt-0.5 flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{boleto.type}</span>
                                        <span className="text-xs text-muted-foreground">·</span>
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar size={10} />
                                            {new Date(boleto.dueDate).toLocaleDateString("pt-BR")}
                                            <span className={`ml-1 font-medium ${boleto.status === "overdue" ? "text-red-400" : boleto.status === "pending" ? "text-yellow-400" : "text-muted-foreground"}`}>
                                                ({daysUntil(boleto.dueDate)})
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className={`text-base font-bold ${boleto.status === "paid" ? "text-muted-foreground line-through" : boleto.status === "overdue" ? "text-red-400" : "text-foreground"}`}>
                                    {fmt(boleto.amount)}
                                </p>
                                {boleto.status !== "paid" && (
                                    <button className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20">
                                        Paguei ✓
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="card-3d flex flex-col items-center py-16 text-center">
                    <FileText size={40} className="mb-4 text-muted-foreground/30" />
                    <p className="text-lg font-medium text-muted-foreground">Nenhum boleto encontrado</p>
                </div>
            )}

            {/* New Modal */}
            <AnimatePresence>
                {showNew && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={() => setShowNew(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="card-3d-highlight w-full max-w-md space-y-4 p-6"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-foreground">Novo Boleto</h2>
                                <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                            </div>

                            {[
                                { label: "Beneficiário", placeholder: "Ex: CPFL, Aluguel..." },
                                { label: "Descrição", placeholder: "Descrição opcional" },
                            ].map((f) => (
                                <div key={f.label}>
                                    <label className="mb-1 block text-sm text-muted-foreground">{f.label}</label>
                                    <input placeholder={f.placeholder} className="w-full rounded-xl border border-border/50 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-gold/40" />
                                </div>
                            ))}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm text-muted-foreground">Valor</label>
                                    <input type="number" step="0.01" placeholder="0,00" className="w-full rounded-xl border border-border/50 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-gold/40" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm text-muted-foreground">Vencimento</label>
                                    <input type="date" className="w-full rounded-xl border border-border/50 bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-gold/40" />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 flex items-center gap-1 text-sm text-muted-foreground"><Barcode size={12} /> Código de barras (opcional)</label>
                                <input placeholder="Cole a linha digitável" className="w-full rounded-xl border border-border/50 bg-card px-4 py-3 font-mono text-xs text-foreground placeholder-muted-foreground outline-none focus:border-gold/40" />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowNew(false)} className="btn-gold-outline flex-1 py-3 text-sm">Cancelar</button>
                                <button className="btn-gold flex-1 py-3 text-sm">Salvar</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Boletos;
