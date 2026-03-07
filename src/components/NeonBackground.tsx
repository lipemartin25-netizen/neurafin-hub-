'use client'

import { motion } from 'framer-motion'

export default function NeonBackground() {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none', backgroundColor: '#050608' }}>
            {/* Primary Glowing Mesh */}
            <motion.div
                animate={{
                    opacity: [0.4, 0.6, 0.4],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute', top: '-20%', right: '-10%',
                    width: '80vw', height: '80vw',
                    background: 'radial-gradient(circle at center, rgba(201,168,88,0.25) 0%, rgba(201,168,88,0.05) 50%, transparent 80%)',
                    filter: 'blur(100px)',
                }}
            />

            <motion.div
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.2, 1],
                    x: [0, 30, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute', bottom: '-20%', left: '-10%',
                    width: '90vw', height: '90vw',
                    background: 'radial-gradient(circle at center, rgba(154,125,58,0.2) 0%, rgba(201,168,88,0.05) 50%, transparent 80%)',
                    filter: 'blur(120px)',
                }}
            />

            {/* Intense Neon Accents (Diagonal Beams) */}
            <motion.div
                animate={{
                    opacity: [0.2, 0.4, 0.2],
                    rotate: [35, 38, 35]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute', top: '10%', left: '10%',
                    width: '150%', height: '300px',
                    background: 'linear-gradient(90deg, transparent, rgba(223,192,122,0.15), transparent)',
                    filter: 'blur(60px)',
                    transform: 'rotate(35deg)',
                }}
            />

            {/* Sparkles / Bokeh Particles */}
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: Math.random() * 100 + 'vw',
                        y: Math.random() * 100 + 'vh',
                        scale: Math.random() * 0.5 + 0.5,
                        opacity: Math.random() * 0.3 + 0.2
                    }}
                    animate={{
                        y: ['-10vh', '110vh'],
                        opacity: [0, 0.6, 0],
                        scale: [0.5, 1.2, 0.5]
                    }}
                    transition={{
                        duration: Math.random() * 20 + 20,
                        repeat: Infinity,
                        delay: Math.random() * 20,
                        ease: 'linear'
                    }}
                    style={{
                        position: 'absolute',
                        width: 4 + Math.random() * 6,
                        height: 4 + Math.random() * 6,
                        borderRadius: '50%',
                        background: '#dfc07a',
                        filter: 'blur(1px)',
                        boxShadow: '0 0 15px #dfc07a, 0 0 30px #c9a858',
                    }}
                />
            ))}

            {/* Center Focus (Stronger behind content) */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100vw', height: '100vh',
                background: 'radial-gradient(circle at center, rgba(201,168,88,0.12) 0%, transparent 70%)',
                filter: 'blur(140px)',
            }} />
        </div>
    )
}
