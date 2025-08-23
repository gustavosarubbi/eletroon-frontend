"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";

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
    },
    onError: (error) => {
      console.error("Falha ao exportar relatório mensal", error);
      alert("Não foi possível exportar o relatório mensal.");
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
    },
    onError: (error) => {
      console.error("Falha ao exportar relatório por período", error);
      alert("Não foi possível exportar o relatório por período.");
    }
  });

  const handleMonthExport = () => {
    if (selectedMonth) {
      monthlyMutation.mutate();
    }
  };

  const handlePeriodExport = () => {
    if (startDate && endDate) {
      periodMutation.mutate();
    }
  };

  const isExportDisabled = !selectedMonth || monthlyMutation.isPending;
  const isPeriodExportDisabled = !startDate || !endDate || periodMutation.isPending;

  // Gerar lista de meses disponíveis (últimos 12 meses)
  const availableMonths = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, 'yyyy-MM');
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      {/* Popover para relatório mensal */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="default"
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          >
            📅 Relatório Mensal
          </Button>
        </PopoverTrigger>
        <PopoverContent align="center">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Relatório Mensal</h4>
              <p className="text-sm text-muted-foreground">
                Escolha o mês para gerar o relatório completo
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecionar Mês/Ano:</label>
              <div className="grid grid-cols-2 gap-4">
                {/* Seletor de Mês */}
                <div className="space-y-2">
                  <label className="text-xs text-black">Mês:</label>
                  <select
                    value={selectedMonth ? new Date(selectedMonth + '-01').getMonth() : ''}
                    onChange={(e) => {
                      const month = parseInt(e.target.value);
                      const year = selectedMonth ? new Date(selectedMonth + '-01').getFullYear() : new Date().getFullYear();
                      setSelectedMonth(`${year}-${String(month + 1).padStart(2, '0')}`);
                    }}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="">Selecione</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>
                        {format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Seletor de Ano */}
                <div className="space-y-2">
                  <label className="text-xs text-black">Ano:</label>
                  <select
                    value={selectedMonth ? new Date(selectedMonth + '-01').getFullYear() : ''}
                    onChange={(e) => {
                      const year = parseInt(e.target.value);
                      const month = selectedMonth ? new Date(selectedMonth + '-01').getMonth() : new Date().getMonth();
                      setSelectedMonth(`${year}-${String(month + 1).padStart(2, '0')}`);
                    }}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="">Selecione</option>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            {/* Mês selecionado */}
            {selectedMonth && (
              <div className="p-3 bg-blue-50 rounded-md">
                <div className="text-sm font-medium text-black">
                  Mês Selecionado:
                </div>
                <div className="text-sm text-black">
                  {format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: ptBR })}
                </div>
              </div>
            )}
            
            {/* Botões de ação */}
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleMonthExport} 
                disabled={isExportDisabled}
                size="default"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {monthlyMutation.isPending ? "Gerando..." : "📊 Gerar Relatório Mensal"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setSelectedMonth("")}
                size="default"
                className="w-full"
              >
                Limpar Seleção
              </Button>
            </div>

            {/* Atalhos para meses recentes */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-black">Meses Recentes:</div>
              <div className="grid grid-cols-2 gap-2">
                {availableMonths.slice(0, 6).map((month) => (
                  <Button
                    key={month}
                    variant="outline"
                    size="default"
                    onClick={() => setSelectedMonth(month)}
                    className="text-xs"
                  >
                    {format(new Date(month + '-01'), 'MMM yyyy', { locale: ptBR })}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Popover para período personalizado */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="default"
            className="bg-green-600 hover:bg-green-700 text-white border-green-600"
          >
            📊 Relatório Personalizado
          </Button>
        </PopoverTrigger>
        <PopoverContent align="center">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none text-black">Relatório Personalizado</h4>
              <p className="text-sm text-black">
                Escolha as datas de início e fim para gerar seu relatório personalizado
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecionar Período:</label>
              <Calendar
                startDate={startDate}
                endDate={endDate}
                onSelect={(date) => {
                  if (!startDate) {
                    // Primeira seleção: definir data inicial
                    setStartDate(date);
                    setEndDate(""); // Resetar data final
                  } else if (!endDate) {
                    // Segunda seleção: definir data final
                    if (new Date(date) >= new Date(startDate)) {
                      setEndDate(date);
                    } else {
                      // Se a data final for menor que a inicial, trocar
                      setEndDate(startDate);
                      setStartDate(date);
                    }
                  } else {
                    // Terceira seleção: resetar e começar novo período
                    setStartDate(date);
                    setEndDate("");
                  }
                }}

              />
            </div>

            {/* Informações do período selecionado */}
            {startDate && (
              <div className="p-3 bg-green-50 rounded-md">
                <div className="text-sm font-medium text-black mb-2">
                  Período do Relatório:
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-black">
                    <span className="font-bold">Início:</span> {format(new Date(startDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                  {endDate && (
                    <div className="text-sm text-black">
                      <span className="font-bold">Fim:</span> {format(new Date(endDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  )}
                  {!endDate && (
                    <div className="text-sm text-black italic">
                      Clique em outra data para definir o fim do período
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Botões de ação */}
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handlePeriodExport} 
                disabled={isPeriodExportDisabled}
                size="default"
                className={`w-full ${
                  isPeriodExportDisabled 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {periodMutation.isPending ? "Gerando..." : "📊 Gerar Relatório Personalizado"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                size="default"
                className="w-full"
                disabled={!startDate && !endDate}
              >
                Limpar Período
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
