"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getHistoricalData, getLatestReading, getSalaInfo } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { MonthlyReport } from "./components/MonthlyReport";
import { PeriodSelector } from "./components/PeriodSelector";

type HistoricalReading = {
  timestamp: string;
  pt: number;
  ept_c: number;
  uarms: number;
  ubrms: number;
  ucrms: number;
  pft: number;
  iarms: number;
  ibrms: number;
  icrms: number;
  qt: number;
};

type Period = "1h" | "24h" | "7d";

export default function UserDashboardPage() {
  const { user } = useAuth();
  const meterId = user?.meterId;
  const [period, setPeriod] = useState<Period>("24h");
  const [startDate, setStartDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [useCustomRange, setUseCustomRange] = useState<boolean>(false);

  const { data: latestReading, isLoading: isLoadingLatest, isError: isErrorLatest } = useQuery({
    queryKey: ["latestReading", meterId],
    queryFn: () => getLatestReading(meterId!),
    enabled: !!meterId,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const { data: salaInfo } = useQuery({
    queryKey: ["salaInfo", meterId],
    queryFn: () => getSalaInfo(meterId!),
    enabled: !!meterId,
  });

  const { data: historicalData } = useQuery({
    queryKey: [
      "historicalData",
      meterId,
      useCustomRange ? startDate : null,
      useCustomRange ? startTime : null,
      useCustomRange ? endDate : null,
      useCustomRange ? endTime : null,
    ],
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
      return getHistoricalData(meterId!, params);
    },
    enabled: !!meterId,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const filtered = useMemo(() => {
    const all = (Array.isArray(historicalData) ? (historicalData as HistoricalReading[]) : [])
      .slice()
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    if (useCustomRange) return all;
    const now = Date.now();
    const cutoff = period === "1h" ? now - 60 * 60 * 1000 : period === "24h" ? now - 24 * 60 * 60 * 1000 : now - 7 * 24 * 60 * 60 * 1000;
    return all.filter((r) => new Date(r.timestamp).getTime() >= cutoff);
  }, [historicalData, period, useCustomRange]);

  const seriesPT = filtered.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    pt: r.pt,
  }));

  const seriesVoltagePF = filtered.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    vavg: (r.uarms + r.ubrms + r.ucrms) / 3,
    pft: r.pft,
  }));

  const seriesCurrents = filtered.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    ia: r.iarms,
    ib: r.ibrms,
    ic: r.icrms,
  }));

  const seriesQT = filtered.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    qt: r.qt,
  }));

  // Relatório: consumo no período pela diferença do acumulado (ept_c)
  const report = useMemo(() => {
    if (filtered.length < 2) return { consumptionKWh: 0 };
    const start = filtered[0].ept_c;
    const end = filtered[filtered.length - 1].ept_c;
    const consumptionKWh = Math.max(0, end - start);
    return { consumptionKWh };
  }, [filtered]);

  if (isLoadingLatest) {
    return <div>Carregando dashboard...</div>;
  }

  const lastTimestamp = latestReading ? new Date(latestReading.timestamp).getTime() : 0;
  const isOnline = latestReading ? Date.now() - lastTimestamp <= 2 * 60 * 1000 : false;
  const averageVoltageLatest = latestReading
    ? ((latestReading.uarms + latestReading.ubrms + latestReading.ucrms) / 3).toFixed(2)
    : "—";

  function pad2(n: number) { return n.toString().padStart(2, "0"); }
  function toLocalDate(dt: Date) { return `${dt.getFullYear()}-${pad2(dt.getMonth()+1)}-${pad2(dt.getDate())}`; }
  function toLocalTime(dt: Date) { return `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`; }

  function applyPreset(preset: "hoje" | "ontem" | "semana") {
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
    // semana (segunda-feira até agora)
    if (preset === "semana") {
      const d = new Date(now);
      const day = d.getDay(); // 0 domingo
      const diffToMonday = (day === 0 ? 6 : day - 1);
      const monday = new Date(d);
      monday.setDate(d.getDate() - diffToMonday);
      monday.setHours(0, 0, 0, 0);
      setStartDate(toLocalDate(monday));
      setStartTime("00:00");
      setEndDate(toLocalDate(now));
      setEndTime(toLocalTime(now));
      setUseCustomRange(true);
    }
  }

  const periodLabel = useCustomRange
    ? (() => {
        const buildIso = (d: string, t: string) => {
          const date = d || new Date().toISOString().slice(0, 10);
          const time = t || "00:00";
          return new Date(`${date}T${time}:00`).toLocaleString("pt-BR");
        };
        const startLabel = (startDate || startTime) ? buildIso(startDate, startTime) : "(início livre)";
        const endLabel = (endDate || endTime) ? buildIso(endDate, endTime) : "(fim livre)";
        return `${startLabel} → ${endLabel}`;
      })()
    : period === "1h"
    ? "Última hora"
    : period === "24h"
    ? "Últimas 24 horas"
    : "Últimos 7 dias";

    return (
    <div className="space-y-4 overflow-x-hidden flex flex-col items-center w-full">
      <div className="flex flex-col items-center gap-4 w-full max-w-5xl px-4">
         <div className="flex flex-col items-center gap-2">
           {salaInfo && (
             <>
               <div className="flex flex-col items-center gap-4">
                 <h1 className="text-3xl font-bold text-white text-center">
                   {salaInfo.name}
                 </h1>
                 {salaInfo.user && (
                   <div className="text-base text-white text-center">
                     <span className="font-medium">Usuário:</span> {salaInfo.user.email}
                   </div>
                 )}
                 <MonthlyReport />
               </div>
             </>
           )}
         </div>
         
         <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge variant={isOnline ? "default" : "destructive"}>{isOnline ? "ONLINE" : "OFFLINE"}</Badge>
          <div className="text-xs text-black dark:text-neutral-300">
            {latestReading ? `Última leitura: ${new Date(latestReading.timestamp).toLocaleString("pt-BR")}` : "Sem leituras"}
          </div>
          <div className="w-px h-5 bg-neutral-200" />
          <div className="flex gap-2">
            <Button
              className="h-8 px-3 py-1 text-sm"
              variant={period === "1h" && !useCustomRange ? "default" : "outline"}
              onClick={() => {
                setPeriod("1h");
                setUseCustomRange(false);
              }}
            >
              Última hora
            </Button>
            <Button
              className="h-8 px-3 py-1 text-sm"
              variant={period === "24h" && !useCustomRange ? "default" : "outline"}
              onClick={() => {
                setPeriod("24h");
                setUseCustomRange(false);
              }}
            >
              24 horas
            </Button>
            <Button
              className="h-8 px-3 py-1 text-sm"
              variant={period === "7d" && !useCustomRange ? "default" : "outline"}
              onClick={() => {
                setPeriod("7d");
                setUseCustomRange(false);
              }}
            >
              7 dias
            </Button>
          </div>
          <div className="w-px h-5 bg-neutral-200" />
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
            onClear={() => { setStartDate(""); setStartTime(""); setEndDate(""); setEndTime(""); setUseCustomRange(false); setPeriod("24h"); }}
          />
        </div>
      </div>

      {isErrorLatest && (
        <div className="text-red-500 text-sm">Não foi possível carregar os dados do seu medidor.</div>
      )}

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
              <LineChart data={seriesPT} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                  name="PT (W)" 
                  stroke="#3b82f6" 
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: "#3b82f6", strokeWidth: 1 }}
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
              <LineChart data={seriesVoltagePF} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
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
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="vavg" 
                  name="V média (V)" 
                  stroke="#10b981" 
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: "#10b981", strokeWidth: 1 }}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="pft" 
                  name="FP" 
                  stroke="#f59e0b" 
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: "#f59e0b", strokeWidth: 1 }}
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
              <LineChart data={seriesCurrents} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                  name="Ia (A)" 
                  stroke="#8b5cf6" 
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: "#8b5cf6", strokeWidth: 1 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ib" 
                  name="Ib (A)" 
                  stroke="#06b6d4" 
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: "#06b6d4", strokeWidth: 1 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ic" 
                  name="Ic (A)" 
                  stroke="#f97316" 
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: "#f97316", strokeWidth: 1 }}
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
              <LineChart data={seriesQT} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                  name="QT (VAr)" 
                  stroke="#ef4444" 
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 4, stroke: "#ef4444", strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

             <Card className="w-full">
         <CardHeader>
           <CardTitle className="text-sm font-medium text-black">Relatório do Período</CardTitle>
         </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                         <div>
                               <div className="text-sm text-black">Período</div>
                                                              <div className="text-lg font-semibold text-black">{periodLabel}</div>
             </div>
             <div>
                               <div className="text-sm text-black">Consumo no período</div>
                                                              <div className="text-lg font-semibold text-black">{report.consumptionKWh.toFixed(3)} kWh</div>
             </div>
             <div>
                               <div className="text-sm text-black">Leituras consideradas</div>
                                                              <div className="text-lg font-semibold text-black">{filtered.length}</div>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
