"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function IntegratedCalendarExport() {
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Mutation para relatório do mês selecionado
  const selectedMonthMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMonthYear) throw new Error('Mês/Ano não selecionado');
      
      const params = new URLSearchParams({
        startDate: selectedMonthYear + '-01',
        endDate: selectedMonthYear + '-31'
      });
      
      const response = await fetch(`/api/admin/salas/consolidated-report/csv?${params}`, {
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
      
      const monthYearStr = selectedMonthYear.replace(/-/g, '');
      const timeStr = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
      link.setAttribute('download', `relatorio_consolidado_${monthYearStr}_${timeStr}.csv`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Resetar seleção
      setSelectedMonthYear("");
      toast.success("Relatório mensal exportado com sucesso!");
    },
    onError: (error) => {
      console.error("Falha ao exportar relatório consolidado", error);
      toast.error("Não foi possível exportar o relatório consolidado.");
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
      
      const response = await fetch(`/api/admin/salas/consolidated-report/csv?${params}`, {
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
      link.setAttribute('download', `relatorio_consolidado_periodo_${startStr}_${endStr}_${timeStr}.csv`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Resetar datas
      setStartDate("");
      setEndDate("");
      toast.success("Relatório por período exportado com sucesso!");
    },
    onError: (error) => {
      console.error("Falha ao exportar relatório consolidado", error);
      toast.error("Não foi possível exportar o relatório consolidado.");
    }
  });

  const handleSelectedMonthExport = () => {
    if (selectedMonthYear) {
      selectedMonthMutation.mutate();
    }
  };

  const handlePeriodExport = () => {
    if (startDate && endDate) {
      periodMutation.mutate();
    }
  };

  const isMonthYearExportDisabled = !selectedMonthYear || selectedMonthMutation.isPending;
  const isPeriodExportDisabled = !startDate || !endDate || periodMutation.isPending;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      {/* Popover para seleção de mês/ano */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="default"
            size="default"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            📊 Relatório Mensal
          </Button>
        </PopoverTrigger>
        <PopoverContent align="center">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none text-gray-900">Relatório Mensal</h4>
              <p className="text-sm text-gray-700">
                Escolha o mês e ano para gerar o relatório consolidado
              </p>
            </div>
            
            {/* Seleção de mês/ano */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Selecionar Mês/Ano:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Seletor de Mês */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-700">Mês:</label>
                  <select
                    value={selectedMonthYear ? new Date(selectedMonthYear + '-01').getMonth() : ''}
                    onChange={(e) => {
                      const month = parseInt(e.target.value);
                      const year = selectedMonthYear ? new Date(selectedMonthYear + '-01').getFullYear() : new Date().getFullYear();
                      setSelectedMonthYear(`${year}-${String(month + 1).padStart(2, '0')}`);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
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
                  <label className="text-xs text-gray-700">Ano:</label>
                  <select
                    value={selectedMonthYear ? new Date(selectedMonthYear + '-01').getFullYear() : ''}
                    onChange={(e) => {
                      const year = parseInt(e.target.value);
                      const month = selectedMonthYear ? new Date(selectedMonthYear + '-01').getMonth() : new Date().getMonth();
                      setSelectedMonthYear(`${year}-${String(month + 1).padStart(2, '0')}`);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
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

            {/* Mês/Ano selecionado */}
            {selectedMonthYear && (
              <div className="p-3 bg-green-50 rounded-md">
                <div className="text-sm font-medium text-gray-900">
                  Mês/Ano Selecionado:
                </div>
                <div className="text-sm text-gray-700">
                  {format(new Date(selectedMonthYear + '-01'), 'MMMM yyyy', { locale: ptBR })}
                </div>
              </div>
            )}
            
            {/* Botões de ação */}
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleSelectedMonthExport} 
                disabled={isMonthYearExportDisabled}
                size="default"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {selectedMonthMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  "📊 Exportar Relatório Mensal"
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setSelectedMonthYear("")}
                size="default"
                className="w-full"
              >
                Limpar Seleção
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Popover para período personalizado */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="default" 
            size="default"
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-lg"
          >
            📅 Relatório Personalizado
          </Button>
        </PopoverTrigger>
        <PopoverContent align="center">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none text-gray-900">Relatório por Período</h4>
              <p className="text-sm text-gray-700">
                Escolha as datas de início e fim para gerar o relatório consolidado personalizado
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Selecionar Período:</label>
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
              <div className="p-3 bg-blue-50 rounded-md">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  Período Selecionado:
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-gray-700">
                    <span className="font-bold">Início:</span> {format(new Date(startDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                  {endDate && (
                    <div className="text-sm text-gray-700">
                      <span className="font-bold">Fim:</span> {format(new Date(endDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  )}
                  {!endDate && (
                    <div className="text-sm text-gray-700 italic">
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
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {periodMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  "📊 Exportar Relatório por Período"
                )}
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
