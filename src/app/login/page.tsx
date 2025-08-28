"use client";

import * as React from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { toast } from "sonner";
import { Loader2, Zap, Shield, Eye, EyeOff, AlertCircle, CheckCircle2, Sparkles, Lock, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [backendDown, setBackendDown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);

  useEffect(() => {
    // Sinalização vinda de áreas autenticadas
    try {
      if (typeof window !== "undefined" && sessionStorage.getItem("backend_offline") === "1") {
        setBackendDown(true);
        sessionStorage.removeItem("backend_offline");
        toast.error("Sistema temporariamente indisponível. Tente novamente mais tarde.");
      }
    } catch {}

    // Verificação direta no primeiro acesso
    (async () => {
      try {
        await api.get("/docs", { headers: { Accept: "text/html" }, timeout: 3000 });
      } catch {
        setBackendDown(true);
        toast.error("Não foi possível conectar ao servidor. Verifique sua conexão.");
      }
    })();
  }, []);

  // Validação em tempo real
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(email));
  }, [email]);

  useEffect(() => {
    setIsValidPassword(password.length >= 6);
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await login({ email, password });
      toast.success("Login realizado com sucesso!");
    } catch (err) {
      setError("Falha no login. Verifique suas credenciais.");
      toast.error("Credenciais inválidas. Verifique seu email e senha.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 15,
        delay: 0.2
      }
    }
  };

  return (
         <div className="min-h-screen bg-[#e9e8e2] relative overflow-hidden">
           {/* Background Patterns */}
           <div className="absolute inset-0 bg-visible-lines opacity-50"></div>
           <div className="absolute inset-0 bg-horizontal-lines opacity-40"></div>
           <div className="absolute inset-0 bg-subtle-pattern opacity-30"></div>
           
           {/* Geometric Patterns */}
           <div className="geometric-pattern"></div>
           <div className="diagonal-lines"></div>
      
      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div 
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo Section */}
          <motion.div 
            className="text-center mb-12"
            variants={itemVariants}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-24 h-24 gradient-primary rounded-3xl shadow-2xl mb-8 relative"
              variants={logoVariants}
              whileHover={{ 
                scale: 1.1, 
                rotate: 5,
                boxShadow: "0 0 40px rgba(59, 130, 246, 0.6)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Zap className="w-12 h-12 text-white" />
              <motion.div 
                className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/20 to-purple-400/20"
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
            </motion.div>
            
            <motion.h1 
              className="text-5xl font-bold text-gradient-hero mb-4"
              variants={itemVariants}
            >
              EletroON
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-700 font-medium mb-2"
              variants={itemVariants}
            >
              Sistema de Monitoramento de Energia
            </motion.p>
            
            <motion.div 
              className="flex items-center justify-center gap-2 text-sm text-gray-600"
              variants={itemVariants}
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Inteligente • Moderno • Confiável</span>
            </motion.div>
          </motion.div>

          {/* Login Card */}
          <motion.div variants={itemVariants}>
            <Card className="glass-effect border-0 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              {/* Card Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-blue-50/80"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
              
              <CardHeader className="text-center pb-8 relative z-10">
                <motion.div 
                  className="flex items-center justify-center w-20 h-20 gradient-accent rounded-3xl mx-auto mb-6 shadow-lg"
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Shield className="w-10 h-10 text-white" />
                </motion.div>
                
                <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
                  Acesso Seguro
                </CardTitle>
                
                <CardDescription className="text-gray-600 text-lg">
                  Entre com suas credenciais para acessar o dashboard
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-8 pb-8 relative z-10">
                {/* Backend Status Alert */}
                {backendDown && (
                  <motion.div 
                    className="mb-8 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 text-sm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Sistema temporariamente indisponível. Tente novamente mais tarde.</span>
                    </div>
                  </motion.div>
                )}



                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Email Field */}
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" />
                      Email
                      {isValidEmail && email && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </Label>
                    <div className="relative">
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="seu@email.com"
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        disabled={isLoading}
                        className={`input-modern pr-12 text-lg ${
                          email && !isValidEmail ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {email && !isValidEmail && (
                        <motion.div 
                          className="absolute right-4 top-1/2 transform -translate-y-1/2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-500" />
                      Senha
                      {isValidPassword && password && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        disabled={isLoading}
                        className={`input-modern pr-14 text-lg ${
                          password && !isValidPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {password && !isValidPassword && (
                      <motion.p 
                        className="text-sm text-red-500 flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        A senha deve ter pelo menos 6 caracteres
                      </motion.p>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div 
                      className="rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 text-sm"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">{error}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="pt-4"
                  >
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-lg font-bold button-gradient-animate text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300" 
                      disabled={isLoading || !isValidEmail || !isValidPassword}
                    >
                      {isLoading ? (
                        <motion.div 
                          className="flex items-center gap-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Entrando...</span>
                        </motion.div>
                      ) : (
                        <motion.div 
                          className="flex items-center gap-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <span>Entrar no Sistema</span>
                          <ArrowRight className="w-5 h-5" />
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div 
            className="text-center mt-12"
            variants={itemVariants}
          >
            <p className="text-sm text-gray-600 font-medium">
              © 2024 EletroON. Todos os direitos reservados.
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Sistema Seguro</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <span>SSL Criptografado</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
