"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Calendar } from "../../../../components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "../../../../components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "../../../../contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Calendar as CalendarIcon, Download, FileText, BarChart3, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function MonthlyReport() {
  const { user } = useAuth();
  const meterId = user?.meterId;
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Mutation para relatório mensal
  const monthlyMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMonth) throw new Error('Mês não selecionado');
      
      const params = new URLSearchParams({
        startDate: selectedMonth + '-01',
        endDate: selectedMonth + '-31'
      });
      
      const response = await fetch(`/api/eletroon/${meterId}/export/csv?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eletroon_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Falha na exportação');
      return response.blob();
    },
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      
      const monthStr = selectedMonth.replace(/-/g, '');
      const timeStr = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
      link.setAttribute('download', `relatorio_mensal_medidor_${meterId}_${monthStr}_${timeStr}.csv`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Resetar seleção
      setSelectedMonth("");
      toast.success("Relatório mensal exportado com sucesso!");
    },
    onError: (error) => {
      console.error("Falha ao exportar relatório mensal", error);
      toast.error("Não foi possível exportar o relatório mensal.");
    }
  });

  // Mutation para período personalizado
  const periodMutation = useMutation({
    mutationFn: async () => {
      if (!startDate || !endDate) throw new Error('Datas não selecionadas');
      
      const params = new URLSearchParams({
        startDate: startDate,
        endDate: endDate
      });
      
      const response = await fetch(`/api/eletroon/${meterId}/export/csv?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eletroon_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Falha na exportação');
      return response.blob();
    },
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      
      const startStr = startDate.replace(/-/g, '');
      const endStr = endDate.replace(/-/g, '');
      const timeStr = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
      link.setAttribute('download', `relatorio_periodo_medidor_${meterId}_${startStr}_${endStr}_${timeStr}.csv`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Resetar datas
      setStartDate("");
      setEndDate("");
      toast.success("Relatório de período exportado com sucesso!");
    },
    onError: (error) => {
      console.error("Falha ao exportar relatório de período", error);
      toast.error("Não foi possível exportar o relatório de período.");
    }
  });



  const isMonthlyDisabled = !selectedMonth || monthlyMutation.isPending;
  const isPeriodDisabled = !startDate || !endDate || periodMutation.isPending;

  return (
    <motion.div 
      className="glass-effect rounded-3xl p-8 border-0 shadow-2xl backdrop-blur-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-8">
        <motion.div 
          className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-2xl mb-4 shadow-lg"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <BarChart3 className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Relatórios Avançados</h2>
        <p className="text-gray-600 font-medium">Exporte dados detalhados para análise</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Relatório Mensal */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-100 shadow-lg"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center shadow-md">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Relatório Mensal</h3>
              <p className="text-sm text-gray-600">Exporte dados de um mês específico</p>
            </div>
          </div>

          <div className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-2 border-gray-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-300 shadow-sm"
                  >
                    <CalendarIcon className="mr-3 h-5 w-5 text-blue-500" />
                    {selectedMonth ? (
                      format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: ptBR })
                    ) : (
                      <span className="text-gray-500">Selecione o mês</span>
                    )}
                  </Button>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  startDate={selectedMonth ? selectedMonth + '-01' : undefined}
                  endDate={selectedMonth ? selectedMonth + '-31' : undefined}
                  onSelect={(dateStr) => {
                    const date = new Date(dateStr);
                    const monthStr = format(date, 'yyyy-MM');
                    setSelectedMonth(monthStr);
                  }}
                />
              </PopoverContent>
            </Popover>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => monthlyMutation.mutate()}
                disabled={isMonthlyDisabled}
                className="w-full h-12 button-gradient-animate text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {monthlyMutation.isPending ? (
                  <motion.div 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Exportando...</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Download className="w-5 h-5" />
                    <span>Exportar CSV</span>
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Relatório de Período */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-100 shadow-lg"
          whileHover={{ scale: 1.02, y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 gradient-success rounded-xl flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Período Personalizado</h3>
              <p className="text-sm text-gray-600">Exporte dados de um período específico</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all duration-300"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                      {startDate ? (
                        format(new Date(startDate), 'dd/MM/yyyy')
                      ) : (
                        <span className="text-gray-500 text-sm">Início</span>
                      )}
                    </Button>
                  </motion.div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    startDate={startDate}
                    endDate={endDate}
                    onSelect={(dateStr) => setStartDate(dateStr)}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all duration-300"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                      {endDate ? (
                        format(new Date(endDate), 'dd/MM/yyyy')
                      ) : (
                        <span className="text-gray-500 text-sm">Fim</span>
                      )}
                    </Button>
                  </motion.div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    startDate={startDate}
                    endDate={endDate}
                    onSelect={(dateStr) => setEndDate(dateStr)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => periodMutation.mutate()}
                disabled={isPeriodDisabled}
                className="w-full h-12 button-gradient-animate text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {periodMutation.isPending ? (
                  <motion.div 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Exportando...</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Download className="w-5 h-5" />
                    <span>Exportar CSV</span>
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer Info */}
      <motion.div 
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>Relatórios em formato CSV para análise avançada</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
