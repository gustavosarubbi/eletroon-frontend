"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Shield, BarChart3, Building2, Menu, X, ArrowLeft, LogOut, Settings, User, Crown } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logout realizado com sucesso!");
    router.push("/login");
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user?.role !== "ADMIN") {
        router.replace("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const navigation = [
    {
      name: "Visão Geral",
      href: "/admin/dashboard",
      icon: Building2,
      current: pathname === "/admin/dashboard",
      description: "Visão geral de todos os medidores e estatísticas do sistema"
    },
    {
      name: "Ver Dashboard das Salas",
      href: "/admin/graficos",
      icon: BarChart3,
      current: pathname === "/admin/graficos",
      description: "Visualizar gráficos e dados detalhados de cada sala"
    }
  ];

  if (isLoading || !isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gradient-hero mb-4">
            Área Administrativa
          </h1>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-gray-600">Verificando permissões...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-overlay bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Admin Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-sidebar w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        initial={false}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gradient-hero">Admin</span>
                <div className="text-xs text-gray-500 font-medium">Painel de Controle</div>
              </div>
            </motion.div>
            
            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button
                    variant={item.current ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-4 text-left ${
                      item.current
                        ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => {
                      router.push(item.href);
                      setSidebarOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-6 h-6 mt-0.5 ${
                        item.current ? "text-blue-600" : "text-gray-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm text-gray-500 mt-1 leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="w-12 h-12 gradient-accent rounded-full flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Administrador
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard Principal
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-gray-600 hover:text-gray-800 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              onClick={() => toast.info("Configurações em desenvolvimento")}
            >
              <Settings className="w-4 h-4" />
              Configurações
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sair do Sistema
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="lg:pl-80">
        {/* Top Bar */}
        <motion.header 
                      className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Page Title */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => item.current)?.name || "Área Administrativa"}
              </h1>
              <p className="text-sm text-gray-500">
                {navigation.find(item => item.current)?.description || "Gerenciamento do sistema"}
              </p>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>Modo Administrativo</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
