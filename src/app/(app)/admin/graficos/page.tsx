"use client";

export const dynamic = "force-dynamic";

import { useQuery } from "@tanstack/react-query";
import { getAdminSalas, getLatestReading, getHistoricalData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

import { IntegratedCalendarExport } from "./components/IntegratedCalendarExport";
import { PeriodSelector } from "./components/PeriodSelector";

// Tipos
type Sala = {
  meterId: number;
  name: string;
  status: "ONLINE" | "OFFLINE";
  lastReadingAt: string | null;
  user: { email: string } | null;
};

type LatestReading = {
  pt: number;
  ept_c: number;
  va: number;
  vb: number;
  vc: number;
  pft: number;
  ia: number;
  ib: number;
  ic: number;
  qt: number;
  timestamp: string;
};

type HistoricalReading = {
  pt: number;
  ept_c: number;
  va: number;
  vb: number;
  vc: number;
  pft: number;
  iarms: number;
  ibrms: number;
  icrms: number;
  qt: number;
  timestamp: string;
};

export default function AdminGraficosPage() {
  const [selectedSala, setSelectedSala] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [useCustomRange, setUseCustomRange] = useState<boolean>(false);

  // Buscar lista de salas
  const { data: salas, isLoading: isLoadingSalas } = useQuery<Sala[]>({
    queryKey: ["adminSalas"],
    queryFn: getAdminSalas,
    retry: 0,
  });

  // Filtrar salas baseado no termo de busca
  const filteredSalas = useMemo(() => {
    if (!salas) return [];
    if (!searchTerm.trim()) return salas;
    
    return salas.filter(sala => 
      sala.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sala.meterId.toString().includes(searchTerm) ||
      (sala.user?.email && sala.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [salas, searchTerm]);

  // Buscar dados da sala selecionada
  const selectedMeterId = selectedSala ? parseInt(selectedSala) : null;

  const { data: latestReading, isLoading: isLoadingLatest } = useQuery<LatestReading>({
    queryKey: ["latestReading", selectedMeterId],
    queryFn: () => getLatestReading(selectedMeterId!),
    enabled: !!selectedMeterId,
    retry: 0,
  });

  const { data: historicalData, isLoading: isLoadingHistorical } = useQuery<HistoricalReading[]>({
    queryKey: ["historicalData", selectedMeterId, useCustomRange ? startDate : null, useCustomRange ? startTime : null, useCustomRange ? endDate : null, useCustomRange ? endTime : null],
    queryFn: () => {
      const composeIso = (d: string, t: string) => {
        if (!d && !t) return undefined;
        const date = d || new Date().toISOString().slice(0, 10);
        const time = t || "00:00";
        return new Date(`${date}T${time}:00`).toISOString();
      };
      const params = useCustomRange
        ? {
            dataInicio: composeIso(startDate, startTime),
            dataFim: composeIso(endDate, endTime),
          }
        : undefined;
      return getHistoricalData(selectedMeterId!, params);
    },
    enabled: !!selectedMeterId,
    retry: 0,
  });

  // Funções para controle de período
  function pad2(n: number) { return n.toString().padStart(2, "0"); }
  function toLocalDate(dt: Date) { return `${dt.getFullYear()}-${pad2(dt.getMonth()+1)}-${pad2(dt.getDate())}`; }
  function toLocalTime(dt: Date) { return `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`; }

  function applyPreset(preset: "hoje" | "ontem" | "semana" | "mes") {
    const now = new Date();
    if (preset === "hoje") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      setStartDate(toLocalDate(start));
      setStartTime("00:00");
      setEndDate(toLocalDate(now));
      setEndTime(toLocalTime(now));
      setUseCustomRange(true);
      return;
    }
    if (preset === "ontem") {
      const d = new Date(now);
      d.setDate(now.getDate() - 1);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 0);
      setStartDate(toLocalDate(start));
      setStartTime("00:00");
      setEndDate(toLocalDate(end));
      setEndTime("23:59");
      setUseCustomRange(true);
      return;
    }
    if (preset === "semana") {
      const d = new Date(now);
      const day = d.getDay();
      const diffToMonday = (day === 0 ? 6 : day - 1);
      const monday = new Date(d);
      monday.setDate(d.getDate() - diffToMonday);
      monday.setHours(0, 0, 0, 0);
      setStartDate(toLocalDate(monday));
      setStartTime("00:00");
      setEndDate(toLocalDate(now));
      setEndTime(toLocalTime(now));
      setUseCustomRange(true);
      return;
    }
    if (preset === "mes") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      setStartDate(toLocalDate(start));
      setStartTime("00:00");
      setEndDate(toLocalDate(now));
      setEndTime(toLocalTime(now));
      setUseCustomRange(true);
      return;
    }
  }

  // Calcular tensão média
  const averageVoltageLatest = latestReading
    ? ((latestReading.va + latestReading.vb + latestReading.vc) / 3).toFixed(2)
    : "—";

  // Preparar dados para gráficos
  const chartData = useMemo(() => {
    if (!historicalData) return [];
    
    let filteredData = historicalData;
    
    // Aplicar filtro de período se estiver ativo
    if (useCustomRange && startDate && endDate && startTime && endTime) {
      const startDateTime = new Date(`${startDate}T${startTime}:00`);
      const endDateTime = new Date(`${endDate}T${endTime}:00`);
      
      filteredData = historicalData.filter(reading => {
        const readingTime = new Date(reading.timestamp);
        return readingTime >= startDateTime && readingTime <= endDateTime;
      });
    }
    
    return filteredData.map((reading) => ({
      time: new Date(reading.timestamp).toLocaleTimeString("pt-BR", { 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
      pt: reading.pt,
      tensaoMedia: (reading.va + reading.vb + reading.vc) / 3,
      pft: reading.pft,
      ia: reading.iarms,
      ib: reading.ibrms,
      ic: reading.icrms,
      qt: reading.qt,
      timestamp: reading.timestamp,
    }));
  }, [historicalData, useCustomRange, startDate, endDate, startTime, endTime]);

  // Cores para os gráficos
  const chartColors = {
    pt: "#3b82f6",      // Azul
    tensaoMedia: "#10b981", // Verde
    pft: "#f59e0b",     // Amarelo
    ia: "#8b5cf6",      // Roxo
    ib: "#06b6d4",      // Ciano
    ic: "#f97316",      // Laranja
    qt: "#ef4444",      // Vermelho
  };

  if (isLoadingSalas) {
    return <div className="p-4">Carregando salas...</div>;
  }

  const selectedSalaInfo = salas?.find(sala => sala.meterId.toString() === selectedSala);

  return (
    <div className="space-y-4 overflow-x-hidden flex flex-col items-center w-full">
      <div className="flex flex-col items-center gap-4 w-full max-w-5xl px-4">
        
        {/* Cabeçalho */}
        <div className="flex flex-col items-center gap-2 w-full">
          <h1 className="text-3xl font-bold text-white text-center">
            Gráficos das Salas
          </h1>
          
          {/* Botões de Exportação Integrados */}
          <div className="w-full flex justify-center mb-4">
            <IntegratedCalendarExport />
          </div>
          
          {/* Campo de Busca */}
          <div className="w-full max-w-md">
            <Input
              type="text"
              placeholder="Buscar por nome da sala, ID ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Seletor de Sala */}
          <div className="w-full max-w-md">
            <Select value={selectedSala} onValueChange={setSelectedSala}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma sala para visualizar" />
              </SelectTrigger>
              <SelectContent>
                {filteredSalas.map((sala) => (
                  <SelectItem key={sala.meterId} value={sala.meterId.toString()}>
                    {sala.name} (ID: {sala.meterId}) - {sala.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seletor de Período para Gráficos */}
          {selectedSala && (
            <div className="w-full flex justify-center">
              <PeriodSelector
                startDate={startDate}
                setStartDate={setStartDate}
                startTime={startTime}
                setStartTime={setStartTime}
                endDate={endDate}
                setEndDate={setEndDate}
                endTime={endTime}
                setEndTime={setEndTime}
                useCustomRange={useCustomRange}
                setUseCustomRange={setUseCustomRange}
                onApplyPreset={applyPreset}
                onClear={() => { setStartDate(""); setStartTime(""); setEndDate(""); setEndTime(""); setUseCustomRange(false); }}
              />
            </div>
          )}

          {/* Informações da Sala Selecionada */}
          {selectedSalaInfo && (
            <div className="text-lg text-white text-center">
              <div className="font-medium">
                Sala: {selectedSalaInfo.name}
              </div>
              <div className="text-sm">
                Status: <span className={selectedSalaInfo.status === 'ONLINE' ? 'text-green-400' : 'text-red-400'}>
                  {selectedSalaInfo.status}
                </span>
                {selectedSalaInfo.user && (
                  <span className="ml-4">
                    Usuário: {selectedSalaInfo.user.email}
                  </span>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Conteúdo baseado na seleção */}
        {!selectedSala ? (
          <Card className="w-full">
            <CardContent className="p-8">
              <div className="text-center text-neutral-600">
                Selecione uma sala para visualizar os gráficos e dados em tempo real.
              </div>
            </CardContent>
          </Card>
        ) : isLoadingLatest || isLoadingHistorical ? (
          <Card className="w-full">
            <CardContent className="p-8">
              <div className="text-center text-neutral-600">
                Carregando dados da sala...
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Cards de KPIs */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 w-full">
              <Card className="shadow-lg border-l-4 border-l-blue-500 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-black flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Potência Ativa Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {latestReading ? latestReading.pt.toFixed(2) : "—"}
                  </div>
                  <div className="text-sm text-black mt-1">
                    {latestReading ? "Watts" : ""}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-l-4 border-l-green-500 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-black flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Consumo Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {latestReading ? latestReading.ept_c.toFixed(2) : "—"}
                  </div>
                  <div className="text-sm text-black mt-1">
                    {latestReading ? "kWh" : ""}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-l-4 border-l-purple-500 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-black flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    Tensão Média
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {averageVoltageLatest}
                  </div>
                  <div className="text-sm text-black mt-1">
                    {averageVoltageLatest !== "—" ? "Volts" : ""}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-l-4 border-l-orange-500 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-black flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    Fator de Potência
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {latestReading ? latestReading.pft.toFixed(2) : "—"}
                  </div>
                  <div className="text-sm text-black mt-1">
                    {latestReading ? "Cos φ" : ""}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid gap-6 md:grid-cols-2 w-full">
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                  <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    Histórico de Potência (PT)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="pt" 
                        stroke={chartColors.pt} 
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 4, stroke: chartColors.pt, strokeWidth: 1 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
                  <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    Tensão Média e Fator de Potência
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{
                          paddingTop: '10px',
                          fontSize: '12px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="tensaoMedia" 
                        stroke={chartColors.tensaoMedia} 
                        strokeWidth={1.5}
                        name="Tensão Média (V)"
                        dot={false}
                        activeDot={{ r: 4, stroke: chartColors.tensaoMedia, strokeWidth: 1 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="pft" 
                        stroke={chartColors.pft} 
                        strokeWidth={1.5}
                        name="Fator de Potência"
                        dot={false}
                        activeDot={{ r: 4, stroke: chartColors.pft, strokeWidth: 1 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
                  <CardTitle className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    Correntes RMS (A)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{
                          paddingTop: '10px',
                          fontSize: '12px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ia" 
                        stroke={chartColors.ia} 
                        strokeWidth={1.5}
                        name="Ia (A)"
                        dot={false}
                        activeDot={{ r: 4, stroke: chartColors.ia, strokeWidth: 1 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ib" 
                        stroke={chartColors.ib} 
                        strokeWidth={1.5}
                        name="Ib (A)"
                        dot={false}
                        activeDot={{ r: 4, stroke: chartColors.ib, strokeWidth: 1 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ic" 
                        stroke={chartColors.ic} 
                        strokeWidth={1.5}
                        name="Ic (A)"
                        dot={false}
                        activeDot={{ r: 4, stroke: chartColors.ic, strokeWidth: 1 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b">
                  <CardTitle className="text-lg font-semibold text-black flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    Potência Reativa Total (VAr)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="qt" 
                        stroke={chartColors.qt} 
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 4, stroke: chartColors.qt, strokeWidth: 1 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
