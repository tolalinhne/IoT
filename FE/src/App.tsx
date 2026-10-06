/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  NavigationTab,
  Device,
  DeviceActionLog,
  UserProfile,
  NotificationItem,
  LiveSensorData,
  LiveDeviceStatus,
} from './types';
import {
  INITIAL_DEVICES,
  INITIAL_ACTION_LOGS,
  INITIAL_USER_PROFILE,
  INITIAL_NOTIFICATIONS,
} from './data';
import { authApi, deviceApi, historyApi, ActionLogRecord, DeviceRecord } from './api';
import { Sidebar } from './components/Sidebar';

import { BottomNavBar } from './components/BottomNavBar';
import { LoginScreen } from './components/LoginScreen';
import { OverviewView } from './components/OverviewView';
import { SensorHistoryView } from './components/SensorHistoryView';
import { DeviceControlView } from './components/DeviceControlView';
import { DeviceHistoryView } from './components/DeviceHistoryView';
import { ProfileView } from './components/ProfileView';
import { Toast, ToastMessage } from './components/Toast';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

// Helper: map API DeviceRecord -> App Device
function mapDevice(d: DeviceRecord): Device {
  return {
    id: d.deviceKey,
    name: d.name,
    type: 'light',
    isOn: d.status,
    isOnline: d.online,
    lastChanged: d.lastChanged ? new Date(d.lastChanged).toLocaleString('vi-VN') : '...',
    location: d.location,
  };
}

