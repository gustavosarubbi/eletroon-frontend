"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useAuth } from "../../../contexts/AuthContext";
import { getHistoricalData, getLatestReading, getSalaInfo } from "../../../lib/api";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Area, AreaChart } from "recharts";
import { useMemo, useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Loader2, Zap, Activity, TrendingUp, Gauge, Power, Clock, Calendar, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { motion } from "framer-motion";
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
    return (
      <div className="flex justify-center items-center h-96">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
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
            <Loader2 className="w-10 h-10 text-white" />
          </motion.div>
          <p className="text-gray-700 font-semibold text-lg">Carregando dados do medidor...</p>
        </motion.div>
      </div>
    );
  }

  if (isErrorLatest) {
    return (
      <motion.div 
        className="text-center p-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass-effect border-2 border-red-200 rounded-3xl p-8 max-w-md mx-auto">
          <motion.div 
            className="text-red-600 mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle className="w-16 h-16 mx-auto" />
          </motion.div>
          <h3 className="text-xl font-bold text-red-800 mb-4">Erro de Conexão</h3>
          <p className="text-red-700 mb-6 text-lg">
            Não foi possível carregar os dados do seu medidor.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="border-red-300 text-red-700 hover:bg-red-50 px-8 py-3 rounded-2xl font-semibold"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Tentar Novamente
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      className="space-y-8 overflow-x-hidden flex flex-col items-center w-full min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-7xl px-6 py-12">
        {/* Header Section */}
        <motion.div 
          className="flex flex-col items-center gap-8 w-full"
          variants={itemVariants}
        >
          {salaInfo && (
            <div className="text-center">
              <motion.h1 
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gradient-hero mb-6"
                variants={itemVariants}
              >
                {salaInfo.name}
              </motion.h1>
              {salaInfo.user && (
                <motion.p 
                  className="text-xl sm:text-2xl text-gray-700 font-medium mb-6"
                  variants={itemVariants}
                >
                  <span className="font-semibold">Usuário:</span> {salaInfo.user.email}
                </motion.p>
              )}
              <motion.div variants={itemVariants}>
                <MonthlyReport />
              </motion.div>
            </div>
          )}
        </motion.div>
        
        {/* Status and Controls */}
        <motion.div 
          className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6 w-full"
          variants={itemVariants}
        >
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Badge 
                variant={isOnline ? "default" : "destructive"} 
                className="text-sm font-bold px-6 py-3 rounded-2xl shadow-lg"
              >
                <motion.div 
                  className={`w-3 h-3 rounded-full mr-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {isOnline ? "ONLINE" : "OFFLINE"}
              </Badge>
            </motion.div>
            <div className="text-sm text-gray-700 font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              {latestReading ? `Última leitura: ${new Date(latestReading.timestamp).toLocaleString("pt-BR")}` : "Sem leituras"}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {["1h", "24h", "7d"].map((p) => (
              <motion.div key={p} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  className="h-12 px-6 py-3 text-sm font-bold rounded-2xl shadow-lg"
                  variant={period === p && !useCustomRange ? "default" : "outline"}
                  onClick={() => {
                    setPeriod(p as Period);
                    setUseCustomRange(false);
                  }}
                >
                  {p}
                </Button>
              </motion.div>
            ))}
          </div>
          
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
        </motion.div>
      </div>

      {/* Metrics Cards */}
      <motion.div 
        className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full max-w-7xl px-6"
        variants={itemVariants}
      >
        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="glass-effect border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-lg"></div>
                <Power className="w-5 h-5 text-blue-500" />
                Potência Ativa Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {latestReading ? latestReading.pt.toFixed(2) : "—"}
              </div>
              <div className="text-sm text-gray-700 font-semibold">
                {latestReading ? "Watts" : ""}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="glass-effect border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg"></div>
                <TrendingUp className="w-5 h-5 text-green-500" />
                Consumo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {latestReading ? latestReading.ept_c.toFixed(2) : "—"}
              </div>
              <div className="text-sm text-gray-700 font-semibold">
                {latestReading ? "kWh" : ""}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="glass-effect border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-purple-500 shadow-lg"></div>
                <Gauge className="w-5 h-5 text-purple-500" />
                Tensão Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {averageVoltageLatest}
              </div>
              <div className="text-sm text-gray-700 font-semibold">
                {averageVoltageLatest !== "—" ? "Volts" : ""}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, y: -4 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="glass-effect border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-orange-500 shadow-lg"></div>
                <Zap className="w-5 h-5 text-orange-500" />
                Fator de Potência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {latestReading ? latestReading.pft.toFixed(2) : "—"}
              </div>
              <div className="text-sm text-gray-700 font-semibold">
                {latestReading ? "Cos φ" : ""}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Charts Grid */}
      <motion.div 
        className="grid gap-8 grid-cols-1 lg:grid-cols-2 w-full max-w-7xl px-6"
        variants={itemVariants}
      >
        {/* Potência Ativa */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="glass-effect border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 rounded-t-3xl">
              <CardTitle className="text-xl font-bold text-blue-900 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-lg"></div>
                <Activity className="w-6 h-6" />
                Histórico de Potência (PT)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={seriesPT} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                  <defs>
                    <linearGradient id="ptGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
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
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pt" 
                    name="PT (W)" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fill="url(#ptGradient)"
                    dot={{ r: 4, stroke: "#3b82f6", strokeWidth: 2, fill: "white" }}
                    activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2, fill: "#3b82f6" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tensão e Fator de Potência */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="glass-effect border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 rounded-t-3xl">
              <CardTitle className="text-xl font-bold text-green-900 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500 shadow-lg"></div>
                <Gauge className="w-6 h-6" />
                Tensão Média e Fator de Potência
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={seriesVoltagePF} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
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
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      paddingTop: '15px',
                      fontSize: '13px'
                    }}
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="vavg" 
                    name="V média (V)" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 4, stroke: "#10b981", strokeWidth: 2, fill: "white" }}
                    activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "#10b981" }}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="pft" 
                    name="FP" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ r: 4, stroke: "#f59e0b", strokeWidth: 2, fill: "white" }}
                    activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2, fill: "#f59e0b" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Correntes RMS */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="glass-effect border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 rounded-t-3xl">
              <CardTitle className="text-xl font-bold text-purple-900 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-purple-500 shadow-lg"></div>
                <Zap className="w-6 h-6" />
                Correntes RMS (A)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={seriesCurrents} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
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
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{
                      paddingTop: '15px',
                      fontSize: '13px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ia" 
                    name="Ia (A)" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ r: 4, stroke: "#8b5cf6", strokeWidth: 2, fill: "white" }}
                    activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2, fill: "#8b5cf6" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ib" 
                    name="Ib (A)" 
                    stroke="#06b6d4" 
                    strokeWidth={3}
                    dot={{ r: 4, stroke: "#06b6d4", strokeWidth: 2, fill: "white" }}
                    activeDot={{ r: 6, stroke: "#06b6d4", strokeWidth: 2, fill: "#06b6d4" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ic" 
                    name="Ic (A)" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    dot={{ r: 4, stroke: "#f97316", strokeWidth: 2, fill: "white" }}
                    activeDot={{ r: 6, stroke: "#f97316", strokeWidth: 2, fill: "#f97316" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Potência Reativa */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="glass-effect border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200 rounded-t-3xl">
              <CardTitle className="text-xl font-bold text-red-900 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg"></div>
                <Activity className="w-6 h-6" />
                Potência Reativa Total (VAr)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={seriesQT} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                  <defs>
                    <linearGradient id="qtGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
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
                      borderRadius: '16px',
                      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="qt" 
                    name="QT (VAr)" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    fill="url(#qtGradient)"
                    dot={{ r: 4, stroke: "#ef4444", strokeWidth: 2, fill: "white" }}
                    activeDot={{ r: 6, stroke: "#ef4444", strokeWidth: 2, fill: "#ef4444" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Report Card */}
      <motion.div 
        className="w-full max-w-7xl px-6 pb-12"
        variants={itemVariants}
      >
        <Card className="glass-effect border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 rounded-t-3xl">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              Relatório do Período
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
              <div className="text-center p-6 bg-white rounded-3xl border-2 border-gray-200 shadow-lg">
                <div className="text-sm text-gray-600 font-semibold mb-3">Período</div>
                <div className="text-2xl font-bold text-gray-900">{periodLabel}</div>
              </div>
              <div className="text-center p-6 bg-white rounded-3xl border-2 border-gray-200 shadow-lg">
                <div className="text-sm text-gray-600 font-semibold mb-3">Consumo no período</div>
                <div className="text-2xl font-bold text-green-600">{report.consumptionKWh.toFixed(3)} kWh</div>
              </div>
              <div className="text-center p-6 bg-white rounded-3xl border-2 border-gray-200 shadow-lg">
                <div className="text-sm text-gray-600 font-semibold mb-3">Leituras consideradas</div>
                <div className="text-2xl font-bold text-blue-600">{filtered.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
