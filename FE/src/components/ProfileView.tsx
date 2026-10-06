import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onUpdateProfile,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile>({ ...userProfile });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editForm);
    setShowEditModal(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      setPasswordSuccess(true);
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-[32px] md:text-[36px] font-bold text-[#22191d] tracking-tight mb-1">
          Thông tin cá nhân
        </h2>
        <p className="text-[16px] text-[#554247]">
          Quản lý tài khoản và thông tin sinh viên.
        </p>
      </div>

      {/* Profile Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Identity Card (full width) */}
        <div className="md:col-span-12 bg-white rounded-[24px] p-6 lg:p-8 card-shadow relative overflow-hidden border border-[#efdee4]">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start z-10 relative">
            {/* Avatar container */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-[28px] bg-[#f5e4ea] shadow-inner overflow-hidden border-4 border-white p-1">
                <div className="w-full h-full rounded-[20px] bg-[#ffd9e3] flex items-center justify-center overflow-hidden">
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(true)}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#a33563] hover:bg-[#841c4b] text-white rounded-xl flex items-center justify-center shadow-md transition-all cursor-pointer"
                title="Thay đổi thông tin"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </button>
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbe9f0] text-[#792b4a] text-[12px] font-semibold mb-2.5">
                <span className="w-2 h-2 rounded-full bg-[#a33563] animate-pulse"></span>
                <span>{userProfile.status}</span>
              </div>

              <h3 className="text-[32px] lg:text-[36px] font-bold text-[#22191d] tracking-tight leading-tight">
                {userProfile.name}
              </h3>

              {/* <p className="text-[16px] text-[#a33563] font-medium flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <span className="material-symbols-outlined text-[18px]">badge</span>
                <span>{userProfile.title}</span>
              </p> */}

              <div className="mt-5 flex flex-wrap gap-3 justify-center sm:justify-start">
                <button
                  onClick={() => {
                    setEditForm({ ...userProfile });
                    setShowEditModal(true);
                  }}
                  className="bg-[#a33563] hover:bg-[#841c4b] text-white text-[14px] font-semibold px-5 py-2.5 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  Cập nhật hồ sơ
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-[#f5e4ea] hover:bg-[#efdee4] text-[#a33563] text-[14px] font-semibold px-5 py-2.5 rounded-xl transition-colors border border-[#dbc0c6]/60 cursor-pointer"
                >
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Details Grid (12 cols) */}
        <div className="md:col-span-12 bg-white rounded-[24px] p-6 lg:p-8 card-shadow border border-[#efdee4]">
          <h4 className="text-[20px] font-bold text-[#22191d] mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#a33563] text-[22px]">info</span>
            <span>Thông tin chi tiết</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Detail Item: Họ và tên */}
            <div className="group">
              <span className="text-[12px] font-semibold text-[#887177] block mb-1">
                Họ và tên
              </span>
              <div className="text-[15px] font-medium text-[#22191d] bg-[#fff8f8] px-4 py-3 rounded-xl border border-[#efdee4] group-hover:border-[#ec6f9e] transition-colors">
                {userProfile.name}
              </div>
            </div>

            {/* Detail Item: Mã sinh viên */}
            <div className="group">
              <span className="text-[12px] font-semibold text-[#887177] block mb-1">
                Mã sinh viên
              </span>
              <div className="text-[15px] font-medium text-[#22191d] bg-[#fff8f8] px-4 py-3 rounded-xl border border-[#efdee4] group-hover:border-[#ec6f9e] transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#887177]">pin</span>
                <span>{userProfile.studentId}</span>
              </div>
            </div>

            {/* Detail Item: Lớp */}
            <div className="group">
              <span className="text-[12px] font-semibold text-[#887177] block mb-1">Lớp</span>
              <div className="text-[15px] font-medium text-[#22191d] bg-[#fff8f8] px-4 py-3 rounded-xl border border-[#efdee4] group-hover:border-[#ec6f9e] transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#887177]">class</span>
                <span>{userProfile.class}</span>
              </div>
            </div>

            {/* Detail Item: Email */}
            <div className="group sm:col-span-2 lg:col-span-1">
              <span className="text-[12px] font-semibold text-[#887177] block mb-1">Email</span>
              <div className="text-[15px] font-medium text-[#22191d] bg-[#fff8f8] px-4 py-3 rounded-xl border border-[#efdee4] group-hover:border-[#ec6f9e] transition-colors flex items-center gap-2 truncate">
                <span className="material-symbols-outlined text-[18px] text-[#887177]">mail</span>
                <span className="truncate">{userProfile.email}</span>
              </div>
            </div>

            {/* Link GitHub */}
            <div className="group">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[12px] font-semibold text-[#887177]">Link GitHub</span>
                {copiedLink === 'github' && (
                  <span className="text-[11px] text-[#a33563] font-bold">Đã sao chép!</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(`https://${userProfile.githubUrl}`, 'github')}
                className="w-full text-left text-[14px] font-medium text-[#22191d] bg-[#fff8f8] px-4 py-3 rounded-xl border border-[#efdee4] hover:border-[#a33563] transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="material-symbols-outlined text-[18px] text-[#887177]">code</span>
                  <span className="truncate">{userProfile.githubUrl}</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#887177]">content_copy</span>
              </button>
            </div>

            {/* Link Figma */}
            <div className="group">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[12px] font-semibold text-[#887177]">Link Figma</span>
                {copiedLink === 'figma' && (
                  <span className="text-[11px] text-[#a33563] font-bold">Đã sao chép!</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(`https://${userProfile.figmaUrl}`, 'figma')}
                className="w-full text-left text-[14px] font-medium text-[#22191d] bg-[#fff8f8] px-4 py-3 rounded-xl border border-[#efdee4] hover:border-[#a33563] transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="material-symbols-outlined text-[18px] text-[#887177]">draw</span>
                  <span className="truncate">{userProfile.figmaUrl}</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#887177]">content_copy</span>
              </button>
            </div>

            {/* Link Postman */}
            <div className="group">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[12px] font-semibold text-[#887177]">Link Postman</span>
                {copiedLink === 'postman' && (
                  <span className="text-[11px] text-[#a33563] font-bold">Đã sao chép!</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(`https://${userProfile.postmanUrl}`, 'postman')}
                className="w-full text-left text-[14px] font-medium text-[#22191d] bg-[#fff8f8] px-4 py-3 rounded-xl border border-[#efdee4] hover:border-[#a33563] transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="material-symbols-outlined text-[18px] text-[#887177]">api</span>
                  <span className="truncate">{userProfile.postmanUrl}</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#887177]">content_copy</span>
              </button>
            </div>

            {/* Link Báo cáo */}
            <div className="group">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[12px] font-semibold text-[#887177]">Link Báo cáo</span>
                {copiedLink === 'report' && (
                  <span className="text-[11px] text-[#a33563] font-bold">Đã sao chép!</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(userProfile.reportUrl, 'report')}
                className="w-full text-left text-[14px] font-medium text-[#22191d] bg-[#fff8f8] px-4 py-3 rounded-xl border border-[#efdee4] hover:border-[#a33563] transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="material-symbols-outlined text-[18px] text-[#887177]">
                    description
                  </span>
                  <span className="truncate">{userProfile.reportUrl}</span>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#887177]">download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#efdee4] max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#efdee4]">
              <h3 className="font-bold text-[18px] text-[#a33563]">Cập nhật thông tin sinh viên</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-[#887177] hover:text-[#22191d]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-[14px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#554247] font-medium mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full border border-[#dbc0c6] rounded-xl px-3 py-2 text-[#22191d] focus:outline-none focus:border-[#ec6f9e]"
                  />
                </div>
                {/* <div>
                  <label className="block text-[#554247] font-medium mb-1">Chức danh / Nghề nghiệp</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full border border-[#dbc0c6] rounded-xl px-3 py-2 text-[#22191d] focus:outline-none focus:border-[#ec6f9e]"
                  />
                </div> */}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#554247] font-medium mb-1">Mã sinh viên</label>
                  <input
                    type="text"
                    required
                    value={editForm.studentId}
                    onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })}
                    className="w-full border border-[#dbc0c6] rounded-xl px-3 py-2 text-[#22191d] focus:outline-none focus:border-[#ec6f9e]"
                  />
                </div>
                <div>
                  <label className="block text-[#554247] font-medium mb-1">Lớp</label>
                  <input
                    type="text"
                    required
                    value={editForm.class}
                    onChange={(e) => setEditForm({ ...editForm, class: e.target.value })}
                    className="w-full border border-[#dbc0c6] rounded-xl px-3 py-2 text-[#22191d] focus:outline-none focus:border-[#ec6f9e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#554247] font-medium mb-1">Email sinh viên</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border border-[#dbc0c6] rounded-xl px-3 py-2 text-[#22191d] focus:outline-none focus:border-[#ec6f9e]"
                />
              </div>

              <div>
                <label className="block text-[#554247] font-medium mb-1">Link GitHub</label>
                <input
                  type="text"
                  value={editForm.githubUrl}
                  onChange={(e) => setEditForm({ ...editForm, githubUrl: e.target.value })}
                  className="w-full border border-[#dbc0c6] rounded-xl px-3 py-2 text-[#22191d] focus:outline-none focus:border-[#ec6f9e]"
                />
              </div>

              <div>
                <label className="block text-[#554247] font-medium mb-1">Link Figma</label>
                <input
                  type="text"
                  value={editForm.figmaUrl}
                  onChange={(e) => setEditForm({ ...editForm, figmaUrl: e.target.value })}
                  className="w-full border border-[#dbc0c6] rounded-xl px-3 py-2 text-[#22191d] focus:outline-none focus:border-[#ec6f9e]"
                />
              </div>

              <div>
                <label className="block text-[#554247] font-medium mb-1">Link Postman</label>
                <input
                  type="text"
                  value={editForm.postmanUrl}
                  onChange={(e) => setEditForm({ ...editForm, postmanUrl: e.target.value })}
                  className="w-full border border-[#dbc0c6] rounded-xl px-3 py-2 text-[#22191d] focus:outline-none focus:border-[#ec6f9e]"
                />
              </div>

              <div>
                <label className="block text-[#554247] font-medium mb-1">Tên file Báo cáo đồ án</label>
                <input
                  type="text"
                  value={editForm.reportUrl}
                  onChange={(e) => setEditForm({ ...editForm, reportUrl: e.target.value })}
                  className="w-full border border-[#dbc0c6] rounded-xl px-3 py-2 text-[#22191d] focus:outline-none focus:border-[#ec6f9e]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#efdee4]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#554247] hover:bg-[#f5e4ea]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-[#a33563] hover:bg-[#841c4b] text-white px-5 py-2 rounded-xl text-[13px] font-semibold"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#efdee4]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#efdee4]">
              <h3 className="font-bold text-[18px] text-[#a33563]">Đổi mật khẩu tài khoản</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-[#887177] hover:text-[#22191d]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {passwordSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-[24px]">check</span>
                </div>
                <p className="font-bold text-[15px] text-[#22191d]">Đổi mật khẩu thành công!</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 text-[14px]">
                <div>
                  <label className="block text-[#554247] font-medium mb-1">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border border-[#dbc0c6] rounded-xl px-3 py-2 text-[#22191d] focus:outline-none focus:border-[#ec6f9e]"
                  />
                </div>
                <div>
                  <label className="block text-[#554247] font-medium mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-[#dbc0c6] rounded-xl px-3 py-2 text-[#22191d] focus:outline-none focus:border-[#ec6f9e]"
                  />
                </div>
                <div>
                  <label className="block text-[#554247] font-medium mb-1">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-[#dbc0c6] rounded-xl px-3 py-2 text-[#22191d] focus:outline-none focus:border-[#ec6f9e]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#efdee4]">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#554247] hover:bg-[#f5e4ea]"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="bg-[#a33563] hover:bg-[#841c4b] text-white px-4 py-2 rounded-xl text-[13px] font-semibold"
                  >
                    Cập nhật mật khẩu
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
