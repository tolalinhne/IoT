import React, { useState } from 'react';
import { Device } from '../types';

interface DeviceControlViewProps {
  devices: Device[];
  onToggleDevice: (device: Device) => void;
  onToggleAll?: (action: 'ON' | 'OFF') => void;
}

export const DeviceControlView: React.FC<DeviceControlViewProps> = ({
  devices,
  onToggleDevice,
  onToggleAll,
}) => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [brightness, setBrightness] = useState<number>(80);
  const [timerMinutes, setTimerMinutes] = useState<number>(30);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-[32px] md:text-[36px] font-bold text-[#a33563] tracking-tight mb-1">
            Điều khiển thiết bị
          </h2>
          <p className="text-[16px] text-[#554247]">
            Quản lý trạng thái các thiết bị IoT.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleAll?.('ON')}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#ec6f9e] hover:bg-[#d85887] text-white font-semibold text-[14px] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">power</span>
            Bật tất cả
          </button>
          <button
            onClick={() => onToggleAll?.('OFF')}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#efdee4] hover:bg-[#dbc0c6] text-[#554247] font-semibold text-[14px] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">power_off</span>
            Tắt tất cả
          </button>
        </div>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => {
          return (
            <div
              key={device.id}
              className={`bg-white rounded-[22px] p-6 shadow-sm border transition-all duration-300 relative group overflow-hidden ${
                device.isOn
                  ? 'border-[#ec6f9e]/40 shadow-[0_12px_24px_-4px_rgba(236,111,158,0.12)]'
                  : 'border-[#efdee4] hover:border-[#dbc0c6]'
              }`}
            >
              {/* Decorative background glow for ON state */}
              {device.isOn && (
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ec6f9e] opacity-10 rounded-full blur-2xl pointer-events-none"></div>
              )}

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors shadow-inner ${
                      device.isOn
                        ? 'bg-[#fbe9f0] text-[#a33563]'
                        : 'bg-[#efdee4] text-[#887177] opacity-75'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-4xl"
                      style={device.isOn ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {device.type === 'light'
                        ? 'lightbulb'
                        : device.type === 'fan'
                        ? 'mode_fan'
                        : 'water_drop'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[20px] font-bold text-[#22191d]">
                      {device.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          !device.isOnline
                            ? 'bg-[#ba1a1a]'
                            : device.isOn
                            ? 'bg-[#ec6f9e]'
                            : 'bg-[#887177]'
                        }`}
                      ></span>
                      <span
                        className={`text-[12px] font-semibold ${
                          !device.isOnline
                            ? 'text-[#ba1a1a]'
                            : device.isOn
                            ? 'text-[#a33563]'
                            : 'text-[#554247]'
                        }`}
                      >
                        {!device.isOnline ? 'Mất kết nối' : device.isOn ? 'Đang bật' : 'Đã tắt'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={() => device.isOnline && onToggleDevice(device)}
                  disabled={!device.isOnline}
                  className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${
                    !device.isOnline
                      ? 'opacity-40 cursor-not-allowed bg-gray-300'
                      : device.isOn
                      ? 'bg-[#ec6f9e]'
                      : 'bg-[#efdee4]'
                  }`}
                  aria-label={`Bật tắt ${device.name}`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 flex items-center justify-center ${
                      device.isOn ? 'transform translate-x-6' : ''
                    }`}
                  >
                    {device.isOn && (
                      <span className="material-symbols-outlined text-[14px] text-[#a33563]">
                        check
                      </span>
                    )}
                  </span>
                </button>
              </div>

              {/* Card Footer */}
              <div className="mt-auto pt-4 border-t border-[#efdee4] flex justify-between items-center relative z-10">
                <span className="text-[12px] text-[#554247] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#887177]">
                    schedule
                  </span>
                  Lần cuối: {device.lastChanged}
                </span>

                <button
                  onClick={() => setSelectedDevice(device)}
                  className="text-[#a33563] hover:text-[#841c4b] p-1 rounded-lg hover:bg-[#fff0f5] transition-colors cursor-pointer"
                  title="Tùy chọn thiết bị"
                >
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Device Settings Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#efdee4]">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#efdee4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#fff0f5] text-[#a33563] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">settings_remote</span>
                </div>
                <h3 className="font-bold text-[18px] text-[#22191d]">
                  Cài đặt: {selectedDevice.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-[#887177] hover:text-[#22191d]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-[14px]">
              <div>
                <label className="block text-[#554247] font-semibold mb-1">Vị trí lắp đặt</label>
                <p className="bg-[#fff8f8] px-3 py-2 rounded-xl border border-[#efdee4] text-[#22191d]">
                  {selectedDevice.location}
                </p>
              </div>

              {selectedDevice.type === 'light' && (
                <div>
                  <div className="flex justify-between text-[#554247] font-semibold mb-1">
                    <span>Độ sáng</span>
                    <span className="text-[#a33563] font-bold">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-[#ec6f9e] cursor-pointer"
                  />
                </div>
              )}

              <div>
                <div className="flex justify-between text-[#554247] font-semibold mb-1">
                  <span>Hẹn giờ tự động tắt</span>
                  <span className="text-[#a33563] font-bold">{timerMinutes} phút</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(Number(e.target.value))}
                  className="w-full accent-[#ec6f9e] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#fff0f5] rounded-xl border border-[#efdee4]">
                <div>
                  <p className="font-semibold text-[#22191d]">Chế độ hẹn giờ</p>
                  <p className="text-[12px] text-[#554247]">Tự động tắt sau {timerMinutes} phút</p>
                </div>
                <input
                  type="checkbox"
                  checked={timerActive}
                  onChange={(e) => setTimerActive(e.target.checked)}
                  className="w-5 h-5 accent-[#ec6f9e] cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#efdee4]">
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#554247] hover:bg-[#f5e4ea]"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setSelectedDevice(null);
                  }}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#a33563] hover:bg-[#841c4b] text-white"
                >
                  Lưu cấu hình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
