"use client";

import * as React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Zap, Shield, Activity, TrendingUp, BarChart3, Sparkles, ArrowRight, CheckCircle, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (user?.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/login");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        delay: 0.4
      }
    }
  };

  const floatVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
                             <div className="min-h-screen bg-[#e9e8e2] relative overflow-hidden">
                 {/* Background Patterns - Reduzidos */}
                 <div className="absolute inset-0 bg-visible-lines opacity-30 pointer-events-none"></div>
                 <div className="absolute inset-0 bg-horizontal-lines opacity-20 pointer-events-none"></div>
                 <div className="absolute inset-0 bg-subtle-pattern opacity-15 pointer-events-none"></div>
                 
                 {/* Geometric Patterns - Reduzidos */}
                 <div className="geometric-pattern pointer-events-none opacity-40"></div>
                 <div className="diagonal-lines pointer-events-none opacity-30"></div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div 
          className="text-center max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo and Title */}
          <motion.div 
            className="mb-16"
            variants={itemVariants}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-32 h-32 gradient-primary rounded-4xl shadow-2xl mb-12 relative"
              variants={iconVariants}
              whileHover={{ 
                scale: 1.1, 
                rotate: 5,
                boxShadow: "0 0 50px rgba(59, 130, 246, 0.6)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Zap className="w-16 h-16 text-white" />
              <motion.div 
                className="absolute inset-0 rounded-4xl bg-gradient-to-r from-blue-400/20 to-purple-400/20"
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
            </motion.div>
            
            <motion.h1 
              className="text-6xl sm:text-7xl lg:text-8xl font-bold text-gradient-hero mb-8"
              variants={itemVariants}
            >
              EletroON
            </motion.h1>
            
            <motion.p 
              className="text-2xl sm:text-3xl text-gray-700 font-medium max-w-4xl mx-auto leading-relaxed mb-6"
              variants={itemVariants}
            >
              Sistema Inteligente de Monitoramento e Gestão de Energia
            </motion.p>

            <motion.div 
              className="flex items-center justify-center gap-4 text-lg text-gray-600 mb-8"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span>Inteligente</span>
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span>Seguro</span>
              </div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-500" />
                <span>Moderno</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            variants={itemVariants}
          >
            <motion.div 
              className="glass-effect p-8 rounded-3xl border-0 shadow-2xl backdrop-blur-xl relative overflow-hidden group"
              whileHover={{ scale: 1.05, y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl"></div>
              <div className="relative z-10">
                <motion.div 
                  className="w-20 h-20 gradient-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  variants={floatVariants}
                  animate="animate"
                >
                  <Activity className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Monitoramento em Tempo Real</h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  Acompanhe o consumo de energia e parâmetros elétricos em tempo real com atualizações a cada segundo.
                </p>
                <div className="mt-6 flex items-center gap-2 text-blue-600 font-medium">
                  <span>Saiba mais</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="glass-effect p-8 rounded-3xl border-0 shadow-2xl backdrop-blur-xl relative overflow-hidden group"
              whileHover={{ scale: 1.05, y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-3xl"></div>
              <div className="relative z-10">
                <motion.div 
                  className="w-20 h-20 gradient-success rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  variants={floatVariants}
                  animate="animate"
                  style={{ animationDelay: '0.5s' }}
                >
                  <TrendingUp className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Análise Inteligente</h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  Relatórios detalhados e gráficos interativos para análise de tendências e otimização de consumo.
                </p>
                <div className="mt-6 flex items-center gap-2 text-green-600 font-medium">
                  <span>Saiba mais</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="glass-effect p-8 rounded-3xl border-0 shadow-2xl backdrop-blur-xl relative overflow-hidden group"
              whileHover={{ scale: 1.05, y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl"></div>
              <div className="relative z-10">
                <motion.div 
                  className="w-20 h-20 gradient-warning rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  variants={floatVariants}
                  animate="animate"
                  style={{ animationDelay: '1s' }}
                >
                  <BarChart3 className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Dashboard Avançado</h3>
                <p className="text-gray-600 text-base leading-relaxed">
                  Interface moderna e responsiva para visualização de dados e controle total do sistema.
                </p>
                <div className="mt-6 flex items-center gap-2 text-orange-600 font-medium">
                  <span>Saiba mais</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
            variants={itemVariants}
          >
            <motion.div 
              className="glass-effect p-6 rounded-2xl text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-sm text-gray-600 font-medium">Uptime</div>
            </motion.div>
            <motion.div 
              className="glass-effect p-6 rounded-2xl text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600 font-medium">Monitoramento</div>
            </motion.div>
            <motion.div 
              className="glass-effect p-6 rounded-2xl text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
              <div className="text-sm text-gray-600 font-medium">Medidores</div>
            </motion.div>
            <motion.div 
              className="glass-effect p-6 rounded-2xl text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl font-bold text-orange-600 mb-2">50+</div>
              <div className="text-sm text-gray-600 font-medium">Clientes</div>
            </motion.div>
          </motion.div>

          {/* Loading State */}
          <motion.div 
            className="flex flex-col items-center justify-center space-y-6"
            variants={itemVariants}
          >
            <motion.div 
              className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center shadow-2xl"
              animate={{ 
                rotate: 360,
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 40px rgba(59, 130, 246, 0.6)",
                  "0 0 20px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-3 text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xl font-semibold">Carregando sistema...</span>
            </motion.div>
            
            <motion.p 
              className="text-base text-gray-500 max-w-2xl text-center leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Preparando sua experiência personalizada de monitoramento de energia com tecnologia de ponta
            </motion.p>

            <motion.div 
              className="flex items-center gap-4 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Sistema Verificado</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Conexão Segura</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Dados Criptografados</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
