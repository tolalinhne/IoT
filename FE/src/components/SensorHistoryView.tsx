import React, { useState, useEffect, useCallback } from 'react';
import { sensorApi, SensorRecord } from '../api';

// Format Date as local datetime string (no UTC conversion) to match backend LocalDateTime
function toLocalISOString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// Parse flexible datetime
function parseFlexibleDateTime(input: string): { isoFrom: string; isoTo: string } | null {
  const raw = input.trim();
  if (!raw) return null;
  const parts = raw.match(
    /^(\d{4})(?:[\/\-](\d{1,2})(?:[\/\-](\d{1,2})(?:\s+(\d{1,2})(?::(\d{1,2})(?::(\d{1,2}))?)?)?)?)?$/
  );
  if (!parts) return null;
  const yyyy = parseInt(parts[1]);
  const mm = parts[2] !== undefined ? parseInt(parts[2]) - 1 : undefined;
  const dd = parts[3] !== undefined ? parseInt(parts[3]) : undefined;
  const hh = parts[4] !== undefined ? parseInt(parts[4]) : undefined;
  const min = parts[5] !== undefined ? parseInt(parts[5]) : undefined;
  const ss = parts[6] !== undefined ? parseInt(parts[6]) : undefined;
  const from = new Date(yyyy, mm ?? 0, dd ?? 1, hh ?? 0, min ?? 0, ss ?? 0);
  if (isNaN(from.getTime())) return null;
  const to = new Date(from);
  if (ss !== undefined) to.setSeconds(to.getSeconds() + 1);
  else if (min !== undefined) to.setMinutes(to.getMinutes() + 1);
  else if (hh !== undefined) to.setHours(to.getHours() + 1);
  else if (dd !== undefined) to.setDate(to.getDate() + 1);
  else if (mm !== undefined) to.setMonth(to.getMonth() + 1);
  else to.setFullYear(to.getFullYear() + 1);
  return { isoFrom: toLocalISOString(from), isoTo: toLocalISOString(to) };
}

function parseValueRange(raw: string): { min: number; max: number } | null {
  const s = raw.trim();
  if (!s) return null;
  const rangeMatch = s.match(/^([\d.]+)\s*[-]\s*([\d.]+)$/);
  if (rangeMatch) {
    const lo = parseFloat(rangeMatch[1]);
    const hi = parseFloat(rangeMatch[2]);
    if (!isNaN(lo) && !isNaN(hi)) return { min: Math.min(lo, hi), max: Math.max(lo, hi) };
  }
  const single = parseFloat(s);
  if (!isNaN(single)) {
    const decimalPlaces = (s.split('.')[1] || '').length;
    const step = decimalPlaces > 0 ? Math.pow(10, -decimalPlaces) : 1;
    return { min: single, max: +(single + step - 0.001).toFixed(3) };
  }
  return null;
}

type SearchMode = 'all' | 'temperature' | 'humidity' | 'light' | 'time';

interface FlatRow {
  id: string;
  rowId: number;
  sensor: string;
  sensorKey: 'temperature' | 'humidity' | 'light';
  value: string;
  unit: string;
  time: string;
  statusLabel: string;
  isNormal: boolean;
}

function expandRecord(row: SensorRecord): FlatRow[] {
  const time = row.timestamp ? new Date(row.timestamp).toLocaleString('vi-VN') : '';
  const sensors: { key: 'temperature' | 'humidity' | 'light'; label: string; unit: string; value: number | undefined; statusLabel: string }[] = [
    { key: 'temperature', label: 'Nhiệt độ', unit: '°C', value: row.temperature, statusLabel: row.tempStatus || 'Bình thường' },
    { key: 'humidity', label: 'Độ ẩm', unit: '%', value: row.humidity, statusLabel: row.humidStatus || 'Bình thường' },
    { key: 'light', label: 'Ánh sáng', unit: 'lux', value: row.light, statusLabel: row.lightStatus || 'Bình thường' },
  ];
  return sensors.map(({ key, label, unit, value, statusLabel }, sensorIndex) => {
    const v = value ?? 0;
    return {
      id: `${row.id}-${key}`,
      rowId: row.id * 3 + sensorIndex,
      sensor: label,
      sensorKey: key,
      value: key === 'light' ? String(v) : v.toFixed(1),
      unit,
      time,
      statusLabel: statusLabel,
      isNormal: statusLabel === 'Bình thường',
    };
  });
}

