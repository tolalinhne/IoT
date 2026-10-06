import { SensorReading, Device, DeviceActionLog, UserProfile, NotificationItem } from './types';

// Default data - will be overwritten by API data
export const INITIAL_SENSOR_READINGS: SensorReading[] = [];

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'LED1',
    name: 'LED 01',
    type: 'light',
    isOn: false,
    isOnline: true,
    lastChanged: '...',
    location: 'Phong Khach',
  },
  {
    id: 'LED2',
    name: 'LED 02',
    type: 'light',
    isOn: false,
    isOnline: true,
    lastChanged: '...',
    location: 'Bep',
  },
  {
    id: 'LED3',
    name: 'LED 03',
    type: 'light',
    isOn: false,
    isOnline: true,
    lastChanged: '...',
    location: 'Phong Ngu',
  },
];

export const INITIAL_ACTION_LOGS: DeviceActionLog[] = [];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Phạm Mai Linh',
  title: 'Sinh vien CNTT - PTIT',
  studentId: 'B23DCCN488',
  class: 'D23CQCN02-B',
  email: 'B23DCCN488@ptit.edu.vn',
  githubUrl: 'https://github.com',
  figmaUrl: 'https://figma.com',
  postmanUrl: 'https://postman.com',
  reportUrl: 'https://docs.google.com',
  managedDevicesCount: 3,
  tier: 'Pro',
  status: 'Đang hoạt động',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7uTW1_fgmra0NvNiRMw0nL2OPM0vr62NZTfgEIfu2up9nMzzcVC8Dl9I8u4IAOlZq9bPjo2qXJl4lhjAsvUQm43H7jQ4pCHMEixtCC6dUXSBuUpEGp-8WmjjQe434t67xHq57R3doAEx77BcDx8IT02IkQmzwOTs2JZY0DLJtJXlL9PatVaNHS5dPYLVUQZX2xUULNjQJMv6FGC5qeKeog6PJj7BQLbOGDGgtdBS-f5OnspZFV6tc',
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'He thong IoT san sang',
    description: 'Backend va MQTT broker da ket noi. Du lieu cam bien dang duoc thu thap.',
    time: 'Vua xong',
    type: 'success',
    read: false,
  },
];