// Helper: map API ActionLogRecord -> App DeviceActionLog
function mapLog(l: ActionLogRecord): DeviceActionLog {
  return {
    id: String(l.id),
    deviceName: l.deviceName,
    deviceType: 'light',
    action: l.action,
    status: l.status as 'success' | 'loading' | 'failed',
    timestamp: l.timestamp ? new Date(l.timestamp).toLocaleString('vi-VN') : '',
  };
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [logs, setLogs] = useState<DeviceActionLog[]>(INITIAL_ACTION_LOGS);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [liveSensor, setLiveSensor] = useState<LiveSensorData | null>(null);
  const [mqttConnected, setMqttConnected] = useState(false);
  const wsClientRef = useRef<Client | null>(null);

  // ─── Toast helpers ────────────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  // ─── Load devices from API ─────────────────────────────────────────────────
  const loadDevices = useCallback(async () => {
    try {
      const res = await deviceApi.getAll();
      if (res.success && res.data) {
        setDevices(res.data.map(mapDevice));
      }
    } catch {
      // fallback to initial data
    }
  }, []);

  // ─── Load recent history from API ─────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    try {
      const res = await historyApi.getList({ page: 0, size: 10 });
      if (res.success && res.data?.content) {
        setLogs(res.data.content.map(mapLog));
      }
    } catch {
      // fallback
    }
  }, []);

  // ─── WebSocket STOMP connection ────────────────────────────────────────────
  const connectWebSocket = useCallback(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[WS] Connected');
        setMqttConnected(true);

        // Subscribe sensor realtime
        client.subscribe('/topic/sensor', (msg) => {
          try {
            const data: LiveSensorData = JSON.parse(msg.body);
            setLiveSensor(data);
          } catch { /* ignore */ }
        });

        // Subscribe device status realtime
        client.subscribe('/topic/device-status', (msg) => {
          try {
            const data: LiveDeviceStatus = JSON.parse(msg.body);
            setDevices((prev) =>
              prev.map((d) =>
                d.id === data.deviceKey
                  ? { ...d, isOn: data.status, isOnline: data.online, lastChanged: 'Vừa xong' }
                  : d
              )
            );
          } catch { /* ignore */ }
        });

        // Subscribe action log realtime
        client.subscribe('/topic/action-log', (msg) => {
          try {
            const logData: ActionLogRecord = JSON.parse(msg.body);
            setLogs((prev) => [mapLog(logData), ...prev.slice(0, 49)]);
          } catch { /* ignore */ }
        });
      },
      onDisconnect: () => {
        console.log('[WS] Disconnected');
        setMqttConnected(false);
      },
    });
    client.activate();
    wsClientRef.current = client;
  }, []);

  // ─── Init on login ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn) {
      loadDevices();
      loadHistory();
      connectWebSocket();
    }
    return () => {
      wsClientRef.current?.deactivate();
    };
  }, [isLoggedIn, loadDevices, loadHistory, connectWebSocket]);

  // ─── Device Toggle (sends MQTT via BE) ────────────────────────────────────
  const handleToggleDevice = async (targetDevice: Device) => {
    const newIsOn = !targetDevice.isOn;
    const command = `${targetDevice.id}_${newIsOn ? 'ON' : 'OFF'}`;

    // Optimistic UI update
    setDevices((prev) =>
      prev.map((d) => (d.id === targetDevice.id ? { ...d, isOn: newIsOn, lastChanged: 'Đang xử lý...' } : d))
    );

    try {
      await deviceApi.sendControl(command, currentUsername);
      const actionText = newIsOn ? 'bật' : 'tắt';
      addToast(`${targetDevice.name} đã được ${actionText}`);
    } catch (e) {
      // Revert optimistic update
      setDevices((prev) =>
        prev.map((d) => (d.id === targetDevice.id ? { ...d, isOn: !newIsOn } : d))
      );
      addToast('Lỗi: Không thể gửi lệnh đến thiết bị', 'info');
    }
  };

  const handleToggleAll = async (action: 'ON' | 'OFF') => {
    const command = action === 'ON' ? 'ALL_ON' : 'ALL_OFF';
    const newIsOn = action === 'ON';
    
    // Optimistic UI update for all online devices
    const previousState = [...devices];
    setDevices((prev) =>
      prev.map((d) => (d.isOnline ? { ...d, isOn: newIsOn, lastChanged: 'Đang xử lý...' } : d))
    );

    try {
      await deviceApi.sendControl(command, currentUsername);
      addToast(`Đã yêu cầu ${action === 'ON' ? 'bật' : 'tắt'} tất cả thiết bị.`);
    } catch (e) {
      setDevices(previousState);
      addToast('Lỗi: Không thể gửi lệnh đến thiết bị', 'info');
    }
  };

  // ─── Auth handlers ────────────────────────────────────────────────────────
  const handleLoginSuccess = (data: { username?: string; fullName?: string; email?: string; studentId?: string; classRoom?: string; githubUrl?: string; figmaUrl?: string; postmanUrl?: string; reportUrl?: string; avatarUrl?: string }) => {
    setIsLoggedIn(true);
    setCurrentTab('overview');
    if (data.username) setCurrentUsername(data.username);
    setUserProfile((prev) => ({
      ...prev,
      name: data.fullName || prev.name,
      email: data.email || prev.email,
      studentId: data.studentId || prev.studentId,
      class: data.classRoom || prev.class,
      githubUrl: data.githubUrl || prev.githubUrl,
      figmaUrl: data.figmaUrl || prev.figmaUrl,
      postmanUrl: data.postmanUrl || prev.postmanUrl,
      reportUrl: data.reportUrl || prev.reportUrl,
      avatarUrl: data.avatarUrl || prev.avatarUrl,
    }));
    addToast('Đăng nhập thành công!');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    wsClientRef.current?.deactivate();
  };

  const handleClearNotifications = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="bg-[#fff8f8] text-[#22191d] font-sans antialiased h-screen overflow-hidden flex flex-col md:flex-row">
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fff8f8]">

        <main className={`flex-1 p-4 md:p-6 lg:p-8 custom-scrollbar ${
          (currentTab === 'sensor-history' || currentTab === 'device-history')
            ? 'overflow-hidden flex flex-col'
            : 'overflow-y-auto'
        }`}>
          {currentTab === 'overview' && (
            <OverviewView
              devices={devices}
              onToggleDevice={handleToggleDevice}
              onToggleAll={handleToggleAll}
              liveSensor={liveSensor}
            />
          )}

          {currentTab === 'sensor-history' && <SensorHistoryView />}

          {currentTab === 'devices' && (
            <DeviceControlView
              devices={devices}
              onToggleDevice={handleToggleDevice}
              onToggleAll={handleToggleAll}
            />
          )}

          {currentTab === 'device-history' && <DeviceHistoryView />}

          {currentTab === 'profile' && (
            <ProfileView
              userProfile={userProfile}
              onUpdateProfile={setUserProfile}
            />
          )}
        </main>

        <BottomNavBar currentTab={currentTab} onSelectTab={setCurrentTab} />
      </div>

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
