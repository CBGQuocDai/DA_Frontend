'use client';

import React, { useState } from 'react';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronDown, Gauge, Mic, Sparkles, TriangleAlert, Upload, Volume2 } from 'lucide-react';
import { Button, Spinner } from '@/src/presentation/components/common';
import { formatDuration } from '@/src/shared/utils';
import { estimateAudioSeconds } from './chapterEditor/plainText';

const MIN_SPEED = 0.5;
const MAX_SPEED = 2;
const SPEED_PRESETS = [0.75, 1, 1.25, 1.5];

interface AudioPopoverProps {
  rawText?: string;
  hasAudio: boolean;
  hasUnsavedChanges: boolean;
  voiceName?: string;
  /** Speed stored by the backend; the slider starts from it each time the popover opens */
  savedSpeed?: number | null;
  /** The backend is rendering audio; a file can still be uploaded meanwhile */
  isProcessing: boolean;
  isGenerating: boolean;
  isUploading: boolean;
  onGenerate: (speed: number) => void;
  onUpload: () => void;
}

const DEFAULT_SPEED = 1;

const formatSpeed = (speed: number) => `${speed.toFixed(2).replace(/0$/, '')}x`;
const isSameSpeed = (a: number, b: number) => Math.abs(a - b) < 0.001;

/** Single entry point for a chapter's audio: generate it with AI or upload a file. */
export const AudioPopover: React.FC<AudioPopoverProps> = ({
  rawText,
  hasAudio,
  hasUnsavedChanges,
  voiceName,
  savedSpeed,
  isProcessing,
  isGenerating,
  isUploading,
  onGenerate,
  onUpload,
}) => {
  const hasText = !!rawText?.trim();
  const busyLabel = isUploading
    ? 'Đang tải lên...'
    : isGenerating
      ? 'Đang gửi...'
      : isProcessing
        ? 'Đang tạo audio...'
        : null;

  return (
    <Popover className="relative">
      <PopoverButton
        as={Button}
        variant="secondary"
        size="sm"
        disabled={isGenerating || isUploading}
        title={busyLabel ?? 'Tạo audio bằng AI hoặc tải file âm thanh lên'}
        aria-label="Âm thanh"
      >
        {busyLabel ? (
          <>
            <Spinner className="w-3.5 h-3.5" />
            <span className="hidden @xl:inline">{busyLabel}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden @xl:inline">Âm thanh</span>
            <ChevronDown className="w-3 h-3" />
          </>
        )}
      </PopoverButton>

      <PopoverPanel
        anchor={{ to: 'bottom end', gap: 8 }}
        className="z-50 w-[min(340px,calc(100vw-2rem))] rounded-xl border border-border bg-surface shadow-lg p-4 space-y-4"
      >
        {({ close }) => (
          <AudioPanel
            rawText={rawText}
            hasText={hasText}
            hasAudio={hasAudio}
            hasUnsavedChanges={hasUnsavedChanges}
            voiceName={voiceName}
            initialSpeed={savedSpeed ?? DEFAULT_SPEED}
            isProcessing={isProcessing}
            onGenerate={(speed) => {
              onGenerate(speed);
              close();
            }}
            onUpload={() => {
              close();
              onUpload();
            }}
            onCancel={() => close()}
          />
        )}
      </PopoverPanel>
    </Popover>
  );
};

interface AudioPanelProps {
  rawText?: string;
  hasText: boolean;
  hasAudio: boolean;
  hasUnsavedChanges: boolean;
  voiceName?: string;
  initialSpeed: number;
  isProcessing: boolean;
  onGenerate: (speed: number) => void;
  onUpload: () => void;
  onCancel: () => void;
}

/** Mounted each time the popover opens, so the slider restarts from the saved speed. */
const AudioPanel: React.FC<AudioPanelProps> = ({
  rawText,
  hasText,
  hasAudio,
  hasUnsavedChanges,
  voiceName,
  initialSpeed,
  isProcessing,
  onGenerate,
  onUpload,
  onCancel,
}) => {
  const [speed, setSpeed] = useState(initialSpeed);
  const estimate = estimateAudioSeconds(rawText, speed);

  return (
    <>
      <div>
        <h3 className="text-sm font-bold text-text-primary">Tạo audio bằng AI</h3>
        <p className="text-xs text-text-secondary mt-0.5">Audio được tạo từ nội dung văn bản đã lưu của chương.</p>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <Mic className="w-3.5 h-3.5 text-text-muted" />
        <span className="text-text-secondary">Giọng đọc:</span>
        <span className={`font-semibold ${voiceName ? 'text-text-primary' : 'text-warning'}`}>
          {voiceName ?? 'Chưa chọn (dùng giọng mặc định)'}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="reading-speed" className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
            <Gauge className="w-3.5 h-3.5 text-text-muted" />
            Tốc độ đọc
          </label>
          <span className="px-2 py-0.5 rounded-md bg-accent-light text-accent text-xs font-bold font-mono">
            {formatSpeed(speed)}
          </span>
        </div>
        <input
          id="reading-speed"
          type="range"
          min={MIN_SPEED}
          max={MAX_SPEED}
          step={0.05}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full accent-accent cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-text-muted font-mono -mt-1">
          <span>{formatSpeed(MIN_SPEED)} · chậm</span>
          <span>nhanh · {formatSpeed(MAX_SPEED)}</span>
        </div>
        <div className="flex gap-1.5">
          {SPEED_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setSpeed(preset)}
              className={`flex-1 py-1 rounded-md text-xs font-medium border transition-colors ${
                isSameSpeed(speed, preset)
                  ? 'border-accent bg-accent text-white'
                  : 'border-border text-text-secondary hover:bg-bg hover:text-text-primary'
              }`}
            >
              {preset === 1 ? 'Chuẩn' : formatSpeed(preset)}
            </button>
          ))}
        </div>
      </div>

      {hasText && (
        <p className="text-xs text-text-secondary">
          Thời lượng ước tính:{' '}
          <span className="font-semibold text-text-primary">≈ {formatDuration(estimate)}</span>
        </p>
      )}

      {(!hasText || hasUnsavedChanges || hasAudio) && (
        <div className="space-y-1.5">
          {!hasText && <Warning>Chương chưa có nội dung văn bản để tạo audio.</Warning>}
          {hasUnsavedChanges && (
            <Warning>Bạn có thay đổi chưa lưu. Audio sẽ dùng bản đã lưu, hãy lưu trước nếu cần.</Warning>
          )}
          {hasAudio && <Warning>Audio hiện tại của chương sẽ bị thay thế.</Warning>}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={!hasText || isProcessing}
          onClick={() => onGenerate(speed)}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Tạo audio
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
        <span className="text-xs text-text-secondary">Hoặc dùng file có sẵn</span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onUpload}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload audio
        </Button>
      </div>
    </>
  );
};

const Warning: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="flex items-start gap-1.5 text-[11px] leading-snug text-warning bg-warning-light rounded-md px-2 py-1.5">
    <TriangleAlert className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
    <span>{children}</span>
  </p>
);
