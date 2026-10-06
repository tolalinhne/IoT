import React from 'react';
import { NavigationTab } from '../types';

interface BottomNavBarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const items: { id: NavigationTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Tổng quan', icon: 'dashboard' },
    { id: 'sensor-history', label: 'Cảm biến', icon: 'analytics' },
    { id: 'devices', label: 'Điều khiển', icon: 'settings_remote' },
    { id: 'device-history', label: 'Lịch sử', icon: 'history' },
    { id: 'profile', label: 'Cá nhân', icon: 'person' },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden flex justify-around items-center w-full px-2 py-2.5 bg-white border-t border-[#efdee4] shadow-lg sticky bottom-0 z-40"
    >
      {items.map((item) => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            id={`mobile-tab-${item.id}`}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-colors ${
              isActive ? 'text-[#a33563] font-bold' : 'text-[#887177] hover:text-[#a33563]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px] mb-0.5"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="text-[11px] leading-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
