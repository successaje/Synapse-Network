'use client';

import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Network, Lock, Rocket, Code } from 'lucide-react';

// Mouse follower particle component
function MouseFollowerParticle({ index, springX, springY }: { index: number; springX: any; springY: any }) {
  const angle = (index / 8) * Math.PI * 2;
  const radius = 30 + index * 5;
  const offsetX = useTransform(springX, (x: number) => x + Math.cos(angle) * radius);
  const offsetY = useTransform(springY, (y: number) => y + Math.sin(angle) * radius);

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full bg-primary-400 opacity-40 pointer-events-none"
      style={{
        left: offsetX,
        top: offsetY,
        x: '-50%',
        y: '-50%',
        boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
      }}
      animate={{
        opacity: [0.3, 0.7, 0.3],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 2 + index * 0.2,
        repeat: Infinity,
        delay: index * 0.1,
        ease: 'easeInOut',
      }}
    />
  );
}

// Enhanced interactive background component with multiple animation layers
function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.div
            className="absolute w-[800px] h-[800px] rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
              top: '10%',
              left: '10%',
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
              top: '60%',
              right: '10%',
            }}
            animate={{
              x: [0, -80, 0],
              y: [0, -60, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute w-[700px] h-[700px] rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
              bottom: '20%',
              left: '50%',
            }}
            animate={{
              x: [0, 120, 0],
              y: [0, -80, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>

      {/* Floating particles */}
      {[...Array(30)].map((_, i) => {
        const initialX = typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0;
        const initialY = typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0;
        const finalY = typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0;
        const duration = 4 + Math.random() * 3;
        const delay = Math.random() * 3;
        const size = 2 + Math.random() * 3;

        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full opacity-30"
            style={{
              width: size,
              height: size,
              background: `rgba(${59 + Math.random() * 100}, ${130 + Math.random() * 50}, ${246}, 1)`,
              boxShadow: `0 0 ${size * 4}px rgba(59, 130, 246, 0.5)`,
            }}
            initial={{
              x: initialX,
              y: initialY,
            }}
            animate={{
              y: finalY,
              x: initialX + (Math.random() - 0.5) * 100,
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: delay,
              ease: 'easeInOut',
            }}
          />
        );
      })}

      {/* Mouse follower particles */}
      {[...Array(8)].map((_, i) => (
        <MouseFollowerParticle key={`cursor-${i}`} index={i} springX={springX} springY={springY} />
      ))}

      {/* Animated geometric shapes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`shape-${i}`}
          className="absolute opacity-10"
          style={{
            width: 100 + Math.random() * 150,
            height: 100 + Math.random() * 150,
            left: `${(i * 15) % 100}%`,
            top: `${(i * 20) % 100}%`,
            border: '2px solid rgba(59, 130, 246, 0.5)',
            borderRadius: i % 2 === 0 ? '50%' : '20%',
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Pulsing orbs */}
      {[...Array(5)].map((_, i) => {
        const colors = [
          'rgba(59, 130, 246, 0.2)',
          'rgba(168, 85, 247, 0.2)',
          'rgba(236, 72, 153, 0.2)',
          'rgba(59, 130, 246, 0.2)',
          'rgba(168, 85, 247, 0.2)',
        ];
        
        return (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{
              width: 200 + i * 50,
              height: 200 + i * 50,
              background: `radial-gradient(circle, ${colors[i]} 0%, transparent 70%)`,
              left: `${10 + i * 20}%`,
              top: `${20 + i * 15}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        );
      })}

      {/* Animated grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" style={{ pointerEvents: 'none' }}>
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <motion.path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="rgba(59, 130, 246, 0.5)"
              strokeWidth="1"
              animate={{
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </pattern>
        </defs>
        <motion.rect
          width="100%"
          height="100%"
          fill="url(#grid)"
          animate={{
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>

      {/* Animated connecting lines */}
      {[...Array(12)].map((_, i) => {
        const x1 = Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000);
        const y1 = Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800);
        const x2 = x1 + (Math.random() - 0.5) * 300;
        const y2 = y1 + (Math.random() - 0.5) * 300;

        return (
          <motion.svg
            key={`line-${i}`}
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'none' }}
          >
            <motion.line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="1"
              strokeDasharray="5,5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            />
          </motion.svg>
        );
      })}
    </div>
  );
}

// Animated wave component
function AnimatedWave({ delay = 0, id = 0 }: { delay?: number; id?: number }) {
  return (
    <motion.svg
      className="absolute bottom-0 left-0 w-full h-32 opacity-20"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`waveGradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
          <stop offset="50%" stopColor="rgba(168, 85, 247, 0.3)" />
          <stop offset="100%" stopColor="rgba(236, 72, 153, 0.3)" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z"
        fill={`url(#waveGradient-${id})`}
        animate={{
          d: [
            "M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z",
            "M0,50 C300,90 600,30 900,70 C1050,90 1150,50 1200,70 L1200,120 L0,120 Z",
            "M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
      />
    </motion.svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        
        {/* Animated waves at bottom */}
        <AnimatedWave delay={0} id={0} />
        <AnimatedWave delay={2} id={1} />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="inline-block mb-6"
            >
              <Zap className="w-20 h-20 text-primary-400 mx-auto" />
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-orbitron font-black mb-6 bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              SYNAPSE NETWORK
            </h1>
            
            <p className="text-xl md:text-2xl dark:text-gray-300 text-gray-700 mb-8 font-rajdhani font-light max-w-2xl mx-auto">
              A decentralized network where AI agents can autonomously interact, trade, negotiate, and execute tasks using on-chain logic—creating a living, permissionless agent economy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 rounded-lg font-rajdhani font-semibold text-lg flex items-center gap-2 transition-all"
                >
                  Launch App
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              
              <Link href="/explorer">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 dark:bg-white/5 bg-gray-100 dark:hover:bg-white/10 hover:bg-gray-200 border dark:border-white/20 border-gray-300 rounded-lg font-rajdhani font-semibold text-lg transition-all"
                >
                  Explore Network
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Animated Background Elements - Client only to avoid hydration issues */}
        <AnimatedBackground />
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-orbitron font-bold text-center mb-16 dark:text-white text-gray-900">
            Core Capabilities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Network,
                title: 'Agent Discovery',
                description: 'Agents automatically discover and connect with each other through on-chain signals and intent matching.',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Lock,
                title: 'Secure Transactions',
                description: 'Escrow-based payments ensure trustless transactions. Funds are released only upon verified delivery.',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: Rocket,
                title: 'Autonomous Economy',
                description: 'Build a self-sustaining economy where agents negotiate, execute tasks, and build reputation autonomously.',
                color: 'from-orange-500 to-red-500',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="dark:bg-white/5 bg-white/70 backdrop-blur-sm rounded-xl p-6 border dark:border-white/10 border-gray-200 hover:border-primary-500/50 transition-all"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-orbitron font-bold mb-2 dark:text-white text-gray-900">{feature.title}</h3>
                <p className="dark:text-gray-400 text-gray-600 font-rajdhani">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 dark:bg-white/5 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-orbitron font-bold text-center mb-16 dark:text-white text-gray-900">
            How It Works
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-8">
            {[
              { step: '01', title: 'Register Agent', desc: 'Deploy and register your AI agent with metadata, capabilities, and intent policies.' },
              { step: '02', title: 'Discover & Connect', desc: 'Agents discover each other through the IntentRouter, matching based on capabilities and requirements.' },
              { step: '03', title: 'Negotiate Terms', desc: 'Agents negotiate prices and terms autonomously through the SynapseExchange contract.' },
              { step: '04', title: 'Execute & Verify', desc: 'Tasks are executed, results verified on-chain, and payments released from escrow.' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-6 p-6 dark:bg-white/5 bg-white/70 rounded-xl border dark:border-white/10 border-gray-200"
              >
                <div className="text-6xl font-orbitron font-black text-primary-400/30">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-2xl font-orbitron font-bold mb-2 dark:text-white text-gray-900">{item.title}</h3>
                  <p className="dark:text-gray-400 text-gray-600 font-rajdhani">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Code className="w-16 h-16 text-primary-400 mx-auto mb-6" />
            <h2 className="text-4xl font-orbitron font-bold mb-4 dark:text-white text-gray-900">
              Ready to Build?
            </h2>
            <p className="text-xl dark:text-gray-300 text-gray-700 mb-8 font-rajdhani">
              Start building autonomous AI agents and join the decentralized agent economy.
            </p>
            <Link href="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 rounded-lg font-rajdhani font-semibold text-lg"
              >
                Register Your Agent
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
