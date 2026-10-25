'use client';

import React, { useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';

interface FileDropzoneProps {
  id: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
  /** Shown when no file is chosen, e.g. "Kéo thả hoặc chọn file PDF" */
  prompt: string;
  hint?: string;
  hasError?: boolean;
  disabled?: boolean;
  /** Image URL to render instead of the file name (cover preview) */
  previewUrl?: string | null;
  /** Already-uploaded file shown while no new file is chosen (edit mode) */
  currentFile?: { name: string; url: string } | null;
  className?: string;
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  id,
  accept,
  file,
  onChange,
  prompt,
  hint,
  hasError = false,
  disabled = false,
  previewUrl,
  currentFile,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pick = (next: File | null) => {
    onChange(next);
    // allow re-selecting the same file after removing it
    if (inputRef.current) inputRef.current.value = '';
  };

  const borderClass = hasError
    ? 'border-error bg-error/5'
    : isDragging
      ? 'border-accent bg-accent/10'
      : 'border-border hover:border-accent/60 bg-bg';

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => pick(e.target.files?.[0] ?? null)}
        className="sr-only peer"
      />
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!disabled) pick(e.dataTransfer.files?.[0] ?? null);
        }}
        className={`flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border-2 border-dashed p-3 text-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50 ${borderClass} ${
          disabled ? 'cursor-not-allowed opacity-60' : ''
        }`}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Ảnh bìa" className="absolute inset-0 h-full w-full object-contain bg-bg" />
        ) : file ? (
          <>
            <span className="max-w-full truncate text-sm font-medium text-text-primary">{file.name}</span>
            <span className="text-xs text-text-muted">{formatSize(file.size)}</span>
          </>
        ) : currentFile ? (
          <>
            <FileText className="h-5 w-5 text-text-muted" />
            <span className="max-w-full truncate text-sm font-medium text-text-primary">{currentFile.name}</span>
            <span className="text-xs text-text-muted">
              File hiện tại ·{' '}
              <a
                href={currentFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Xem
              </a>
            </span>
            {hint && <span className="text-xs text-text-muted">{hint}</span>}
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 text-text-muted" />
            <span className="text-sm font-medium text-text-primary">{prompt}</span>
            {hint && <span className="text-xs text-text-muted">{hint}</span>}
          </>
        )}
      </label>
      {(file || previewUrl) && !disabled && (
        <div className="absolute right-2 top-2 flex gap-1">
          {file && (
            <button
              type="button"
              onClick={() => pick(null)}
              aria-label="Bỏ file đã chọn"
              className="rounded-full bg-surface/90 p-1 text-text-secondary shadow hover:text-error"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
