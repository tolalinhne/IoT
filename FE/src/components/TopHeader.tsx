import React, { useState } from 'react';
import { UserProfile, NotificationItem, NavigationTab } from '../types';

interface TopHeaderProps {
  userProfile: UserProfile;
  notifications: NotificationItem[];
  onSelectTab: (tab: NavigationTab) => void;
  onClearNotifications: () => void;
  mqttConnected?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  userProfile,
  notifications,
  onSelectTab,
  onClearNotifications,
  mqttConnected = false,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState('5s');
  const [soundAlerts, setSoundAlerts] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      id="top-header"
      className="bg-[#fff8f8] border-b border-[#efdee4]/60 flex justify-between items-center w-full px-6 py-3.5 shrink-0 z-20 sticky top-0"
    >
      {/* Mobile Brand */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-[#ec6f9e] flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-[18px]">memory</span>
        </div>
        <span className="text-[18px] font-bold text-[#a33563]">IoT Monitor</span>
      </div>

      {/* Spacer for desktop */}
      <div className="hidden md:block flex-1">
        <div className="text-[13px] text-[#554247] flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${mqttConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
          <span>
            {mqttConnected
              ? 'Hệ thống hoạt động bình thường • MQTT kết nối'
              : 'Đang kết nối MQTT Broker...'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 relative">
        {/* Notifications Button */}
        <div className="relative">
          <button
            id="notifications-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full hover:bg-[#f5e4ea] transition-colors flex items-center justify-center text-[#554247] relative cursor-pointer"
            title="Thông báo"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ec6f9e] rounded-full ring-2 ring-[#fff8f8]"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              id="notifications-dropdown"
              className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#efdee4] p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#efdee4]">
                <h4 className="font-bold text-[14px] text-[#22191d] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#a33563]">notifications</span>
                  Thông báo hệ thống
                </h4>
                {unreadCount > 0 && (
                  <button
                    onClick={onClearNotifications}
                    className="text-[11px] text-[#a33563] hover:underline font-medium"
                  >
                    Đã đọc tất cả
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-[13px] text-[#887177] text-center py-4">Không có thông báo mới</p>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl transition-colors text-left ${
                        !item.read ? 'bg-[#fff0f5] border border-[#fbe9f0]' : 'hover:bg-[#f5e4ea]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[12px] font-bold ${
                            item.type === 'error'
                              ? 'text-[#ba1a1a]'
                              : item.type === 'warning'
                              ? 'text-amber-700'
                              : 'text-[#a33563]'
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="text-[10px] text-[#887177]">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-[#554247] mt-1 leading-snug">{item.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <div className="relative">
          <button
            id="header-settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 rounded-full hover:bg-[#f5e4ea] transition-colors flex items-center justify-center text-[#554247] cursor-pointer"
            title="Cài đặt hệ thống"
          >
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>

          {/* Settings Modal/Popover */}
          {showSettings && (
            <div
              id="settings-dropdown"
              className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#efdee4] p-4 z-50"
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#efdee4]">
                <h4 className="font-bold text-[14px] text-[#22191d] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#a33563]">tune</span>
                  Cài đặt IoT
                </h4>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-[#887177] hover:text-[#22191d]"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="space-y-3 text-[13px]">
                <div>
                  <label className="block text-[#554247] mb-1 font-medium">Chu kỳ làm mới dữ liệu</label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(e.target.value)}
                    className="w-full bg-[#fff0f5] border border-[#dbc0c6] rounded-xl px-3 py-1.5 text-[#22191d] focus:outline-none focus:border-[#ec6f9e]"
                  >
                    <option value="2s">2 giây (Thời gian thực)</option>
                    <option value="5s">5 giây (Mặc định)</option>
                    <option value="15s">15 giây (Tiết kiệm năng lượng)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#554247] font-medium">Âm thanh cảnh báo</span>
                  <input
                    type="checkbox"
                    checked={soundAlerts}
                    onChange={(e) => setSoundAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[#ec6f9e] cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-[#efdee4] text-[11px] text-[#887177]">
                  Phiên bản ứng dụng: IoT Monitor v2.4 (HUST IoT Lab)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <button
          id="header-user-avatar-btn"
          onClick={() => onSelectTab('profile')}
          className="ml-2 w-10 h-10 rounded-full border-2 border-[#efdee4] hover:border-[#a33563] overflow-hidden cursor-pointer transition-all shadow-sm shrink-0"
          title="Xem thông tin cá nhân"
        >
          <img
            src={userProfile.avatarUrl}
            alt={userProfile.name}
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
};