export const SensorHistoryView: React.FC = () => {
  const [data, setData] = useState<SensorRecord[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('all');
  const [searchValue, setSearchValue] = useState('');
  const [searchError, setSearchError] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});

  const fetchData = useCallback(async (page: number, filters: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await sensorApi.getList({ page, size: 10, ...filters } as any);
      if (res.success && res.data) {
        setData(res.data.content);
        setTotalElements(res.data.totalElements);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (e) {
      console.error('Error fetching sensor data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(currentPage, appliedFilters); }, [currentPage, appliedFilters, fetchData]);

  const applySearch = useCallback((mode: SearchMode, value: string) => {
    const v = value.trim();
    if (!v || mode === 'all') {
      setSearchError('');
      setAppliedFilters({});
      setCurrentPage(0);
      return;
    }
    if (mode === 'time') {
      const parsed = parseFlexibleDateTime(v);
      if (!parsed) { setSearchError('Định dạng không hợp lệ. VD: 2026/09/22 hoặc 2026/09/22 15:30'); return; }
      setSearchError('');
      setAppliedFilters({ from: parsed.isoFrom, to: parsed.isoTo });
      setCurrentPage(0);
      return;
    }
    const range = parseValueRange(v);
    if (!range) { setSearchError('Giá trị không hợp lệ. VD: 25 hoặc 24-26'); return; }
    setSearchError('');
    const filters: Record<string, string> = {};
    if (mode === 'temperature') { filters.minTemp = String(range.min); filters.maxTemp = String(range.max); }
    else if (mode === 'humidity') { filters.minHumid = String(range.min); filters.maxHumid = String(range.max); }
    else if (mode === 'light') { filters.minLight = String(range.min); filters.maxLight = String(range.max); }
    setAppliedFilters(filters);
    setCurrentPage(0);
  }, []);

  const handleSearch = () => applySearch(searchMode, searchValue);

  const handleReset = () => {
    setSearchMode('all'); setSearchValue(''); setSearchError('');
    setAppliedFilters({}); setCurrentPage(0);
  };

  const handleModeChange = (mode: SearchMode) => {
    setSearchMode(mode); setSearchValue(''); setSearchError('');
    if (mode === 'all') { setAppliedFilters({}); setCurrentPage(0); }
  };

  const flatRows: FlatRow[] = data.flatMap((r) => expandRecord(r)).filter((row) => {
    if (searchMode === 'temperature') return row.sensorKey === 'temperature';
    if (searchMode === 'humidity') return row.sensorKey === 'humidity';
    if (searchMode === 'light') return row.sensorKey === 'light';
    return true;
  });

  const placeholderMap: Record<SearchMode, string> = {
    all: 'Hiển thị tất cả dữ liệu',
    temperature: 'VD: 25  hoặc  24-26',
    humidity: 'VD: 60  hoặc  55-65',
    light: 'VD: 300  hoặc  200-400',
    time: 'VD: 2026/09/22  hoặc  2026/09/22 15:30',
  };
  const iconMap: Record<SearchMode, string> = {
    all: 'apps', temperature: 'device_thermostat', humidity: 'humidity_percentage', light: 'light_mode', time: 'schedule',
  };
  const labelMap: Record<SearchMode, string> = {
    all: 'Tất cả', temperature: 'Nhiệt độ', humidity: 'Độ ẩm', light: 'Ánh sáng', time: 'Thời gian',
  };
  const hintMap: Record<SearchMode, string> = {
    all: '', temperature: '', humidity: '', light: '', time: '',
  };
  const sensorIcon: Record<string, string> = { temperature: 'device_thermostat', humidity: 'humidity_percentage', light: 'light_mode' };
  const sensorColor: Record<string, string> = { temperature: 'text-[#ec6f9e]', humidity: 'text-[#964261]', light: 'text-[#d87d9a]' };

  return (
    <div className="max-w-7xl mx-auto w-full h-full flex flex-col space-y-6 overflow-hidden">
      <div className="shrink-0">
        <h2 className="text-[32px] md:text-[36px] font-bold text-[#22191d] tracking-tight mb-1">Lịch sử cảm biến</h2>
        <p className="text-[16px] text-[#554247]">Xem và tra cứu dữ liệu cảm biến đã ghi nhận từ thiết bị.</p>
      </div>
      <div className="bg-white rounded-[20px] p-4 md:p-5 shadow-sm border border-[#efdee4] shrink-0">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 w-[155px]">
            <label className="text-[11px] font-semibold text-[#554247]">Tìm kiếm theo</label>
            <div className="relative">
              <select value={searchMode} onChange={(e) => handleModeChange(e.target.value as SearchMode)}
                className="w-full pl-2.5 pr-7 py-2 bg-white border-2 border-[#efdee4] rounded-xl focus:border-[#ec6f9e] focus:outline-none text-[13px] text-[#22191d] appearance-none transition-colors cursor-pointer">
                <option value="all">Tất cả</option>
                <option value="temperature">Nhiệt độ</option>
                <option value="humidity">Độ ẩm</option>
                <option value="light">Ánh sáng</option>
                <option value="time">Thời gian</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[#887177] pointer-events-none text-[18px]">expand_more</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
            <label className="text-[11px] font-semibold text-[#554247] flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#a33563]">{iconMap[searchMode]}</span>
              {labelMap[searchMode]}
              {hintMap[searchMode] && <span className="font-normal text-[#aaa] ml-1">- {hintMap[searchMode]}</span>}
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#887177] text-[18px]">search</span>
              <input type="text" value={searchValue} disabled={searchMode === 'all'}
                onChange={(e) => { setSearchValue(e.target.value); setSearchError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onBlur={handleSearch}
                placeholder={placeholderMap[searchMode]}
                className={`w-full pl-9 pr-3 py-2 border-2 rounded-xl focus:outline-none text-[13px] transition-colors placeholder-[#ccb8be] ${searchMode === 'all' ? 'bg-[#f9f4f5] border-[#efdee4] cursor-not-allowed text-[#aaa]'
                  : searchError ? 'bg-white border-red-400 focus:border-red-500 text-[#22191d]'
                    : 'bg-white border-[#efdee4] focus:border-[#ec6f9e] text-[#22191d]'}`} />
            </div>
            {searchError && (
              <p className="text-[10px] text-red-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">error</span>{searchError}
              </p>
            )}
          </div>
          <div className="flex gap-2 pb-0.5">
            <button onClick={handleReset}
              className="bg-[#f5e4ea] hover:bg-[#efdee4] text-[#22191d] px-3.5 py-2 rounded-xl font-semibold text-[13px] transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap">
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Đặt lại
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-[20px] shadow-sm flex flex-col border border-[#efdee4] flex-1 min-h-0 overflow-hidden">
        <div className="py-2.5 px-4 md:px-5 border-b border-[#efdee4] flex flex-wrap items-center justify-between gap-3 bg-[#fff8f8] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#fbe9f0] w-7 h-7 rounded-full flex items-center justify-center text-[#a33563]">
              <span className="material-symbols-outlined text-[16px]">table_rows</span>
            </div>
            <h3 className="text-[16px] font-bold text-[#22191d]">Dữ liệu cảm biến</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-medium text-[#554247]">Tổng bản ghi</span>
            <span className="text-[14px] font-bold text-[#a33563]">
              {(searchMode === 'all' || searchMode === 'time') ? (totalElements * 3).toLocaleString() : totalElements.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="overflow-auto custom-scrollbar flex-1 min-h-0">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead className="sticky top-0 z-10 shadow-[0_1px_0_#efdee4]">
              <tr className="bg-[#fff0f5]">
                <th className="py-3 px-5 text-[13px] font-semibold text-[#554247]">ID</th>
                <th className="py-3 px-5 text-[13px] font-semibold text-[#554247]">Cảm biến</th>
                <th className="py-3 px-5 text-[13px] font-semibold text-[#554247]">Giá trị</th>
                <th className="py-3 px-5 text-[13px] font-semibold text-[#554247]">Đơn vị</th>
                <th className="py-3 px-5 text-[13px] font-semibold text-[#554247]">Thời gian</th>
                <th className="py-3 px-5 text-[13px] font-semibold text-[#554247] text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efdee4]">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-[#887177]">
                  <span className="material-symbols-outlined animate-spin text-[28px]">progress_activity</span>
                </td></tr>
              ) : flatRows.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-[#887177] text-[14px]">
                  Chưa có dữ liệu. Hãy đảm bảo thiết bị đã kết nối và gửi dữ liệu.
                </td></tr>
              ) : (
                flatRows.map((row) => (
                  <tr key={row.id} className="hover:bg-[#fff8f8] transition-colors">
                    <td className="py-3 px-5 text-[13px] text-[#887177] font-mono">#{row.rowId}</td>
                    <td className="py-3 px-5">
                      <span className={`flex items-center gap-2 text-[13px] font-semibold ${sensorColor[row.sensorKey] || 'text-[#22191d]'}`}>
                        <span className="material-symbols-outlined text-[17px]">{sensorIcon[row.sensorKey]}</span>
                        {row.sensor}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-[15px] font-bold text-[#22191d]">{row.value}</td>
                    <td className="py-3 px-5 text-[13px] text-[#554247]">{row.unit}</td>
                    <td className="py-3 px-5 text-[13px] text-[#554247] font-mono">{row.time}</td>
                    <td className="py-3 px-5 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-[11px] font-semibold ${row.isNormal ? 'bg-emerald-50 text-emerald-700'
                        : row.statusLabel.includes('cao') ? 'bg-red-50 text-red-600'
                          : 'bg-amber-50 text-amber-700'}`}>
                        <span className="material-symbols-outlined text-[13px]">
                          {row.isNormal ? 'check_circle' : row.statusLabel.includes('cao') ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                        {row.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#efdee4] flex justify-between items-center bg-[#fff8f8] shrink-0">
          <span className="text-[12px] text-[#554247]">Trang {currentPage + 1} / {totalPages} &bull; hiển thị {flatRows.length} dòng</span>
          <div className="flex gap-1.5 items-center">
            <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}
              className="p-1 rounded-lg border border-[#efdee4] hover:bg-white text-[#554247] disabled:opacity-40 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
              return (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${p === currentPage ? 'bg-[#a33563] text-white' : 'border border-[#efdee4] text-[#554247] hover:bg-white'}`}>
                  {p + 1}
                </button>
              );
            })}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
              className="p-1 rounded-lg border border-[#efdee4] hover:bg-white text-[#554247] disabled:opacity-40 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
