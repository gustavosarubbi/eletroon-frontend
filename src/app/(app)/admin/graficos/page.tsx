"use client";

export const dynamic = "force-dynamic";

import { useQuery } from "@tanstack/react-query";
import { getAdminSalas, getLatestReading, getHistoricalData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

import { IntegratedCalendarExport } from "./components/IntegratedCalendarExport";
import { PeriodSelector } from "./components/PeriodSelector";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const { data: salas, isLoading: isLoadingSalas, isError: isErrorSalas } = useQuery<Sala[]>({
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
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isErrorSalas) {
    return (
      <div className="p-4 text-red-500 text-center">
        Ocorreu um erro ao carregar as salas.
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="ml-2"
        >
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const selectedSalaInfo = salas?.find(sala => sala.meterId.toString() === selectedSala);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho Principal */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-2">
            Gráficos das Salas
          </h1>
          <p className="text-gray-600 text-center">
            Visualize dados em tempo real e histórico das salas monitoradas
          </p>
        </div>

        {/* Seção de Controles */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
            
            {/* Campo de Busca */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Buscar Sala</label>
              <Input
                type="text"
                placeholder="Nome da sala, ID ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11"
              />
            </div>

            {/* Seletor de Sala */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Selecionar Sala</label>
              <Select 
                value={selectedSala} 
                onChange={(e) => setSelectedSala(e.target.value)}
                className="w-full h-11"
              >
                <option value="">Escolha uma sala para visualizar</option>
                {filteredSalas.map((sala) => (
                  <option key={sala.meterId} value={sala.meterId.toString()}>
                    {sala.name} (ID: {sala.meterId}) - {sala.status}
                  </option>
                ))}
              </Select>
            </div>

            {/* Botões de Exportação */}
            {selectedSala && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Exportar Dados</label>
                <div className="flex justify-center">
                  <IntegratedCalendarExport />
                </div>
              </div>
            )}
          </div>

          {/* Informações da Sala Selecionada */}
          {selectedSalaInfo && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedSalaInfo.name}
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-1">
                    <span className="text-sm text-gray-600">
                      Status: 
                      <Badge 
                        variant={selectedSalaInfo.status === "ONLINE" ? "success" : "destructive"} 
                        className="ml-1 flex items-center gap-1 w-fit"
                      >
                        <div className={`w-2 h-2 rounded-full ${selectedSalaInfo.status === "ONLINE" ? "bg-green-500" : "bg-red-500"}`}></div>
                        {selectedSalaInfo.status}
                      </Badge>
                    </span>
                    {selectedSalaInfo.user && (
                      <span className="text-sm text-gray-600">
                        Usuário: <span className="font-medium text-gray-900">{selectedSalaInfo.user.email}</span>
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Seletor de Período */}
                <div className="flex justify-center sm:justify-end">
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
              </div>
            </div>
          )}
        </div>

        {/* Conteúdo baseado na seleção */}
        {!selectedSala ? (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecione uma Sala</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Escolha uma sala da lista acima para visualizar os gráficos e dados em tempo real.
              </p>
            </div>
          </div>
        ) : isLoadingLatest || isLoadingHistorical ? (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Carregando dados da sala...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cards de KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                    Potência Ativa Total
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-blue-700 mb-1">
                    {latestReading ? latestReading.pt.toFixed(2) : "—"}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">
                    {latestReading ? "Watts" : ""}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-green-900 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                    Consumo Total
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-green-700 mb-1">
                    {latestReading ? latestReading.ept_c.toFixed(2) : "—"}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    {latestReading ? "kWh" : ""}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500 shadow-sm"></div>
                    Tensão Média
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-purple-700 mb-1">
                    {averageVoltageLatest}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">
                    {averageVoltageLatest !== "—" ? "Volts" : ""}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-orange-900 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div>
                    Fator de Potência
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-orange-700 mb-1">
                    {latestReading ? latestReading.pft.toFixed(2) : "—"}
                  </div>
                  <div className="text-sm text-orange-600 font-medium">
                    {latestReading ? "Cos φ" : ""}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <Card className="bg-white border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                  <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></div>
                    Histórico de Potência (PT)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#6b7280"
                        fontSize={11}
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

              <Card className="bg-white border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                  <CardTitle className="text-lg font-semibold text-green-900 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
                    Tensão Média e Fator de Potência
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#6b7280"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={11}
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
                          fontSize: '11px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="tensaoMedia" 
                        stroke={chartColors.tensaoMedia} 
                        strokeWidth={2}
                        name="Tensão Média (V)"
                        dot={false}
                        activeDot={{ r: 5, stroke: chartColors.tensaoMedia, strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="pft" 
                        stroke={chartColors.pft} 
                        strokeWidth={2}
                        name="Fator de Potência"
                        dot={false}
                        activeDot={{ r: 5, stroke: chartColors.pft, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                  <CardTitle className="text-lg font-semibold text-purple-900 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-purple-500 shadow-sm"></div>
                    Correntes RMS (A)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#6b7280"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={11}
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
                          fontSize: '11px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ia" 
                        stroke={chartColors.ia} 
                        strokeWidth={2}
                        name="Ia (A)"
                        dot={false}
                        activeDot={{ r: 5, stroke: chartColors.ia, strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ib" 
                        stroke={chartColors.ib} 
                        strokeWidth={2}
                        name="Ib (A)"
                        dot={false}
                        activeDot={{ r: 5, stroke: chartColors.ib, strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="ic" 
                        stroke={chartColors.ic} 
                        strokeWidth={2}
                        name="Ic (A)"
                        dot={false}
                        activeDot={{ r: 5, stroke: chartColors.ic, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
                  <CardTitle className="text-lg font-semibold text-red-900 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
                    Potência Reativa Total (VAr)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#6b7280"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        fontSize={11}
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
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5, stroke: chartColors.qt, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
