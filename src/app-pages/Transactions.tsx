import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowUpRight, ArrowDownRight, Search, Filter, Plus, Calendar,
    Download, ChevronDown, X, Sparkles,
} from "lucide-react";

type Transaction = {
    id: string;
    name: string;
    desc: string;
    amount: number;
    type: "in" | "out";
    category: string;
    categoryIcon: string;
    date: string;
    account: string;
};

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: "1", name: "Salário", desc: "Empresa XYZ Ltda", amount: 12500, type: "in", category: "Salário", categoryIcon: "💰", date: "2026-03-01", account: "Nubank" },
    { id: "2", name: "Aluguel", desc: "Apartamento Campinas", amount: 2800, type: "out", category: "Moradia", categoryIcon: "🏠", date: "2026-03-01", account: "Itaú" },
    { id: "3", name: "Supermercado", desc: "Carrefour Express", amount: 487.32, type: "out", category: "Alimentação", categoryIcon: "🍔", date: "2026-02-28", account: "Nubank" },
    { id: "4", name: "Freelance", desc: "Projeto App Mobile", amount: 4500, type: "in", category: "Freelance", categoryIcon: "💻", date: "2026-02-28", account: "Inter" },
    { id: "5", name: "Netflix", desc: "Assinatura mensal", amount: 55.90, type: "out", category: "Assinaturas", categoryIcon: "📱", date: "2026-02-27", account: "Nubank" },
    { id: "6", name: "Uber", desc: "Corrida trabalho", amount: 28.50, type: "out", category: "Transporte", categoryIcon: "🚗", date: "2026-02-27", account: "Nubank" },
    { id: "7", name: "Tesouro Selic", desc: "Rendimento mensal", amount: 312.45, type: "in", category: "Investimentos", categoryIcon: "📈", date: "2026-02-26", account: "XP" },
    { id: "8", name: "Farmácia", desc: "Drogaria São Paulo", amount: 156.80, type: "out", category: "Saúde", categoryIcon: "💊", date: "2026-02-26", account: "Nubank" },
    { id: "9", name: "Curso Udemy", desc: "React Avançado", amount: 27.90, type: "out", category: "Educação", categoryIcon: "📚", date: "2026-02-25", account: "Nubank" },
    { id: "10", name: "Dividendos", desc: "MXRF11", amount: 89.60, type: "in", category: "Investimentos", categoryIcon: "📈", date: "2026-02-25", account: "XP" },
];

const CATEGORIES = ["Todos", "Alimentação", "Moradia", "Transporte", "Saúde", "Educação", "Assinaturas", "Salário", "Freelance", "Investimentos"];

