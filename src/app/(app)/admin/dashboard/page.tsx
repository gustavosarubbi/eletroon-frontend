"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminSalas, deleteDevice } from "../../../../lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";
import { RenameSalaDialog } from "./components/RenameSalaDialog";
import { ManageUserDialog } from "./components/ManageUserDialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../../components/ui/button";
import { 
  Trash2, 
  Loader2, 
  Eye, 
  EyeOff, 
  Building2, 
  Search,
  RefreshCw,
  AlertTriangle,
  Clock,
  Crown,
  Database,
  Wifi,
  WifiOff,
  UserCheck,
  UserX,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../../../../components/ui/input";

// Tipo esperado da API
type Sala = {
  meterId: number;
  name: string;
  status: "ONLINE" | "OFFLINE";
  lastReadingAt: string | null;
  user: { email: string } | null;
};

function SalaRow({ sala }: { sala: Sala }) {
  const [lastPwd, setLastPwd] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    try {
      const v = localStorage.getItem(`last_password_${sala.meterId}`);
      setLastPwd(v);
    } catch {}
  }, [sala.meterId]);

  const deleteMutation = useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSalas"] });
      queryClient.refetchQueries({ queryKey: ["adminSalas"] });
      toast.success("Medidor excluído com sucesso!");
    },
    onError: () => {
      toast.error("Falha ao excluir o medidor.");
    },
  });

  const onDelete = () => {
    if (confirm(`Tem certeza que deseja excluir o medidor ${sala.meterId}? Esta ação é irreversível.`)) {
      deleteMutation.mutate({ meterId: sala.meterId });
    }
  };

  return (
    <motion.tr 
      className="hover:bg-blue-50/50 smooth-transition border-b border-gray-100"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
    >
      <TableCell className="font-semibold text-gray-900 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-md">
            <Database className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold">#{sala.meterId}</span>
        </div>
      </TableCell>
      <TableCell className="font-medium text-gray-800 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center shadow-md">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold">{sala.name}</span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
            sala.status === "ONLINE" ? "gradient-success" : "gradient-danger"
          }`}>
            {sala.status === "ONLINE" ? (
              <Wifi className="w-4 h-4 text-white" />
            ) : (
              <WifiOff className="w-4 h-4 text-white" />
            )}
          </div>
          <Badge 
            variant={sala.status === "ONLINE" ? "success" : "destructive"} 
            className="flex items-center gap-2 w-fit px-3 py-1.5 font-medium"
          >
            <div className={`w-2 h-2 rounded-full ${sala.status === "ONLINE" ? "bg-green-500" : "bg-red-500"}`}></div>
            {sala.status}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="text-sm text-gray-700 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 gradient-warning rounded-lg flex items-center justify-center shadow-md">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium">
            {sala.lastReadingAt ? new Date(sala.lastReadingAt).toLocaleString("pt-BR") : "N/A"}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-gray-700 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
            sala.user ? "gradient-success" : "gradient-secondary"
          }`}>
            {sala.user ? (
              <UserCheck className="w-4 h-4 text-white" />
            ) : (
              <UserX className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="font-medium">
            {sala.user?.email ?? "—"}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-sm py-4">
        {lastPwd ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-gray-800 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              {show ? lastPwd : "••••••"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShow(!show)}
              className="h-9 w-9 p-0 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-blue-200 hover:border-blue-300 shadow-sm"
              title={show ? "Ocultar senha" : "Mostrar senha"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className="text-right py-4">
        <div className="flex items-center justify-end gap-3">
          <ManageUserDialog sala={sala} />
          <RenameSalaDialog sala={sala} />
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            disabled={deleteMutation.isPending}
            className="h-10 w-10 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-md hover:shadow-lg transition-all duration-300"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </Button>
        </div>
      </TableCell>
    </motion.tr>
  );
}

export default function AdminDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ONLINE" | "OFFLINE">("ALL");

  const { data: salas, isLoading, isError, refetch } = useQuery({
    queryKey: ["adminSalas"],
    queryFn: getAdminSalas,
  });

  const filteredSalas = React.useMemo(() => {
    if (!salas) return [];
    
    return salas.filter((sala: Sala) => {
      const matchesSearch = sala.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sala.meterId.toString().includes(searchTerm) ||
                           sala.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "ALL" || sala.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [salas, searchTerm, statusFilter]);

  const stats = React.useMemo(() => {
    if (!salas) return { total: 0, online: 0, offline: 0 };
    
    const total = salas.length;
    const online = salas.filter((s: Sala) => s.status === "ONLINE").length;
    const offline = salas.filter((s: Sala) => s.status === "OFFLINE").length;
    
    return { total, online, offline };
  }, [salas]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

                       if (isLoading) {
       return (
         <div className="min-h-screen bg-[#e9e8e2] flex items-center justify-center relative overflow-hidden">
           {/* Background Patterns */}
           <div className="absolute inset-0 bg-visible-lines opacity-50"></div>
           <div className="absolute inset-0 bg-horizontal-lines opacity-40"></div>
           <div className="absolute inset-0 bg-subtle-pattern opacity-30"></div>
           
           {/* Geometric Patterns */}
           <div className="geometric-pattern"></div>
           <div className="diagonal-lines"></div>
         
         <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
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
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          <p className="text-gray-700 font-semibold text-lg">Carregando dashboard administrativo...</p>
        </motion.div>
      </div>
    );
  }

                       if (isError) {
       return (
         <div className="min-h-screen bg-[#e9e8e2] flex items-center justify-center relative overflow-hidden">
           {/* Background Patterns */}
           <div className="absolute inset-0 bg-visible-lines opacity-50"></div>
           <div className="absolute inset-0 bg-horizontal-lines opacity-40"></div>
           <div className="absolute inset-0 bg-subtle-pattern opacity-30"></div>
           
           {/* Geometric Patterns */}
           <div className="geometric-pattern"></div>
           <div className="diagonal-lines"></div>
         
         <motion.div  
          className="text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-effect border-2 border-red-200 rounded-3xl p-8 max-w-md mx-auto shadow-2xl">
            <div className="text-red-600 mb-6">
              <motion.div 
                className="w-20 h-20 gradient-danger rounded-full flex items-center justify-center mx-auto shadow-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertTriangle className="w-10 h-10 text-white" />
              </motion.div>
            </div>
            <h3 className="text-xl font-bold text-red-800 mb-3">Erro de Conexão</h3>
            <p className="text-red-700 mb-6 text-lg">
              Não foi possível carregar os dados dos medidores.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-400 px-6 py-3 rounded-2xl font-semibold shadow-lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Tentar Novamente
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
              <motion.div 
       className="min-h-screen bg-[#e9e8e2] p-6 relative overflow-hidden"
       variants={containerVariants}
       initial="hidden"
       animate="visible"
     >
                               {/* Background Patterns */}
         <div className="absolute inset-0 bg-visible-lines opacity-50"></div>
         <div className="absolute inset-0 bg-horizontal-lines opacity-40"></div>
         <div className="absolute inset-0 bg-subtle-pattern opacity-30"></div>
         
         {/* Geometric Patterns */}
         <div className="geometric-pattern"></div>
         <div className="diagonal-lines"></div>
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header Section */}
        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-24 h-24 gradient-primary rounded-3xl shadow-2xl mb-6"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Crown className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold text-gradient-hero mb-4"
            variants={itemVariants}
          >
            Dashboard Administrativo
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-700 font-medium max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Gerencie todos os medidores e usuários do sistema EletroON
          </motion.p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={itemVariants}
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="gradient-glass p-6 rounded-2xl border-0 shadow-xl text-center">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.total}</h3>
              <p className="text-gray-600 font-semibold">Total de Medidores</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="gradient-glass p-6 rounded-2xl border-0 shadow-xl text-center">
              <div className="w-16 h-16 gradient-success rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Wifi className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.online}</h3>
              <p className="text-gray-600 font-semibold">Medidores Online</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="gradient-glass p-6 rounded-2xl border-0 shadow-xl text-center">
              <div className="w-16 h-16 gradient-danger rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <WifiOff className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.offline}</h3>
              <p className="text-gray-600 font-semibold">Medidores Offline</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Controls Section */}
        <motion.div 
          className="gradient-glass p-6 rounded-2xl border-0 shadow-xl"
          variants={itemVariants}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, ID ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("ALL")}
                  className="px-4 py-2"
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === "ONLINE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("ONLINE")}
                  className="px-4 py-2 gap-2"
                >
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <Wifi className="w-4 h-4" />
                  Online
                </Button>
                <Button
                  variant={statusFilter === "OFFLINE" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("OFFLINE")}
                  className="px-4 py-2 gap-2"
                >
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <WifiOff className="w-4 h-4" />
                  Offline
                </Button>
              </div>
            </div>

            {/* Refresh Button */}
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="px-4 py-2 border-blue-300 text-blue-700 hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </motion.div>

        {/* Table Section */}
        <motion.div 
          className="gradient-glass rounded-2xl border-0 shadow-xl overflow-hidden"
          variants={itemVariants}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-md">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              Medidores do Sistema
              <Badge variant="default" className="ml-2 bg-blue-100 text-blue-700 font-semibold">
                {filteredSalas.length} medidor{filteredSalas.length !== 1 ? 'es' : ''}
              </Badge>
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold text-gray-900 py-4">ID</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4">Nome da Sala</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4">Última Leitura</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4">Usuário</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4">Senha</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredSalas.map((sala: Sala) => (
                    <SalaRow key={sala.meterId} sala={sala} />
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          {filteredSalas.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-gray-400 mb-6">
                <div className="w-20 h-20 gradient-secondary rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Search className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Nenhum medidor encontrado</h3>
              <p className="text-gray-500 text-lg">
                {searchTerm || statusFilter !== "ALL" 
                  ? "Tente ajustar os filtros de busca." 
                  : "Não há medidores cadastrados no sistema."}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
