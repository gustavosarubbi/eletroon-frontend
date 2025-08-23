import axios, { type AxiosRequestHeaders } from "axios";

function resolveBaseURL() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return "http://localhost:3000/api";
}

export const api = axios.create({
  baseURL: resolveBaseURL(),
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("eletroon_token");
    if (token) {
      const headers = (config.headers ?? {}) as AxiosRequestHeaders;
      headers.Authorization = `Bearer ${token}`;
      config.headers = headers;
    }
  }
  return config;
});

// Interceptor para detectar erros 401 e fazer logout automático
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - fazer logout automático
      if (typeof window !== "undefined") {
        localStorage.removeItem("eletroon_token");
        localStorage.removeItem("eletroon_user");
        
        // Redirecionar para login
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const getAdminSalas = async () => {
  const response = await api.get("/admin/salas");
  return response.data;
};

export const updateSalaName = async ({ meterId, name }: { meterId: number; name: string }) => {
  const response = await api.patch(`/admin/salas/${meterId}`, { name });
  return response.data;
};

export const createUserForSala = async ({ meterId, email, password }: { meterId: number; email: string; password?: string }) => {
  const response = await api.post(`/admin/salas/${meterId}/usuario`, { email, password });
  return response.data;
};

export const updateUserForSala = async ({ meterId, email, password }: { meterId: number; email?: string; password?: string }) => {
  const response = await api.patch(`/admin/salas/${meterId}/usuario`, { email, password });
  return response.data;
};

export const resetUserPassword = async ({ meterId }: { meterId: number }) => {
  const response = await api.patch(`/admin/salas/${meterId}/usuario/reset-password`);
  return response.data;
};

export const deleteUserForSala = async ({ meterId }: { meterId: number }) => {
  const response = await api.delete(`/admin/salas/${meterId}/usuario`);
  return response.data;
};

export const deleteDevice = async ({ meterId }: { meterId: number }) => {
  const response = await api.delete(`/admin/salas/${meterId}`);
  return response.data;
};

export const getLatestReading = async (meterId: number) => {
  const response = await api.get(`/eletroon/${meterId}/latest`);
  return response.data;
};

export const getHistoricalData = async (
  meterId: number,
  params?: { dataInicio?: string; dataFim?: string }
) => {
  const response = await api.get(`/eletroon/${meterId}` , { params });
  return response.data;
};

export const getSalaInfo = async (meterId: number) => {
  const response = await api.get(`/eletroon/${meterId}/info`);
  return response.data;
};

export const exportDataAsCsv = async (meterId: number) => {
  const response = await api.get(`/eletroon/${meterId}/export/csv`, {
    responseType: 'blob', // Importante: indica que esperamos um arquivo
  });
  return response.data;
};

// Exportar dados de uma sala específica para admin
export const exportSalaDataAsCsv = async (meterId: number) => {
  const response = await api.get(`/admin/salas/${meterId}/export/csv`, {
    responseType: 'blob',
  });
  return response.data;
};

// Exportar relatório consolidado de todas as salas
export const exportConsolidatedReportAsCsv = async () => {
  const response = await api.get(`/admin/salas/consolidated-report/csv`, {
    responseType: 'blob',
  });
  return response.data;
};
