import React, { useState, useEffect } from 'react';
import { Device } from '../types';
import type { LiveSensorData } from '../types';
import { sensorApi, SensorRecord } from '../api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface OverviewViewProps {
  devices: Device[];
  onToggleDevice: (device: Device) => void;
  onToggleAll?: (action: 'ON' | 'OFF') => void;
  liveSensor?: LiveSensorData | null;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  devices,
  onToggleDevice,
  onToggleAll,
  liveSensor,
}) => {
  const [selectedSensorMetric, setSelectedSensorMetric] = useState<'temp' | 'humid' | 'light'>('temp');
  const [timeframe, setTimeframe] = useState<'1h' | '6h' | '24h'>('1h');
  const [chartData, setChartData] = useState<any[]>([]);

  // Realtime values from WebSocket (fallback to hardcoded if no live data)
  const tempVal = liveSensor ? liveSensor.temperature.toFixed(1) : '--';
  const humidVal = liveSensor ? liveSensor.humidity.toFixed(1) : '--';
  const lightVal = liveSensor ? String(liveSensor.light) : '--';

  useEffect(() => {
    const fetchChart = async () => {
      let hours = 1;
      if (timeframe === '6h') hours = 6;
      if (timeframe === '24h') hours = 24;

      try {
        const res = await sensorApi.getChart(hours);
        if (res.success && res.data) {
          const formatted = res.data.map((r: SensorRecord) => ({
            time: new Date(r.timestamp).getTime(),
            temp: r.temperature,
            humid: r.humidity,
            light: r.light,
          }));
          setChartData(formatted);
        }
      } catch (e) {
        console.error('Failed to fetch chart data', e);
      }
    };
    fetchChart();
  }, [timeframe]);

  useEffect(() => {
    if (!liveSensor) return;
    setChartData((prev) => {
      const newPt = {
        time: new Date().getTime(),
        temp: liveSensor.temperature,
        humid: liveSensor.humidity,
        light: liveSensor.light,
      };
      
      // Xác định thời gian cutoff dựa trên timeframe hiện tại
      let timeOffsetMs = 3600000;
      if (timeframe === '6h') timeOffsetMs = 6 * 3600000;
      if (timeframe === '24h') timeOffsetMs = 24 * 3600000;
      
      const cutoffTime = newPt.time - timeOffsetMs;
      
      // Giữ lại tất cả dữ liệu nằm trong khung giờ đã chọn thay vì chỉ 100 điểm cuối
      return [...prev, newPt].filter(pt => pt.time >= cutoffTime);
    });
  }, [liveSensor, timeframe]);

  const chartConfigs = {
    temp: { color: '#ec6f9e', dataKey: 'temp', unit: '°C', domain: ['auto', 'auto'], tickCount: 6 },
    humid: { color: '#964261', dataKey: 'humid', unit: '%', domain: [0, 100], tickCount: 6 },
    light: { color: '#d87d9a', dataKey: 'light', unit: 'lux', domain: ['auto', 'auto'], tickCount: 6 },
  };

  const currentConfig = chartConfigs[selectedSensorMetric];
  
  // Calculate explicit X-axis domain to always show the full timeframe window
  const now = Date.now();
  const timeOffset = timeframe === '1h' ? 3600000 : timeframe === '6h' ? 6 * 3600000 : 24 * 3600000;
  const xDomain = [now - timeOffset, now];

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto gap-4">
      {/* Page Header */}
      <div className="shrink-0">
        <h2 className="text-[28px] md:text-[32px] font-bold text-[#22191d] tracking-tight mb-0.5">
          Tổng quan
        </h2>
        <p className="text-[14px] text-[#554247]">
          Theo dõi dữ liệu cảm biến và hoạt động gần đây.
        </p>
      </div>

      {/* Sensor Summary Section (3 Bento Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        {/* Temperature Card */}
        <div
          onClick={() => setSelectedSensorMetric('temp')}
          className={`bg-white rounded-2xl p-5 shadow-sm border transition-all cursor-pointer hover:-translate-y-0.5 duration-200 ${
            selectedSensorMetric === 'temp' ? 'border-[#ec6f9e] ring-2 ring-[#ec6f9e]/20' : 'border-[#efdee4]'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[13px] font-semibold text-[#554247] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#a33563] text-[18px]">
                device_thermostat
              </span>
              Nhiệt độ
            </span>
            <div className="w-8 h-8 rounded-full bg-[#fff0f5] flex items-center justify-center text-[#ec6f9e]">
              <span className="material-symbols-outlined text-[18px]">trending_up</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[32px] font-bold text-[#22191d] tracking-tight">{tempVal}</span>
            <span className="text-[16px] text-[#554247] font-medium">°C</span>
          </div>
        </div>

        {/* Humidity Card */}
        <div
          onClick={() => setSelectedSensorMetric('humid')}
          className={`bg-white rounded-2xl p-5 shadow-sm border transition-all cursor-pointer hover:-translate-y-0.5 duration-200 ${
            selectedSensorMetric === 'humid' ? 'border-[#ec6f9e] ring-2 ring-[#ec6f9e]/20' : 'border-[#efdee4]'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[13px] font-semibold text-[#554247] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#934560] text-[18px]">
                humidity_percentage
              </span>
              Độ ẩm
            </span>
            <div className="w-8 h-8 rounded-full bg-[#fff0f5] flex items-center justify-center text-[#554247]">
              <span className="material-symbols-outlined text-[18px]">trending_flat</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[32px] font-bold text-[#22191d] tracking-tight">{humidVal}</span>
            <span className="text-[16px] text-[#554247] font-medium">%</span>
          </div>
        </div>

        {/* Light Card */}
        <div
          onClick={() => setSelectedSensorMetric('light')}
          className={`bg-white rounded-2xl p-5 shadow-sm border transition-all cursor-pointer hover:-translate-y-0.5 duration-200 ${
            selectedSensorMetric === 'light' ? 'border-[#ec6f9e] ring-2 ring-[#ec6f9e]/20' : 'border-[#efdee4]'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[13px] font-semibold text-[#554247] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#fe97b9] text-[18px]">
                light_mode
              </span>
              Ánh sáng
            </span>
            <div className="w-8 h-8 rounded-full bg-[#fff0f5] flex items-center justify-center text-[#ec6f9e]">
              <span className="material-symbols-outlined text-[18px]">trending_down</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[32px] font-bold text-[#22191d] tracking-tight">{lightVal}</span>
            <span className="text-[16px] text-[#554247] font-medium">lux</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        {/* Chart Section */}
        <div className="lg:col-span-3 bg-white rounded-[22px] p-5 shadow-sm border border-[#efdee4] flex flex-col">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4 shrink-0">
            <h3 className="text-[18px] font-bold text-[#22191d]">
              Biểu đồ cảm biến
            </h3>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <select
                value={selectedSensorMetric}
                onChange={(e) => setSelectedSensorMetric(e.target.value as any)}
                className="bg-[#fff8f8] border border-[#dbc0c6] rounded-xl px-3 py-1.5 text-[13px] font-medium text-[#22191d] focus:outline-none focus:border-[#ec6f9e]"
              >
                <option value="temp">Nhiệt độ (°C)</option>
                <option value="humid">Độ ẩm (%)</option>
                <option value="light">Ánh sáng (Lux)</option>
              </select>

              <div className="flex bg-[#fff0f5] rounded-xl p-1 border border-[#efdee4]">
                {(['1h', '6h', '24h'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                      timeframe === tf
                        ? 'bg-white text-[#a33563] shadow-xs'
                        : 'text-[#554247] hover:text-[#a33563]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Chart using Recharts */}
          <div className="w-full flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efdee4" />
                <XAxis 
                  dataKey="time" 
                  type="number"
                  domain={xDomain}
                  tickCount={6}
                  tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  tick={{ fontSize: 11, fill: '#887177' }} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  domain={currentConfig.domain as any}
                  tickCount={currentConfig.tickCount}
                  tick={{ fontSize: 11, fill: '#887177' }} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#22191d', marginBottom: '4px' }}
                  itemStyle={{ color: currentConfig.color, fontWeight: 'bold' }}
                  labelFormatter={(label) => label ? new Date(String(label)).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                  formatter={(value: any) => [`${value} ${currentConfig.unit}`, chartConfigs[selectedSensorMetric].unit === '°C' ? 'Nhiệt độ' : chartConfigs[selectedSensorMetric].unit === '%' ? 'Độ ẩm' : 'Ánh sáng']}
                />
                <Area
                  type="monotone"
                  dataKey={currentConfig.dataKey}
                  stroke={currentConfig.color}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMetric)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Quick Device Controls */}
        <div className="bg-white rounded-[22px] p-5 shadow-sm border border-[#efdee4] flex flex-col overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center justify-between mb-1 shrink-0">
            <h3 className="text-[15px] font-bold text-[#22191d]">Điều khiển nhanh</h3>
            <div className="flex gap-1.5">
              <button
                onClick={() => onToggleAll?.('ON')}
                title="Bật tất cả"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#ec6f9e] hover:bg-[#d85887] text-white text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">power</span>
                Tất cả
              </button>
              <button
                onClick={() => onToggleAll?.('OFF')}
                title="Tắt tất cả"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#efdee4] hover:bg-[#dbc0c6] text-[#554247] text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">power_off</span>
                Tất cả
              </button>
            </div>
          </div>
          <p className="text-[11px] text-[#887177] mb-3 shrink-0">Bật / Tắt thiết bị</p>
          <ul className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1">
            {devices.map((device) => (
              <li key={device.id} className={`flex items-center justify-between gap-3 p-3 rounded-[14px] border transition-all duration-200 ${
                device.isOn ? 'bg-[#fff0f5] border-[#ec6f9e]/40' : 'bg-[#fff8f8] border-[#efdee4]'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    device.isOn ? 'bg-[#fbe9f0] text-[#a33563]' : 'bg-[#efdee4] text-[#887177]'
                  }`}>
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={device.isOn ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      lightbulb
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#22191d] leading-tight">{device.name}</p>
                    <p className={`text-[11px] font-medium ${
                      !device.isOnline ? 'text-[#ba1a1a]' : device.isOn ? 'text-[#a33563]' : 'text-[#887177]'
                    }`}>
                      {!device.isOnline ? 'Mất kết nối' : device.isOn ? 'Đang bật' : 'Đã tắt'}
                    </p>
                  </div>
                </div>
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => device.isOnline && onToggleDevice(device)}
                  disabled={!device.isOnline}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                    !device.isOnline
                      ? 'opacity-40 cursor-not-allowed bg-gray-300'
                      : device.isOn
                      ? 'bg-[#ec6f9e] cursor-pointer'
                      : 'bg-[#efdee4] cursor-pointer'
                  }`}
                  aria-label={`Bật tắt ${device.name}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 flex items-center justify-center ${
                    device.isOn ? 'translate-x-5' : ''
                  }`}>
                    {device.isOn && (
                      <span className="material-symbols-outlined text-[11px] text-[#a33563]">check</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
            {devices.length === 0 && (
              <p className="text-[12px] text-[#887177] italic">Không có thiết bị nào.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
