import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Landmark, Briefcase, Car, Home as HomeIcon, Calculator, ChevronRight } from "lucide-react";

const ASSETS = [
    {
        group: "Financeiro", items: [
            { name: "Saldos Bancários", amount: 24350.50, type: "liquidez" },
            { name: "Investimentos", amount: 165800.00, type: "investimento" },
            { name: "Criptoativos", amount: 51300.67, type: "risco" },
        ]
    },
    {
        group: "Bens e Direitos", items: [
            { name: "Imóvel Residencial", amount: 450000.00, type: "imovel" },
            { name: "Veículo (Toyota Corolla)", amount: 115000.00, type: "veiculo" },
            { name: "Equipamentos Home Office", amount: 18500.00, type: "bem" },
        ]
    }
];

const LIABILITIES = [
    {
        group: "Dívidas", items: [
            { name: "Financiamento Imóvel", amount: 185200.00, type: "longo" },
            { name: "Crédito Estudantil", amount: 15400.00, type: "curto" },
            { name: "Faturas Cartão de Crédito", amount: 8450.32, type: "curto" },
        ]
    }
];

const ICON_MAP: Record<string, any> = {
    liquidez: Landmark,
    investimento: Briefcase,
    risco: TrendingUp,
    imovel: HomeIcon,
    veiculo: Car,
    bem: Calculator,
    longo: TrendingDown,
    curto: Calculator,
};

const Patrimony = () => {
    const totalAssets = ASSETS.reduce((s, g) => s + g.items.reduce((sub, i) => sub + i.amount, 0), 0);
    const totalLiabilities = LIABILITIES.reduce((s, g) => s + g.items.reduce((sub, i) => sub + i.amount, 0), 0);
    const netWorth = totalAssets - totalLiabilities;
    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-foreground">Patrimônio Líquido</h1>
                <p className="text-sm text-muted-foreground">Visão holística de tudo que você possui e deve</p>
            </motion.div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-3d-highlight p-8 bg-gradient-to-br from-gold/20 via-transparent to-transparent">
                    <p className="text-sm text-muted-foreground">Patrimônio Líquido</p>
                    <p className="mt-2 text-3xl font-bold text-gradient-gold">{fmt(netWorth)}</p>
                    <div className="mt-6 flex items-center gap-2 text-xs text-emerald-400">
                        <TrendingUp size={14} /> +R$ 12,450.00 este mês
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 gap-4 lg:col-span-2 sm:grid-cols-2">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-3d p-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-muted-foreground">Total de Ativos</span>
                            <TrendingUp size={18} className="text-emerald-400" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{fmt(totalAssets)}</p>
                        <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 w-full" />
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-3d p-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-muted-foreground">Total de Passivos</span>
                            <TrendingDown size={18} className="text-red-400" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{fmt(totalLiabilities)}</p>
                        <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-red-400" style={{ width: `${(totalLiabilities / totalAssets) * 100}%` }} />
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Assets Breakdown */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h3 className="font-semibold text-foreground px-1">Ativos (O que você tem)</h3>
                    {ASSETS.map((group, gi) => (
                        <div key={group.group} className="card-3d overflow-hidden">
                            <div className="bg-secondary/30 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                {group.group}
                            </div>
                            <div className="divide-y divide-border/30">
                                {group.items.map((item, i) => {
                                    const Icon = ICON_MAP[item.type];
                                    return (
                                        <div key={item.name} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400">
                                                    <Icon size={16} />
                                                </div>
                                                <span className="text-sm font-medium text-foreground">{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-foreground">{fmt(item.amount)}</span>
                                                <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Liabilities Breakdown */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <h3 className="font-semibold text-foreground px-1">Passivos (O que você deve)</h3>
                    {LIABILITIES.map((group, gi) => (
                        <div key={group.group} className="card-3d overflow-hidden">
                            <div className="bg-secondary/30 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                {group.group}
                            </div>
                            <div className="divide-y divide-border/30">
                                {group.items.map((item, i) => {
                                    const Icon = ICON_MAP[item.type] || Calculator;
                                    return (
                                        <div key={item.name} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-red-400/10 text-red-400">
                                                    <Icon size={16} />
                                                </div>
                                                <span className="text-sm font-medium text-foreground">{item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-foreground">{fmt(item.amount)}</span>
                                                <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    <div className="card-3d p-6 border-gold/10 bg-gold/5">
                        <p className="text-xs font-bold text-gold uppercase tracking-wider mb-2">💡 Índice de Endividamento</p>
                        <p className="text-2xl font-bold text-foreground">{((totalLiabilities / totalAssets) * 100).toFixed(1)}%</p>
                        <p className="mt-1 text-xs text-muted-foreground">Seu nível de endividamento está saudável (abaixo de 35%).</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Patrimony;
