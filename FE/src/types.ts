export type NavigationTab = 
  | 'overview' 
  | 'sensor-history' 
  | 'devices' 
  | 'device-history' 
  | 'profile';

export type SensorType = 'temp' | 'humid' | 'light';

export interface SensorReading {
  id: string;
  sensorName: string;
  sensorType: SensorType;
  value: number;
  unit: string;
  timestamp: string;
  status: 'normal' | 'warning' | 'error';
  statusLabel: string;
}

export type DeviceType = 'light' | 'fan' | 'pump';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  isOn: boolean;
  isOnline: boolean;
  lastChanged: string;
  location: string;
}

export interface DeviceActionLog {
  id: string;
  deviceName: string;
  deviceType: DeviceType;
  action: 'ON' | 'OFF';
  status: 'success' | 'loading' | 'failed';
  timestamp: string;
}

export interface UserProfile {
  name: string;
  title: string;
  studentId: string;
  class: string;
  email: string;
  githubUrl: string;
  figmaUrl: string;
  postmanUrl: string;
  reportUrl: string;
  managedDevicesCount: number;
  tier: string;
  avatarUrl: string;
  status: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

/** Dữ liệu sensor realtime từ WebSocket */
export interface LiveSensorData {
  id: number;
  temperature: number;
  humidity: number;
  light: number;
  timestamp: string;
  tempStatus: string;
  humidStatus: string;
  lightStatus: string;
}

/** Trạng thái thiết bị realtime từ WebSocket */
export interface LiveDeviceStatus {
  id: number;
  deviceKey: string;
  name: string;
  status: boolean;
  online: boolean;
  lastChanged: string;
}
