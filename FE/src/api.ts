/**
 * API Service - Ket noi voi Spring Boot Backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Generic fetch helper
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Loi server');
  return json;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface UserData {
  id: number;
  username: string;
  fullName: string;
  email: string;
  studentId: string;
  classRoom: string;
  githubUrl?: string;
  figmaUrl?: string;
  postmanUrl?: string;
  reportUrl?: string;
  avatarUrl?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: UserData;
}

export const authApi = {
  login: (username: string, password: string) =>
    apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
};

// ─── Sensor ───────────────────────────────────────────────────────────────────
export interface SensorRecord {
  id: number;
  temperature: number;
  humidity: number;
  light: number;
  timestamp: string;
  tempStatus: string;
  humidStatus: string;
  lightStatus: string;
}

export interface PageData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

export interface ApiResp<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface SensorFilters {
  from?: string;
  to?: string;
  minTemp?: number | string;
  maxTemp?: number | string;
  minHumid?: number | string;
  maxHumid?: number | string;
  minLight?: number | string;
  maxLight?: number | string;
  page?: number;
  size?: number;
}

export const sensorApi = {
  getLatest: () =>
    apiFetch<ApiResp<SensorRecord | null>>('/api/sensor/latest'),

  getChart: (hours: number = 1) =>
    apiFetch<ApiResp<SensorRecord[]>>(`/api/sensor/chart?hours=${hours}`),

  getList: (filters: SensorFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
    return apiFetch<ApiResp<PageData<SensorRecord>>>(`/api/sensor?${params.toString()}`);
  },
};

// ─── Devices ──────────────────────────────────────────────────────────────────
export interface DeviceRecord {
  id: number;
  deviceKey: string;
  name: string;
  type: string;
  status: boolean;
  online: boolean;
  location: string;
  lastChanged: string;
}

export const deviceApi = {
  getAll: () =>
    apiFetch<ApiResp<DeviceRecord[]>>('/api/devices'),

  sendControl: (command: string, user?: string) =>
    apiFetch<ApiResp<string | null>>('/api/devices/control', {
      method: 'POST',
      body: JSON.stringify({ command, user }),
    }),

  getMqttStatus: () =>
    apiFetch<ApiResp<{ connected: boolean }>>('/api/devices/mqtt-status'),
};

// ─── History ──────────────────────────────────────────────────────────────────
export interface ActionLogRecord {
  id: number;
  deviceKey: string;
  deviceName: string;
  deviceType: string;
  action: 'ON' | 'OFF';
  status: 'success' | 'loading' | 'failed';
  timestamp: string;
  user?: string;
}

export interface HistoryFilters {
  deviceKey?: string;
  action?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export const historyApi = {
  getList: (filters: HistoryFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
    });
    return apiFetch<ApiResp<PageData<ActionLogRecord>>>(`/api/history?${params.toString()}`);
  },
};
