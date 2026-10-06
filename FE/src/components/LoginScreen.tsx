import React, { useState } from 'react';
import { authApi } from '../api';

interface LoginScreenProps {
  onLoginSuccess: (userData: Record<string, string>) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(username, password);
      if (res.success && res.data) {
        onLoginSuccess(res.data as unknown as Record<string, string>);
      } else {
        setError(res.message || 'Dang nhap that bai');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Khong the ket noi server');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('admin');
    setPassword('admin123');
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login('admin', 'admin123');
      if (res.success && res.data) {
        onLoginSuccess(res.data as unknown as Record<string, string>);
      } else {
        setError(res.message || 'Dang nhap that bai');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Khong the ket noi server. Hay khoi dong Spring Boot BE truoc!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row overflow-hidden bg-[#fff8f8]">
      {/* LEFT PANEL: Illustrations & Branding (Hidden on Mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-[#fff0f5] relative flex-col justify-center items-center p-12 overflow-hidden">
        {/* Decorative Ambient Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#ffd9e3] rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse"></div>
          <div className="absolute top-1/2 right-0 transform translate-x-1/3 -translate-y-1/2 w-[480px] h-[480px] bg-[#ffd9e2] rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-[#ffb0c9] rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        </div>

        {/* Central Composition Area */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          {/* Playful Icon Cluster */}
          <div className="relative w-64 h-64 mb-8">
            {/* Main central shape */}
            <div className="absolute inset-0 bg-white rounded-[40px] shadow-sm flex flex-col items-center justify-center transform rotate-2 floating-icon border border-[#efdee4]">
              <div className="flex items-center gap-2 text-[#ec6f9e]">
                <span
                  className="material-symbols-outlined text-[72px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  thermostat
                </span>
                <span
                  className="material-symbols-outlined text-[72px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  lightbulb
                </span>
              </div>
            </div>

            {/* Floating auxiliary icons */}
            <div className="absolute -top-3 -right-6 bg-white p-2.5 rounded-full shadow-md floating-icon-delayed text-[#fe97b9] border border-[#efdee4]">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                cloud
              </span>
            </div>
            <div className="absolute bottom-6 -left-8 bg-white p-2 rounded-full shadow-md floating-icon-fast text-[#d87d9a] border border-[#efdee4]">
              <span className="material-symbols-outlined text-3xl">wifi</span>
            </div>
            <div className="absolute top-1/2 -right-10 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md floating-icon text-[#a33563] border border-[#efdee4]">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                sensors
              </span>
            </div>

            {/* Sparkles */}
            <div className="absolute top-6 left-2 text-[#ec6f9e] floating-icon-delayed opacity-80">
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
            </div>
            <div className="absolute -bottom-3 right-10 text-[#a33563] floating-icon-fast opacity-60">
              <span className="material-symbols-outlined text-xl">draw</span>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-[36px] lg:text-[40px] text-[#a33563] font-bold mb-2 tracking-tight">
              Smart Workspace
            </h2>
            <p className="text-[17px] text-[#554247] max-w-md leading-relaxed">
              Giám sát môi trường thông minh, mang lại không gian sống và làm việc hoàn hảo.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Login Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 sm:p-10 bg-[#fff8f8] relative z-10">
        {/* Mobile ambient blob */}
        <div className="md:hidden absolute top-0 right-0 w-64 h-64 bg-[#ffd9e3] rounded-full filter blur-3xl opacity-35 -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

        <div className="w-full max-w-md bg-white rounded-[24px] shadow-lg p-8 sm:p-10 relative z-20 border border-[#dbc0c6]/40">
          {/* Header Section */}
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-[20px] bg-[#fbe9f0] flex items-center justify-center mb-4 border-2 border-[#efdee4] shadow-sm text-[#a33563]">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                nest_eco_leaf
              </span>
            </div>
            <h1 className="text-[24px] font-bold text-[#a33563] mb-1">
              Chào mừng bạn trở lại ♡
            </h1>
            <p className="text-[14px] text-[#554247]">
              Đăng nhập để theo dõi hệ thống IoT của bạn
            </p>
          </div>

          {/* Form */}
          <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#22191d]" htmlFor="login-email">
                Email đăng nhập
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887177] text-[20px] group-focus-within:text-[#a33563] transition-colors">
                  mail
                </span>
                <input
                  id="login-email"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-white border-2 border-[#dbc0c6]/70 rounded-xl py-2.5 pl-11 pr-3.5 text-[#22191d] text-[15px] placeholder:text-[#887177]/70 focus:outline-none focus:border-[#ec6f9e] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[13px] font-semibold text-[#22191d]" htmlFor="login-password">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[12px] font-medium text-[#a33563] hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887177] text-[20px] group-focus-within:text-[#a33563] transition-colors">
                  lock
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-[#dbc0c6]/70 rounded-xl py-2.5 pl-11 pr-11 text-[#22191d] text-[15px] placeholder:text-[#887177]/70 focus:outline-none focus:border-[#ec6f9e] transition-colors"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#887177] hover:text-[#22191d] p-1 rounded-full transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded text-[#ec6f9e] accent-[#ec6f9e] focus:ring-[#ec6f9e] border-[#dbc0c6]"
                />
                <span className="text-[13px] text-[#22191d]">Nhớ đăng nhập</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="submit-login-btn"
                type="submit"
                className="w-full bg-[#ec6f9e] hover:bg-[#e45b8e] active:scale-[0.99] text-white font-semibold text-[15px] py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 cursor-pointer"
              >
                <span>Đăng nhập</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#efdee4]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[17px] text-[#a33563]">Khôi phục mật khẩu</h3>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="text-[#887177] hover:text-[#22191d]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {forgotSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-[#e8f5e9] text-[#2e7d32] mx-auto flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">mark_email_read</span>
                </div>
                <p className="text-[14px] text-[#22191d] font-semibold mb-1">Đã gửi hướng dẫn!</p>
                <p className="text-[12px] text-[#554247] mb-4">
                  Kiem tra hom thu {forgotEmail || username} de dat lai mat khau cua ban.
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="bg-[#ec6f9e] text-white px-4 py-2 rounded-xl text-[13px] font-semibold"
                >
                  Xác nhận
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSent(true);
                }}
                className="space-y-4"
              >
                <p className="text-[13px] text-[#554247]">
                  Nhập địa chỉ email đã đăng ký của bạn để nhận liên kết đặt lại mật khẩu.
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Nhập email của bạn..."
                  className="w-full bg-white border border-[#dbc0c6] rounded-xl px-3 py-2 text-[14px] focus:outline-none focus:border-[#ec6f9e]"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-[13px] text-[#554247] hover:bg-[#f5e4ea]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="bg-[#ec6f9e] text-white px-4 py-2 rounded-xl text-[13px] font-semibold hover:bg-[#e45b8e]"
                  >
                    Gửi liên kết
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
