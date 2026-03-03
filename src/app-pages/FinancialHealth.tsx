import { motion } from "framer-motion";
import { ShieldCheck, Heart, Sparkles, AlertCircle, CheckCircle2, TrendingUp, Wallet, Flame } from "lucide-react";

const FinancialHealth = () => {
    const score = 82;
    const status = score > 80 ? "Excelente" : score > 60 ? "Bom" : "Razoável";
    const color = score > 80 ? "text-emerald-400" : score > 60 ? "text-yellow-400" : "text-red-400";

    const METRICS = [
        { name: "Reserva de Emergência", value: "9 meses", status: "safe", desc: "Sua reserva cobre 9 meses de gastos fixos." },
        { name: "Taxa de Poupança", value: "28%", status: "safe", desc: "Você poupa R$ 3.500 em média por mês." },
        { name: "Dívidas/Renda", value: "12%", status: "safe", desc: "Seu comprometimento de renda está baixo." },
        { name: "Diversificação", value: "Moderada", status: "warn", desc: "Você tem 70% do patrimônio em Renda Fixa." },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-foreground">Saúde Financeira</h1>
                <p className="text-sm text-muted-foreground">Diagnóstico em tempo real do seu bem-estar financeiro</p>
            </motion.div>

            {/* Main Score Card */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-3d-highlight flex flex-col items-center justify-center p-8 lg:col-span-1">
                    <div className="relative mb-4 flex h-40 w-40 items-center justify-center">
                        <svg className="h-full w-full rotate-[-90deg]">
                            <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary" />
                            <motion.circle
                                cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent"
                                strokeDasharray={440}
                                initial={{ strokeDashoffset: 440 }}
                                animate={{ strokeDashoffset: 440 - (440 * score) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="text-gold"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-gradient-gold">{score}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nexus Score</span>
                        </div>
                    </div>
                    <p className={`text-lg font-bold ${color}`}>{status}</p>
                    <p className="mt-1 text-center text-xs text-muted-foreground">Você está no top 5% dos nossos usuários em gestão de risco.</p>
                </motion.div>

                {/* AI Insights */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card-3d p-6 lg:col-span-2">
                    <div className="mb-4 flex items-center gap-2">
                        <Sparkles size={18} className="text-gold" />
                        <h3 className="font-semibold text-foreground">Diagnóstico da Nexus IA</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-4 rounded-xl bg-emerald-500/5 p-4 border border-emerald-500/10">
                            <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
                            <div>
                                <p className="text-sm font-semibold text-emerald-400">Ponto Forte: Reserva de Liquidez</p>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                    Sua reserva de emergência está acima da média (6 meses). Isso lhe garante segurança total para tomar decisões de carreira ou investimento arrojados.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 rounded-xl bg-yellow-500/5 p-4 border border-yellow-500/10">
                            <AlertCircle size={20} className="shrink-0 text-yellow-400" />
                            <div>
                                <p className="text-sm font-semibold text-yellow-400">Oportunidade: Diversificação Internacional</p>
                                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                                    Identificamos que 100% do seu patrimônio está no Brasil. Para aumentar sua saúde financeira, sugerimos expor pelo menos 10% do capital ao Dólar.
                                </p>
                            </div>
                        </div>
                    </div>
                    <button className="btn-gold-outline w-full mt-4 py-2 text-xs">Ver plano de ação detalhado</button>
                </motion.div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {METRICS.map((m, i) => (
                    <motion.div key={m.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="card-3d p-5">
                        <p className="text-xs font-medium text-muted-foreground">{m.name}</p>
                        <p className="mt-1 text-xl font-bold text-foreground">{m.value}</p>
                        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground/70">{m.desc}</p>
                        <div className={`mt-3 h-1 w-full rounded-full ${m.status === "safe" ? "bg-emerald-500/30" : "bg-yellow-500/30"}`} />
                    </motion.div>
                ))}
            </div>

            {/* Pillars */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {[
                    { icon: ShieldCheck, title: "Proteção", val: "95%", desc: "Seguros e reserva" },
                    { icon: Wallet, title: "Gestão", val: "88%", desc: "Orçamentos e dívidas" },
                    { icon: Flame, title: "Aceleração", val: "62%", desc: "Investimentos" },
                ].map((p, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className="card-3d p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-gold">
                            <p.icon size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-foreground">{p.title}</p>
                                <span className="text-xs font-bold text-gold">{p.val}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{p.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default FinancialHealth;