const Transactions = () => {
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState<"all" | "in" | "out">("all");
    const [filterCategory, setFilterCategory] = useState("Todos");
    const [showNewModal, setShowNewModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // New transaction form
    const [newTx, setNewTx] = useState({
        name: "", amount: "", type: "out" as "in" | "out", category: "Alimentação", account: "Nubank", date: new Date().toISOString().split("T")[0],
    });

    const filtered = MOCK_TRANSACTIONS.filter((tx) => {
        if (filterType !== "all" && tx.type !== filterType) return false;
        if (filterCategory !== "Todos" && tx.category !== filterCategory) return false;
        if (search && !tx.name.toLowerCase().includes(search.toLowerCase()) && !tx.desc.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const totalIn = filtered.filter((t) => t.type === "in").reduce((s, t) => s + t.amount, 0);
    const totalOut = filtered.filter((t) => t.type === "out").reduce((s, t) => s + t.amount, 0);
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    // Group by date
    const grouped: Record<string, Transaction[]> = {};
    filtered.forEach((tx) => {
        if (!grouped[tx.date]) grouped[tx.date] = [];
        grouped[tx.date].push(tx);
    });

    const formatDate = (d: string) => {
        const date = new Date(d + "T12:00:00");
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        if (d === today.toISOString().split("T")[0]) return "Hoje";
        if (d === yesterday.toISOString().split("T")[0]) return "Ontem";
        return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl font-bold text-foreground">Transações</h1>
                    <p className="text-sm text-muted-foreground">Gerencie todas as suas movimentações</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-3">
                    <button className="btn-gold-outline flex items-center gap-2 px-4 py-2 text-sm">
                        <Download size={16} /> Exportar
                    </button>
                    <button onClick={() => setShowNewModal(true)} className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
                        <Plus size={16} /> Nova Transação
                    </button>
                </motion.div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    { label: "Receitas", value: totalIn, color: "text-emerald-400", icon: ArrowUpRight },
                    { label: "Despesas", value: totalOut, color: "text-red-400", icon: ArrowDownRight },
                    { label: "Saldo", value: totalIn - totalOut, color: totalIn - totalOut >= 0 ? "text-emerald-400" : "text-red-400", icon: Calendar },
                ].map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="card-3d p-5"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{s.label}</span>
                            <s.icon size={16} className={s.color} />
                        </div>
                        <p className={`mt-1 text-xl font-bold ${s.color}`}>{fmt(s.value)}</p>
                    </motion.div>
                ))}
            </div>

            {/* Search & Filters */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar transação..."
                        className="w-full rounded-xl border border-border/50 bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-gold/40"
                    />
                </div>
                <div className="flex gap-2">
                    {(["all", "in", "out"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${filterType === t ? "btn-gold" : "btn-gold-outline"
                                }`}
                        >
                            {t === "all" ? "Todos" : t === "in" ? "Receitas" : "Despesas"}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn-gold-outline flex items-center gap-1.5 px-4 py-2.5 text-sm"
                    >
                        <Filter size={14} /> Filtros
                    </button>
                </div>
            </motion.div>

            {/* Category Filter Bar */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2"
                    >
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${filterCategory === cat
                                        ? "bg-gradient-gold text-background"
                                        : "border border-border/50 bg-card text-muted-foreground hover:border-gold/30 hover:text-gold"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transaction List */}
            <div className="space-y-6">
                {Object.entries(grouped).map(([date, txs], gi) => (
                    <motion.div
                        key={date}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + gi * 0.05 }}
                    >
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {formatDate(date)}
                        </p>
                        <div className="space-y-2">
                            {txs.map((tx, i) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.35 + gi * 0.05 + i * 0.03 }}
                                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                                    className="card-3d flex items-center justify-between p-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${tx.type === "in" ? "bg-gold/10" : "bg-secondary"
                                            }`}>
                                            {tx.categoryIcon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{tx.name}</p>
                                            <p className="text-xs text-muted-foreground">{tx.desc} · {tx.account}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${tx.type === "in" ? "text-emerald-400" : "text-foreground"}`}>
                                            {tx.type === "in" ? "+" : "-"}{fmt(tx.amount)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{tx.category}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="card-3d flex flex-col items-center justify-center py-16 text-center">
                    <Search size={40} className="mb-4 text-muted-foreground/30" />
                    <p className="text-lg font-medium text-muted-foreground">Nenhuma transação encontrada</p>
                    <p className="mt-1 text-sm text-muted-foreground/70">Tente ajustar os filtros</p>
                </div>
            )}

            {/* New Transaction Modal */}
            <AnimatePresence>
                {showNewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                        onClick={() => setShowNewModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="card-3d-highlight w-full max-w-md p-6"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-foreground">Nova Transação</h2>
                                <button onClick={() => setShowNewModal(false)} className="text-muted-foreground hover:text-foreground">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Type Toggle */}
                            <div className="mb-5 flex rounded-xl bg-secondary p-1">
                                {(["out", "in"] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setNewTx({ ...newTx, type: t })}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${newTx.type === t
                                                ? t === "out" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                                                : "text-muted-foreground"
                                            }`}
                                    >
                                        {t === "out" ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                        {t === "out" ? "Despesa" : "Receita"}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                {/* Amount */}
                                <div>
                                    <label className="mb-1 block text-sm text-muted-foreground">Valor</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">R$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={newTx.amount}
                                            onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                                            placeholder="0,00"
                                            className="w-full rounded-xl border border-border/50 bg-card py-3 pl-12 pr-4 text-2xl font-bold text-foreground placeholder-muted-foreground/30 outline-none focus:border-gold/40"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
                                        Descrição <Sparkles size={12} className="text-gold" />
                                    </label>
                                    <input
                                        type="text"
                                        value={newTx.name}
                                        onChange={(e) => setNewTx({ ...newTx, name: e.target.value })}
                                        placeholder="Ex: Supermercado, Uber, Netflix..."
                                        className="w-full rounded-xl border border-border/50 bg-card px-4 py-3 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-gold/40"
                                    />
                                    <p className="mt-1 text-xs text-gold/60">IA categoriza automaticamente</p>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="mb-2 block text-sm text-muted-foreground">Categoria</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["Alimentação", "Transporte", "Moradia", "Saúde", "Educação", "Lazer", "Compras", "Assinaturas", "Salário", "Freelance"].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setNewTx({ ...newTx, category: cat })}
                                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${newTx.category === cat
                                                        ? "bg-gradient-gold text-background"
                                                        : "border border-border/50 text-muted-foreground hover:border-gold/30"
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="mb-1 block text-sm text-muted-foreground">Data</label>
                                    <input
                                        type="date"
                                        value={newTx.date}
                                        onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                                        className="w-full rounded-xl border border-border/50 bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-gold/40"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setShowNewModal(false)} className="btn-gold-outline flex-1 py-3 text-sm">
                                        Cancelar
                                    </button>
                                    <button className="btn-gold flex-1 py-3 text-sm">
                                        Salvar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Transactions;
