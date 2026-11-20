'use client';

import { useRef } from 'react';
import { Camera, LoaderCircle } from 'lucide-react';
import type { User } from '@/src/shared/types';
import { useCustomerAvatar } from '@/src/presentation/hooks/customer/useCustomerAvatar';
import { CustomerAvatar } from '@/src/presentation/components/customer/common/CustomerAvatar';

export const ProfileAvatar = ({ user }: { user: User }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, isUploading, message } = useCustomerAvatar();

  return (
    <div className="mb-4" aria-busy={isUploading}>
      <div className="relative w-24 h-24 mx-auto">
        <CustomerAvatar user={user} className="w-24 h-24 rounded-2xl border-2 border-white shadow-lg shadow-accent/30 text-3xl" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          aria-label="Cập nhật ảnh đại diện"
          title="Cập nhật ảnh đại diện"
          className="absolute -bottom-2 -right-2 flex items-center justify-center w-9 h-9 rounded-full border-2 border-white bg-accent text-white shadow-md hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-70"
        >
          {isUploading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        aria-label="Chọn ảnh đại diện"
        disabled={isUploading}
        className="hidden"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          // Cho phép chọn lại cùng file nếu lần upload trước bị lỗi.
          event.currentTarget.value = '';
          if (file) void uploadAvatar(file);
        }}
      />
      <p className="mt-4 text-[11px] text-slate-500">
        {isUploading ? 'Đang cập nhật ảnh...' : 'JPG, PNG, WebP · Tối đa 5 MB'}
      </p>
      {message && (
        <p role={message.type === 'error' ? 'alert' : 'status'} className={`mt-2 text-xs ${message.type === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
};
