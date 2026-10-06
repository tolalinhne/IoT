import React, { useState, useEffect, useCallback } from 'react';
import { historyApi, ActionLogRecord } from '../api';

// Format Date as local datetime string (no UTC conversion) to match backend LocalDateTime
function toLocalISOString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// Parse flexible datetime: yyyy/mm/dd hh:mm:ss
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

function formatTimestamp(ts: string): string {
  if (!ts) return '';
  try { return new Date(ts).toLocaleString('vi-VN'); } catch { return ts; }
}

const STATUS_MAP: Record<string, { label: string; badge: string; icon: string }> = {
  success: { label: 'Thành công', badge: 'bg-emerald-50 text-emerald-700', icon: 'check_circle' },
  loading: { label: 'Đang xử lý', badge: 'bg-amber-50  text-amber-700', icon: 'pending' },
  failed: { label: 'Thất bại', badge: 'bg-red-50    text-red-600', icon: 'cancel' },
};

export const DeviceHistoryView: React.FC = () => {
  const [data, setData] = useState<ActionLogRecord[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [searchTime, setSearchTime] = useState('');
  const [searchTimeError, setSearchTimeError] = useState('');
  const [deviceKey, setDeviceKey] = useState('');
  const [action, setAction] = useState('');
  const [status, setStatus] = useState('');

  const [applied, setApplied] = useState<Record<string, string>>({});

  const fetchData = useCallback(async (page: number, filters: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await historyApi.getList({
        page, size: 10,
        deviceKey: filters.deviceKey,
        action: filters.action,
        status: filters.status,
        from: filters.from,
        to: filters.to,
      });
      if (res.success && res.data) {
        setData(res.data.content);
        setTotalElements(res.data.totalElements);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentPage, applied);
  }, [currentPage, applied, fetchData]);

  const buildAndApply = (overrides: Record<string, string> = {}) => {
    const f: Record<string, string> = {};
    const dk = overrides.deviceKey !== undefined ? overrides.deviceKey : deviceKey;
    const ac = overrides.action !== undefined ? overrides.action : action;
    const st = overrides.status !== undefined ? overrides.status : status;
    const st2 = overrides.searchTime !== undefined ? overrides.searchTime : searchTime;
    if (dk) f.deviceKey = dk;
    if (ac) f.action = ac;
    if (st) f.status = st;
    if (st2.trim()) {
      const parsed = parseFlexibleDateTime(st2);
      if (!parsed) { setSearchTimeError('Định dạng không hợp lệ. VD: 2026/09/22 hoặc 2026/09/22 15:30'); return; }
      setSearchTimeError('');
      f.from = parsed.isoFrom;
      f.to = parsed.isoTo;
    } else {
      setSearchTimeError('');
    }
    setApplied(f);
    setCurrentPage(0);
  };

  const handleDropdownChange = (field: string, value: string) => {
    if (field === 'deviceKey') setDeviceKey(value);
    if (field === 'action') setAction(value);
    if (field === 'status') setStatus(value);
    buildAndApply({ [field]: value });
  };

  const handleTimeSearch = () => buildAndApply();

  const handleReset = () => {
    setSearchTime(''); setSearchTimeError('');
    setDeviceKey(''); setAction(''); setStatus('');
    setApplied({});
    setCurrentPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto w-full h-full flex flex-col space-y-6 overflow-hidden">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-[32px] md:text-[36px] font-bold text-[#22191d] tracking-tight mb-1">
          Lịch sử bật/tắt
        </h1>
        <p className="text-[16px] text-[#554247]">
          Tra cứu lịch sử điều khiển thiết bị qua MQTT.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-[20px] p-4 md:p-5 shadow-sm border border-[#efdee4] shrink-0">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Time search — grows to fill available space */}
          <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
            <label className="text-[11px] font-semibold text-[#554247]">
              Thời gian
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#887177] text-[18px]">search</span>
              <input
                type="text"
                value={searchTime}
                onChange={(e) => { setSearchTime(e.target.value); setSearchTimeError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleTimeSearch()}
                onBlur={handleTimeSearch}
                placeholder="VD: 2026/09/22 15:30:30"
                className={`w-full pl-9 pr-3 py-2 bg-white border-2 rounded-xl focus:outline-none text-[13px] text-[#22191d] transition-colors placeholder-[#ccb8be] ${searchTimeError ? 'border-red-400' : 'border-[#efdee4] focus:border-[#ec6f9e]'
                  }`}
              />
            </div>
            {searchTimeError && (
              <p className="text-[10px] text-red-500">{searchTimeError}</p>
            )}
          </div>

          {/* Device */}
          <div className="flex flex-col gap-1 w-[130px]">
            <label className="text-[11px] font-semibold text-[#554247]">Thiết bị</label>
            <div className="relative">
              <select value={deviceKey} onChange={(e) => handleDropdownChange('deviceKey', e.target.value)}
                className="w-full pl-2.5 pr-7 py-2 bg-white border-2 border-[#efdee4] rounded-xl focus:border-[#ec6f9e] focus:outline-none text-[13px] text-[#22191d] appearance-none transition-colors">
                <option value="">Tất cả</option>
                <option value="LED1">LED 01</option>
                <option value="LED2">LED 02</option>
                <option value="LED3">LED 03</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[#887177] pointer-events-none text-[18px]">expand_more</span>
            </div>
          </div>

          {/* Action */}
          <div className="flex flex-col gap-1 w-[120px]">
            <label className="text-[11px] font-semibold text-[#554247]">Hành động</label>
            <div className="relative">
              <select value={action} onChange={(e) => handleDropdownChange('action', e.target.value)}
                className="w-full pl-2.5 pr-7 py-2 bg-white border-2 border-[#efdee4] rounded-xl focus:border-[#ec6f9e] focus:outline-none text-[13px] text-[#22191d] appearance-none transition-colors">
                <option value="">Tất cả</option>
                <option value="ON">Bật</option>
                <option value="OFF">Tắt</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[#887177] pointer-events-none text-[18px]">expand_more</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1 w-[140px]">
            <label className="text-[11px] font-semibold text-[#554247]">Trạng thái</label>
            <div className="relative">
              <select value={status} onChange={(e) => handleDropdownChange('status', e.target.value)}
                className="w-full pl-2.5 pr-7 py-2 bg-white border-2 border-[#efdee4] rounded-xl focus:border-[#ec6f9e] focus:outline-none text-[13px] text-[#22191d] appearance-none transition-colors">
                <option value="">Tất cả</option>
                <option value="success">Thành công</option>
                <option value="loading">Đang xử lý</option>
                <option value="failed">Thất bại</option>
              </select>
              <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[#887177] pointer-events-none text-[18px]">expand_more</span>
            </div>
          </div>

          {/* Reset Button only */}
          <div className="flex gap-2 pb-0.5">
            <button onClick={handleReset}
              className="bg-[#f5e4ea] hover:bg-[#efdee4] text-[#22191d] px-3.5 py-2 rounded-xl font-semibold text-[13px] transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap">
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] shadow-sm flex flex-col border border-[#efdee4] flex-1 min-h-0 overflow-hidden">
        <div className="py-2.5 px-4 md:px-5 border-b border-[#efdee4] flex flex-wrap items-center justify-between gap-3 bg-[#fff8f8] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#fbe9f0] w-7 h-7 rounded-full flex items-center justify-center text-[#a33563]">
              <span className="material-symbols-outlined text-[16px]">history</span>
            </div>
            <h3 className="text-[16px] font-bold text-[#22191d]">Lịch sử hoạt động</h3>
          </div>
          <span className="text-[14px] font-bold text-[#a33563]">{totalElements.toLocaleString()} bản ghi</span>
        </div>

        <div className="overflow-auto custom-scrollbar flex-1 min-h-0">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead className="sticky top-0 z-10 shadow-[0_1px_0_#efdee4]">
              <tr className="bg-[#fff0f5]">
                <th className="py-3 px-5 text-[13px] font-semibold text-[#554247]">ID</th>
                <th className="py-3 px-5 text-[13px] font-semibold text-[#554247]">Thiết bị</th>
                <th className="py-3 px-5 text-[13px] font-semibold text-[#554247]">Hành động</th>
                <th className="py-3 px-5 text-[13px] font-semibold text-[#554247]">Trạng thái</th>
                <th className="py-3 px-5 text-[13px] font-semibold text-[#554247]">User</th>
                <th className="py-3 px-5 text-[13px] font-semibold text-[#554247]">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efdee4]">
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-[#887177]">
                  <span className="material-symbols-outlined animate-spin text-[28px]">progress_activity</span>
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-[#887177] text-[14px]">
                  Chưa có lịch sử điều khiển thiết bị.
                </td></tr>
              ) : (
                data.map((row) => {
                  const st = STATUS_MAP[row.status] ?? { label: row.status, badge: 'bg-gray-100 text-gray-600', icon: 'help' };
                  return (
                    <tr key={row.id} className="hover:bg-[#fff8f8] transition-colors">
                      <td className="py-3.5 px-5 text-[13px] text-[#887177] font-mono">#{row.id}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#ec6f9e] text-[16px]">lightbulb</span>
                          <div>
                            <div className="text-[14px] font-semibold text-[#22191d]">{row.deviceName}</div>
                            <div className="text-[11px] text-[#887177]">{row.deviceKey}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-[12px] font-semibold ${row.action === 'ON' ? 'bg-[#ffd9e3] text-[#a33563]' : 'bg-[#efdee4] text-[#554247]'
                          }`}>
                          <span className="material-symbols-outlined text-[14px]">{row.action === 'ON' ? 'power' : 'power_off'}</span>
                          {row.action === 'ON' ? 'Bật' : 'Tắt'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-[12px] font-semibold ${st.badge}`}>
                          <span className="material-symbols-outlined text-[13px]">{st.icon}</span>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        {row.user ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#fbe9f0] flex items-center justify-center">
                              <span className="material-symbols-outlined text-[13px] text-[#a33563]">person</span>
                            </div>
                            <span className="text-[13px] text-[#22191d] font-medium">{row.user}</span>
                          </div>
                        ) : (
                          <span className="text-[12px] text-[#ccb8be] italic">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-[13px] text-[#554247] font-mono">{formatTimestamp(row.timestamp)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#efdee4] flex justify-between items-center bg-[#fff8f8] shrink-0">
          <span className="text-[12px] text-[#554247]">
            Trang {currentPage + 1} / {totalPages} &bull; hiển thị 10 dòng
          </span>
          <div className="flex gap-1.5 items-center">
            <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}
              className="p-1 rounded-lg border border-[#efdee4] hover:bg-white text-[#554247] disabled:opacity-40 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
              return (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-all cursor-pointer ${p === currentPage ? 'bg-[#a33563] text-white' : 'border border-[#efdee4] text-[#554247] hover:bg-white'
                    }`}>{p + 1}</button>
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
