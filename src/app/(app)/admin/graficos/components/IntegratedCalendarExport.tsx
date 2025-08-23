"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMutation } from "@tanstack/react-query";

export function IntegratedCalendarExport() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>("");


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
      
      // Resetar seleção e fechar popover
                   setSelectedMonthYear("");
    },
    onError: (error) => {
      console.error("Falha ao exportar relatório consolidado", error);
      alert("Não foi possível exportar o relatório consolidado.");
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
      
      const startStr = startDate!.replace(/-/g, '');
      const endStr = endDate!.replace(/-/g, '');
      const timeStr = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
      link.setAttribute('download', `relatorio_consolidado_periodo_${startStr}_${endStr}_${timeStr}.csv`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Resetar datas
      setStartDate("");
      setEndDate("");
    },
    onError: (error) => {
      console.error("Falha ao exportar relatório consolidado", error);
      alert("Não foi possível exportar o relatório consolidado.");
    }
  });

  const handlePeriodExport = () => {
    if (startDate && endDate) {
      periodMutation.mutate();
    }
  };

  const handleSelectedMonthExport = () => {
    if (selectedMonthYear) {
      selectedMonthMutation.mutate();
    }
  };

  const isPeriodExportDisabled = !startDate || !endDate || periodMutation.isPending;
  const isMonthYearExportDisabled = !selectedMonthYear || selectedMonthMutation.isPending;

  // Gerar lista de meses disponíveis (últimos 24 meses)
  const availableMonths = Array.from({ length: 24 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, 'yyyy-MM');
  });

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center">
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
              <h4 className="font-medium leading-none">Relatório Mensal</h4>
              <p className="text-sm text-muted-foreground">
                Escolha o mês e ano para gerar o relatório consolidado
              </p>
            </div>
            
            {/* Seleção de mês/ano */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecionar Mês/Ano:</label>
              <Calendar
                startDate={selectedMonthYear}
                endDate={selectedMonthYear}
                onSelect={(date) => {
                  if (date) {
                    const monthYearStr = format(new Date(date), 'yyyy-MM');
                    setSelectedMonthYear(monthYearStr);
                  }
                }}
              />
            </div>

            {/* Mês/Ano selecionado */}
            {selectedMonthYear && (
              <div className="p-3 bg-green-50 rounded-md">
                <div className="text-sm font-medium text-black">
                  Mês/Ano Selecionado:
                </div>
                <div className="text-sm text-black">
                  {format(new Date(selectedMonthYear + '-01'), 'MMMM yyyy', { locale: ptBR })}
                </div>
              </div>
            )}
            
            {/* Atalhos para meses recentes */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-black">Meses Recentes:</div>
              <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {availableMonths.slice(0, 12).map((month) => (
                  <Button
                    key={month}
                    variant="outline"
                    size="default"
                    onClick={() => setSelectedMonthYear(month)}
                    className="text-xs"
                  >
                    {format(new Date(month + '-01'), 'MMM yyyy', { locale: ptBR })}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleSelectedMonthExport} 
                disabled={isMonthYearExportDisabled}
                size="default"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {selectedMonthMutation.isPending ? "Exportando..." : "📊 Exportar Relatório Mensal"}
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

      {/* Popover com calendário integrado */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="default"
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          >
            📅 Período Personalizado
          </Button>
        </PopoverTrigger>
        <PopoverContent align="center">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Relatório por Período</h4>
              <p className="text-sm text-muted-foreground">
                Escolha as datas de início e fim do período
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
              <div className="p-3 bg-blue-50 rounded-md">
                <div className="text-sm font-medium text-black mb-2">
                  Período Selecionado:
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
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {periodMutation.isPending ? "Exportando..." : "📊 Exportar Relatório do Período"}
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
