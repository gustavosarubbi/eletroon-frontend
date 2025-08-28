"use client";

import * as React from "react";
import { Button } from "../../../../components/ui/button";
import { Calendar } from "../../../../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../components/ui/popover";
import { Input } from "../../../../components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, X } from "lucide-react";

interface PeriodSelectorProps {
  startDate: string;
  setStartDate: (date: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  useCustomRange: boolean;
  setUseCustomRange: (use: boolean) => void;
  onApplyPreset: (preset: "hoje" | "ontem" | "semana") => void;
  onClear: () => void;
}

export function PeriodSelector({
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  endDate,
  setEndDate,
  endTime,
  setEndTime,
  useCustomRange,
  setUseCustomRange,
  onApplyPreset,
  onClear
}: PeriodSelectorProps) {




  const handleClear = () => {
    onClear();
  };

  const isPeriodComplete = startDate && endDate && startTime && endTime;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          className="h-8 px-3 py-1 text-sm" 
          variant={useCustomRange ? "default" : "outline"}
          onClick={() => {}}
        >
          📅 Período Personalizado
          {useCustomRange && (startDate || endDate) && (
            <span className="ml-1 text-xs">
              {startDate && endDate ? `${startDate} → ${endDate}` : "Configurando..."}
            </span>
          )}
        </Button>
      </PopoverTrigger>
              <PopoverContent align="end">
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none text-gray-900">Período Personalizado</h4>
            <p className="text-sm text-gray-700">
              Escolha as datas e horários para visualizar os gráficos
            </p>
          </div>

          {/* Atalhos rápidos */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">Atalhos Rápidos:</div>
            <div className="flex flex-wrap gap-2">
              <Button 
                className="h-7 px-2 py-1 text-xs" 
                variant="outline" 
                onClick={() => onApplyPreset("hoje")}
              >
                Hoje
              </Button>
              <Button 
                className="h-7 px-2 py-1 text-xs" 
                variant="outline" 
                onClick={() => onApplyPreset("ontem")}
              >
                Ontem
              </Button>
              <Button 
                className="h-7 px-2 py-1 text-xs" 
                variant="outline" 
                onClick={() => onApplyPreset("semana")}
              >
                Esta Semana
              </Button>
            </div>
          </div>

          {/* Calendário único */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">Selecionar Período:</div>
            <Calendar
              startDate={startDate}
              endDate={endDate}
              onSelect={(date) => {
                if (!date) return;
                const dateStr = format(date, 'yyyy-MM-dd');
                
                if (!startDate) {
                  setStartDate(dateStr);
                  setEndDate("");
                } else if (!endDate) {
                  if (new Date(dateStr) >= new Date(startDate)) {
                    setEndDate(dateStr);
                  } else {
                    setEndDate(startDate);
                    setStartDate(dateStr);
                  }
                } else {
                  setStartDate(dateStr);
                  setEndDate("");
                }
                setUseCustomRange(true);
              }}
            />
          </div>

          {/* Seleção de horários */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">Horários:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Horário Início:
                </label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => { setStartTime(e.target.value); setUseCustomRange(true); }}
                  className="w-full h-10"
                  placeholder="00:00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Horário Fim:
                </label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => { setEndTime(e.target.value); setUseCustomRange(true); }}
                  className="w-full h-10"
                  placeholder="23:59"
                />
              </div>
            </div>
          </div>

          {/* Resumo do período selecionado */}
          {startDate && (
            <div className="p-3 bg-blue-50 rounded-md">
              <div className="text-sm font-medium text-gray-900 mb-2">
                Período Selecionado:
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-700">
                  <span className="font-bold">Início:</span> {format(new Date(startDate), 'dd/MM/yyyy', { locale: ptBR })} às {startTime || "00:00"}
                </div>
                {endDate && (
                  <div className="text-sm text-gray-700">
                    <span className="font-bold">Fim:</span> {format(new Date(endDate), 'dd/MM/yyyy', { locale: ptBR })} às {endTime || "23:59"}
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
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleClear}
              variant="outline" 
              size="default"
              className="flex-1"
              disabled={!startDate && !endDate}
            >
              <X className="w-4 h-4 mr-1" />
              Limpar
            </Button>
            <Button 
              onClick={() => {}}
              size="default"
              className="flex-1"
              disabled={!isPeriodComplete}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
