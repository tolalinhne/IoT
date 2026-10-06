import React from 'react';
import { NavigationTab } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Tổng quan', icon: 'dashboard' },
    { id: 'sensor-history', label: 'Lịch sử cảm biến', icon: 'analytics' },
    { id: 'devices', label: 'Điều khiển thiết bị', icon: 'settings_remote' },
    { id: 'device-history', label: 'Lịch sử bật/tắt', icon: 'history' },
    { id: 'profile', label: 'Thông tin cá nhân', icon: 'person' },
  ];

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col h-screen w-64 bg-white shadow-md py-6 px-4 gap-2 shrink-0 z-30 border-r border-[#efdee4]/60"
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 px-3">
        <div className="w-10 h-10 rounded-xl bg-[#ec6f9e] flex items-center justify-center text-white shadow-sm shrink-0">
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            memory
          </span>
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-[#a33563] tracking-tight leading-none">IoT Monitor</h1>
          <p className="text-[12px] font-medium text-[#554247] mt-1 opacity-85">Smart Workspace</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-[14px] transition-all text-left ${
                isActive
                  ? 'bg-[#fff0f5] text-[#a33563] font-bold shadow-sm scale-[0.98]'
                  : 'text-[#554247] hover:bg-[#f5e4ea]/60 hover:text-[#a33563]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Logout Action */}
      <div className="mt-auto pt-4 border-t border-[#efdee4]">
        <button
          id="sidebar-logout-btn"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#554247] hover:bg-[#fff0f5] hover:text-[#ba1a1a] transition-all font-medium text-[14px] text-left"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
