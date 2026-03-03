import { motion } from "framer-motion";
import { Flame, Clock, TrendingUp, Receipt, Target, GraduationCap, Users, Briefcase, ArrowRight } from "lucide-react";

const TOOLS = [
    { title: "Independência Financeira", desc: "Descubra quando você será livre", icon: Flame, color: "#F59E0B", tag: "FIRE" },
    { title: "Aposentadoria", desc: "Planeje seu futuro com segurança", icon: Clock, color: "#8B5CF6", tag: "INSS" },
    { title: "Simulador de Investimentos", desc: "Compare rendimentos lado a lado", icon: TrendingUp, color: "#10B981", tag: "SIM" },
    { title: "Planejador Tributário", desc: "Economize no imposto de renda", icon: Receipt, color: "#3B82F6", tag: "IRPF" },
    { title: "Meus Objetivos", desc: "Termômetro de metas financeiras", icon: Target, color: "#EC4899", tag: "METAS" },
    { title: "Academia Financeira", desc: "Aprenda com IA personalizada", icon: GraduationCap, color: "#06B6D4", tag: "EDU" },
    { title: "Casais Inteligentes", desc: "Divisão justa de despesas 50/50", icon: Users, color: "#F97316", tag: "COUPLE" },
    { title: "Toolkit MEI & Freelas", desc: "Gestão de caixa e imposto (DAS)", icon: Briefcase, color: "#EF4444", tag: "MEI" },
];

const WealthLab = () => (
    <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-3d-highlight overflow-hidden p-8">
            <div className="flex items-center gap-2">
                <Flame size={18} className="text-gold" />
                <span className="text-xs font-semibold uppercase tracking-widest text-gold">Nexus Wealth Lab</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold text-foreground">Laboratório de Riqueza</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Ferramentas matemáticas poderosas para proteger e multiplicar seu patrimônio. Escolha um dos módulos abaixo para projetar seu futuro.
            </p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool, i) => {
                const Icon = tool.icon;
                return (
                    <motion.div
                        key={tool.title}
                        initial={{ opacity: 0, y: 25, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: i * 0.06, duration: 0.5 }}
                        whileHover={{ y: -5, transition: { duration: 0.25 } }}
                        className="card-3d group cursor-pointer p-6"
                    >
                        <div className="mb-4 inline-flex rounded-xl p-2.5" style={{ backgroundColor: `${tool.color}15` }}>
                            <Icon size={20} style={{ color: tool.color }} />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">{tool.title}</h3>
                        <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{tool.desc}</p>
                        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gold opacity-70 transition-opacity group-hover:opacity-100">
                            Iniciar <ArrowRight size={12} />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    </div>
);

export default WealthLab;
