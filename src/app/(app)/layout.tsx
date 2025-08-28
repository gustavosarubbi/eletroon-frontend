"use client";

import * as React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { 
  Zap, 
  LogOut, 
  User, 
  Bell,
  Search,
  Menu,
  X,
  Settings,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    // Simular notificações (em produção viria da API)
    const interval = setInterval(() => {
      setNotifications(Math.floor(Math.random() * 5));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso!");
  };

  if (isLoading) {
    return (
                                                     <div className="min-h-screen bg-[#e9e8e2] flex items-center justify-center relative overflow-hidden">
                             {/* Background Patterns - Reduzidos */}
                             <div className="absolute inset-0 bg-visible-lines opacity-30 pointer-events-none"></div>
                             <div className="absolute inset-0 bg-horizontal-lines opacity-20 pointer-events-none"></div>
                             <div className="absolute inset-0 bg-subtle-pattern opacity-15 pointer-events-none"></div>
                             
                             {/* Geometric Patterns - Reduzidos */}
                             <div className="geometric-pattern pointer-events-none opacity-40"></div>
                             <div className="diagonal-lines pointer-events-none opacity-30"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center relative z-10"
        >
          <motion.div 
            className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
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
            <Zap className="w-10 h-10 text-white" />
          </motion.div>
          <p className="text-gray-700 font-semibold text-lg">Carregando aplicação...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Se for admin, não renderiza este layout (usa o layout específico do admin)
  if (user?.role === "ADMIN" && pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
         <div className="min-h-screen bg-[#e9e8e2]">
       {/* Main Content */}
       <div className="pl-0">
        {/* Top Bar */}
        <motion.header 
          className="glass-effect border-b border-white/20 sticky top-0 z-header backdrop-blur-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between h-20 px-6 sm:px-8 lg:px-12">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient-hero">EletroON</span>
            </motion.div>

            {/* Search Bar - Desktop */}
            <div className="flex-1 max-w-lg mx-8 hidden lg:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar medidores, relatórios..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900 text-lg"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-3 rounded-2xl hover:bg-white/20 transition-all duration-300"
                  onClick={() => toast.info("Notificações em desenvolvimento")}
                >
                  <Bell className="w-6 h-6" />
                  {notifications > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
                    >
                      {notifications}
                    </motion.span>
                  )}
                </Button>
              </motion.div>

              {/* User Info */}
              <motion.div 
                className="flex items-center gap-4 p-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20"
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-10 h-10 gradient-accent rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-600 capitalize font-medium">
                    {user?.role?.toLowerCase()}
                  </p>
                </div>
              </motion.div>

              {/* Mobile Menu Button */}
              <motion.div 
                className="lg:hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-3 rounded-2xl hover:bg-white/20 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </Button>
              </motion.div>

              {/* Logout Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300 px-6 py-3 rounded-2xl font-semibold transition-all duration-300"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="lg:hidden px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-900"
              />
            </div>
          </div>
        </motion.header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden glass-effect border-b border-white/20"
            >
              <div className="px-6 py-4 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/20">
                  <div className="w-10 h-10 gradient-accent rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.email}
                    </p>
                    <p className="text-xs text-gray-600 capitalize">
                      {user?.role?.toLowerCase()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="ghost"
                    className="justify-start p-3 rounded-2xl hover:bg-white/20"
                    onClick={() => toast.info("Configurações em desenvolvimento")}
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Configurações
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start p-3 rounded-2xl hover:bg-white/20"
                    onClick={() => toast.info("Ajuda em desenvolvimento")}
                  >
                    <HelpCircle className="w-5 h-5 mr-3" />
                    Ajuda
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

                 {/* Page Content */}
         <main className="min-h-screen relative">
           {/* Background Patterns - Reduzidos para evitar interferência */}
           <div className="absolute inset-0 bg-visible-lines opacity-30 pointer-events-none"></div>
           <div className="absolute inset-0 bg-horizontal-lines opacity-20 pointer-events-none"></div>
           <div className="absolute inset-0 bg-subtle-pattern opacity-15 pointer-events-none"></div>
           
           {/* Geometric Patterns - Reduzidos */}
           <div className="geometric-pattern pointer-events-none opacity-40"></div>
           <div className="diagonal-lines pointer-events-none opacity-30"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
