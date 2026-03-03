import { motion } from "framer-motion";
import { CreditCard, Plus, Eye, EyeOff, TrendingDown, Calendar, AlertTriangle } from "lucide-react";
import { useState } from "react";

const MOCK_CARDS = [
    {
        id: "1", name: "Nubank Mastercard", last4: "4321", brand: "mastercard",
        limit: 15000, used: 4250, closing: 8, due: 15,
        color: "from-violet-600 to-purple-800",
        invoice: [
            { desc: "iFood", amount: 67.80, date: "28 Fev" },
            { desc: "Amazon Prime", amount: 14.90, date: "27 Fev" },
            { desc: "Posto Shell", amount: 280.00, date: "26 Fev" },
            { desc: "Mercado Livre", amount: 189.90, date: "25 Fev" },
        ],
    },
    {
        id: "2", name: "Inter Visa", last4: "8765", brand: "visa",
        limit: 8000, used: 1890, closing: 1, due: 8,
        color: "from-orange-500 to-orange-700",
        invoice: [
            { desc: "Uber", amount: 45.00, date: "01 Mar" },
            { desc: "Spotify", amount: 34.90, date: "28 Fev" },
        ],
    },
    {
        id: "3", name: "Itaú Platinum", last4: "1234", brand: "visa",
        limit: 25000, used: 12450, closing: 15, due: 22,
        color: "from-blue-700 to-blue-900",
        invoice: [
            { desc: "Passagem aérea", amount: 2800.00, date: "20 Fev" },
            { desc: "Hotel Booking", amount: 1450.00, date: "18 Fev" },
            { desc: "Aluguel carro", amount: 890.00, date: "17 Fev" },
        ],
    },
];

const Cards = () => {
    const [showValues, setShowValues] = useState(true);
    const [selectedCard, setSelectedCard] = useState(MOCK_CARDS[0].id);
    const fmt = (v: number) => showValues ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "•••••";

    const totalLimit = MOCK_CARDS.reduce((s, c) => s + c.limit, 0);
    const totalUsed = MOCK_CARDS.reduce((s, c) => s + c.used, 0);
    const selected = MOCK_CARDS.find((c) => c.id === selectedCard)!;
    const utilization = (selected.used / selected.limit) * 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl font-bold text-foreground">Cartões</h1>
                    <p className="text-sm text-muted-foreground">Gerencie seus cartões de crédito</p>
                </motion.div>
                <div className="flex gap-3">
                    <button onClick={() => setShowValues(!showValues)} className="btn-gold-outline flex items-center gap-2 px-4 py-2 text-sm">
                        {showValues ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showValues ? "Ocultar" : "Mostrar"}
                    </button>
                    <button className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
                        <Plus size={16} /> Novo Cartão
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-3d p-5">
                    <p className="text-sm text-muted-foreground">Limite Total</p>
                    <p className="mt-1 text-xl font-bold text-foreground">{fmt(totalLimit)}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card-3d p-5">
                    <p className="text-sm text-muted-foreground">Usado</p>
                    <p className="mt-1 text-xl font-bold text-red-400">{fmt(totalUsed)}</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="card-3d p-5">
                    <p className="text-sm text-muted-foreground">Disponível</p>
                    <p className="mt-1 text-xl font-bold text-emerald-400">{fmt(totalLimit - totalUsed)}</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                {/* Card Visual */}
                <div className="space-y-4 lg:col-span-2">
                    {MOCK_CARDS.map((card, i) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                            onClick={() => setSelectedCard(card.id)}
                            className={`cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br ${card.color} p-6 transition-all ${selectedCard === card.id ? "ring-2 ring-gold/50 ring-offset-2 ring-offset-background" : "opacity-70 hover:opacity-90"
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <CreditCard size={28} className="text-white/60" />
                                <p className="text-xs font-medium text-white/60">{card.brand.toUpperCase()}</p>
                            </div>
                            <p className="mt-8 font-mono text-lg tracking-widest text-white/80">
                                •••• •••• •••• {card.last4}
                            </p>
                            <div className="mt-4 flex items-end justify-between">
                                <div>
                                    <p className="text-xs text-white/50">Fatura atual</p>
                                    <p className="text-lg font-bold text-white">{fmt(card.used)}</p>
                                </div>
                                <p className="text-xs text-white/40">{card.name}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Invoice Detail */}
                <motion.div
                    key={selectedCard}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-3d space-y-5 p-6 lg:col-span-3"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-foreground">{selected.name}</h3>
                            <p className="text-xs text-muted-foreground">Fatura atual</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Vencimento</p>
                            <p className="flex items-center gap-1 text-sm font-medium text-gold">
                                <Calendar size={14} /> Dia {selected.due}
                            </p>
                        </div>
                    </div>

                    {/* Utilization Bar */}
                    <div>
                        <div className="mb-2 flex justify-between text-xs">
                            <span className="text-muted-foreground">{utilization.toFixed(0)}% utilizado</span>
                            <span className="text-muted-foreground">Limite: {fmt(selected.limit)}</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-secondary">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${utilization}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className={`h-full rounded-full ${utilization > 80 ? "bg-red-500" : utilization > 60 ? "bg-yellow-500" : "bg-gradient-gold"
                                    }`}
                            />
                        </div>
                        {utilization > 80 && (
                            <p className="mt-2 flex items-center gap-1 text-xs text-red-400">
                                <AlertTriangle size={12} /> Utilização alta! Considere reduzir gastos.
                            </p>
                        )}
                    </div>

                    {/* Invoice Items */}
                    <div>
                        <h4 className="mb-3 text-sm font-medium text-muted-foreground">Lançamentos da fatura</h4>
                        <div className="space-y-3">
                            {selected.invoice.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{item.desc}</p>
                                        <p className="text-xs text-muted-foreground">{item.date}</p>
                                    </div>
                                    <p className="text-sm font-medium text-foreground">{fmt(item.amount)}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/30 pt-4">
                        <p className="font-medium text-muted-foreground">Total da fatura</p>
                        <p className="text-xl font-bold text-foreground">{fmt(selected.used)}</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Cards;
