'use client';

import React, { useState } from 'react';

interface CaptionInputProps {
  value: string;
  placeholder: string;
  label: string;
  onChange: (value: string) => void;
}

/**
 * Ô chú thích của ảnh hoặc bảng đính kèm, in làm tiêu đề của mục đó trong file PDF người nghe xem.
 * Giữ bản nháp riêng để con trỏ không nhảy khi tài liệu cập nhật sau mỗi phím gõ, và nhận lại giá trị
 * khi nó đổi từ bên ngoài (hoàn tác).
 */
export const CaptionInput: React.FC<CaptionInputProps> = ({ value, placeholder, label, onChange }) => {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }

  return (
    <input
      type="text"
      value={draft}
      placeholder={placeholder}
      aria-label={label}
      spellCheck={false}
      onChange={(e) => {
        setDraft(e.target.value);
        onChange(e.target.value);
      }}
      className="w-full bg-transparent px-2 py-1 text-center text-sm italic text-text-secondary outline-none placeholder:text-text-muted focus:bg-accent-light/40 focus:text-text-primary"
    />
  );
};
