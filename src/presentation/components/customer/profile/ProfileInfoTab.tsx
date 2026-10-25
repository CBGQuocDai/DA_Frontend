'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { User } from '@/src/shared/types';
import { FormNotice, ProfileField, SubmitButton, TabHeader, profileInputClass, type FormMessage } from './ProfileParts';

const GENDERS = ['Nam', 'Nữ', 'Khác'] as const;
const MESSAGE_TIMEOUT_MS = 3000;
// There is no update-profile endpoint yet, so saving is simulated
const SIMULATED_SAVE_MS = 600;

export const ProfileInfoTab: React.FC<{ user: User }> = ({ user }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [gender, setGender] = useState<string>('');
  const [birthDate, setBirthDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    later(() => {
      setIsSaving(false);
      setMessage({ type: 'success', text: 'Cập nhật thông tin cá nhân thành công!' });
      later(() => setMessage(null), MESSAGE_TIMEOUT_MS);
    }, SIMULATED_SAVE_MS);
  };

  const handleReset = () => {
    setFullName(user.fullName);
    setPhone(user.phone ?? '');
  };

  return (
    <div className="space-y-6">
      <TabHeader
        eyebrow="Tài khoản của tôi"
        title="Thông tin profile"
        description="Quản lý thông tin hồ sơ để bảo mật và tối ưu trải nghiệm đọc sách"
      />

      {message && <FormNotice message={message} />}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ProfileField label="Họ và tên" required>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Nhập họ và tên"
              className={profileInputClass}
            />
          </ProfileField>

          <ProfileField label="Địa chỉ Email">
            <input type="email" value={user.email} disabled className={profileInputClass} />
          </ProfileField>

          <ProfileField label="Số điện thoại">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
              className={profileInputClass}
            />
          </ProfileField>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">Giới tính</span>
            <div className="flex items-center gap-4 pt-2">
              {GENDERS.map((item) => (
                <label key={item} className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="radio"
                    name="gender"
                    value={item}
                    checked={gender === item}
                    onChange={(e) => setGender(e.target.value)}
                    className="text-accent focus:ring-rose-500"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <ProfileField label="Ngày sinh">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={profileInputClass}
            />
          </ProfileField>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Đặt lại
          </button>
          <SubmitButton isLoading={isSaving} loadingText="Đang lưu...">
            Lưu thay đổi
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};
