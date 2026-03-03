import { motion } from "framer-motion";
import { Building2, CreditCard, Wallet, PiggyBank, TrendingUp, Plus, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const ICON_MAP: Record<string, any> = { checking: Building2, savings: PiggyBank, credit_card: CreditCard, investment: TrendingUp, cash: Wallet, digital: Wallet };
const TYPE_MAP: Record<string, string> = { checking: "Conta Corrente", savings: "Poupança", credit_card: "Cartão", investment: "Investimento", cash: "Dinheiro", digital: "Carteira Digital" };

const MOCK_ACCOUNTS = [
    { id: "1", name: "Nubank", type: "checking", institution: "Nubank", balance: 12450.80, color: "#8B5CF6" },
    { id: "2", name: "Itaú", type: "checking", institution: "Itaú Unibanco", balance: 8320.45, color: "#003399" },
    { id: "3", name: "Inter", type: "checking", institution: "Banco Inter", balance: 3200.00, color: "#FF7A00" },
    { id: "4", name: "Poupança BB", type: "savings", institution: "Banco do Brasil", balance: 45000.00, color: "#FFEF00" },
    { id: "5", name: "XP Investimentos", type: "investment", institution: "XP", balance: 128500.00, color: "#1D1D1B" },
    { id: "6", name: "Tesouro Direto", type: "investment", institution: "Tesouro Nacional", balance: 67800.00, color: "#009B3A" },
    { id: "7", name: "Carteira", type: "cash", institution: "", balance: 350.00, color: "#6B7280" },
];

const Accounts = () => {
    const [showValues, setShowValues] = useState(true);
    const fmt = (v: number) => showValues ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "•••••";

    const total = MOCK_ACCOUNTS.filter((a) => a.type !== "credit_card").reduce((s, a) => s + a.balance, 0);
    const byType: Record<string, typeof MOCK_ACCOUNTS> = {};
    MOCK_ACCOUNTS.forEach((a) => { if (!byType[a.type]) byType[a.type] = []; byType[a.type].push(a); });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-2xl font-bold text-foreground">Saldos & Bancos</h1>
                    <p className="text-sm text-muted-foreground">Todas as suas contas em um só lugar</p>
                </motion.div>
                <div className="flex gap-3">
                    <button onClick={() => setShowValues(!showValues)} className="btn-gold-outline flex items-center gap-2 px-4 py-2 text-sm">
                        {showValues ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
                        <Plus size={16} /> Nova Conta
                    </button>
                </div>
            </div>

            {/* Total */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-3d-highlight p-6 text-center">
                <p className="text-sm text-muted-foreground">Patrimônio Total</p>
                <p className="mt-1 text-gradient-gold text-4xl font-bold">{fmt(total)}</p>
                <p className="mt-2 text-xs text-muted-foreground">{MOCK_ACCOUNTS.length} contas conectadas</p>
            </motion.div>

            {/* By Type */}
            {Object.entries(byType).map(([type, accounts], gi) => {
                const Icon = ICON_MAP[type] || Wallet;
                return (
                    <motion.div key={type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.1 }}>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            <Icon size={16} /> {TYPE_MAP[type] || type}
                        </h3>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {accounts.map((acc, i) => (
                                <motion.div
                                    key={acc.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: gi * 0.1 + i * 0.05 }}
                                    whileHover={{ y: -3, transition: { duration: 0.25 } }}
                                    className="card-3d p-5"
                                >
                                    <div className="mb-3 flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${acc.color}15` }}>
                                            <Icon size={18} style={{ color: acc.color }} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{acc.name}</p>
                                            {acc.institution && <p className="text-xs text-muted-foreground">{acc.institution}</p>}
                                        </div>
                                    </div>
                                    <p className={`text-xl font-bold ${acc.balance >= 0 ? "text-foreground" : "text-red-400"}`}>
                                        {fmt(acc.balance)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default Accounts;
