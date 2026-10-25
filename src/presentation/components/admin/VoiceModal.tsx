'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from '@/src/presentation/components/ui';
import { voiceService } from '@/src/infrastructure/api/services';
import type { Voice } from '@/src/shared/types';
import { UploadCloud, FileAudio, Play, Pause } from 'lucide-react';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  voice?: Voice | null;
  onSuccess: () => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  voice,
  onSuccess,
}) => {
  const isEditMode = Boolean(voice);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Existing audio preview state for edit mode
  const [isPlayingExisting, setIsPlayingExisting] = useState(false);
  const existingAudioRef = useRef<HTMLAudioElement | null>(null);

  // Reset the form whenever the modal opens or switches to another voice
  const [syncedFor, setSyncedFor] = useState<{ isOpen: boolean; voice?: Voice | null }>({
    isOpen: false,
  });
  if (syncedFor.isOpen !== isOpen || syncedFor.voice !== voice) {
    setSyncedFor({ isOpen, voice });
    if (isOpen) {
      setFormData({ name: voice?.name || '', description: voice?.description || '' });
      setAudioFile(null);
      setPreviewUrl(null);
    }
    setIsPlayingExisting(false);
  }

  // Stop the existing sample when the modal closes (the preview URL is revoked below)
  useEffect(() => {
    if (!isOpen && existingAudioRef.current) {
      existingAudioRef.current.pause();
      existingAudioRef.current.src = '';
    }
  }, [isOpen]);

  // Clean up object URLs and audio
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (existingAudioRef.current) {
        existingAudioRef.current.pause();
        existingAudioRef.current.src = '';
      }
    };
  }, [previewUrl]);

  const handleFileChange = (file: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setAudioFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleToggleExistingAudio = () => {
    if (!voice?.exampleAudio) return;

    if (!existingAudioRef.current) {
      const audio = new Audio(voice.exampleAudio);
      existingAudioRef.current = audio;
      audio.onended = () => setIsPlayingExisting(false);
    }

    if (isPlayingExisting) {
      existingAudioRef.current.pause();
      setIsPlayingExisting(false);
    } else {
      existingAudioRef.current.play().catch(() => setIsPlayingExisting(false));
      setIsPlayingExisting(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên giọng đọc');
      return;
    }

    if (!isEditMode && !audioFile) {
      alert('Vui lòng chọn file audio mẫu');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && voice) {
        const form = new FormData();
        form.append(
          'voiceInfo',
          JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim(),
          })
        );
        if (audioFile) {
          form.append('exampleAudio', audioFile);
        }
        await voiceService.updateVoice(voice.id, form);
      } else if (audioFile) {
        const form = new FormData();
        form.append(
          'voiceInfo',
          JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim(),
          })
        );
        form.append('exampleAudio', audioFile);
        await voiceService.createVoice(form);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving voice:', error);
      alert(isEditMode ? 'Có lỗi xảy ra khi cập nhật giọng đọc' : 'Có lỗi xảy ra khi tạo giọng đọc');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      title={isEditMode ? 'Cập nhật giọng đọc' : 'Thêm giọng đọc mới'}
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tên giọng đọc */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            Tên giọng đọc <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors"
            placeholder="VD: Giọng nam Hà Nội, Giọng nữ ngọt ngào..."
            required
            autoFocus
          />
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            Mô tả
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors resize-none"
            rows={3}
            placeholder="Mô tả đặc điểm giọng đọc (VD: Giọng đọc truyền cảm, ấm áp...)"
          />
        </div>

        {/* File Audio Section */}
        {isEditMode ? (
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              File audio mẫu
            </label>
            {/* Existing file (if any) with preview player */}
            {voice?.exampleAudio && !audioFile && (
              <div className="bg-bg/70 border border-border rounded-xl p-3 flex items-center justify-between text-xs">
                <span className="text-text-secondary flex items-center gap-2 min-w-0">
                  <FileAudio className="w-4 h-4 text-accent flex-shrink-0" />
                  <span className="truncate">Đã có file audio mẫu được gán</span>
                </span>
                <button
                  type="button"
                  onClick={handleToggleExistingAudio}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 hover:bg-accent hover:text-white text-accent font-medium transition-colors cursor-pointer flex-shrink-0"
                >
                  {isPlayingExisting ? (
                    <>
                      <Pause className="w-3 h-3 fill-current" />
                      <span>Tạm dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Nghe thử</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Re-upload zone: shown when no file picked yet, or as a swap card when a new file is chosen */}
            <div
              className={`mt-2 border-2 border-dashed border-border hover:border-accent/50 rounded-xl p-3 text-center transition-colors bg-bg/50 ${
                audioFile ? 'border-accent/40' : ''
              }`}
            >
              <input
                type="file"
                id="voice-modal-audio-reupload"
                accept="audio/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="hidden"
              />
              {audioFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                    <FileAudio className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-medium text-text-primary max-w-xs truncate">
                    {audioFile.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB · Sẽ thay thế file hiện tại
                  </p>
                  {previewUrl && (
                    <audio controls src={previewUrl} className="h-8 w-full max-w-xs mt-1" />
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <label
                      htmlFor="voice-modal-audio-reupload"
                      className="text-xs text-accent hover:underline font-medium cursor-pointer"
                    >
                      Chọn file khác
                    </label>
                    <button
                      type="button"
                      onClick={() => handleFileChange(null)}
                      className="text-xs text-error hover:underline cursor-pointer"
                    >
                      Hủy thay đổi
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="voice-modal-audio-reupload"
                  className="flex flex-col items-center gap-1.5 cursor-pointer py-1.5"
                >
                  <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-medium text-text-primary">
                    {voice?.exampleAudio
                      ? 'Tải lên file audio mới'
                      : 'Tải lên file audio mẫu'}
                  </p>
                  <p className="text-xs text-text-muted">
                    MP3, WAV, M4A (Tối đa 10MB)
                    {voice?.exampleAudio && ' · Bỏ trống nếu muốn giữ file hiện tại'}
                  </p>
                </label>
              )}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              File audio mẫu <span className="text-error">*</span>
            </label>
            <div className="border-2 border-dashed border-border hover:border-accent/50 rounded-xl p-4 text-center transition-colors bg-bg/50">
              <input
                type="file"
                id="voice-modal-audio-upload"
                accept="audio/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="hidden"
              />
              {audioFile ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-text-primary max-w-xs truncate">
                    {audioFile.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {previewUrl && (
                    <audio controls src={previewUrl} className="h-8 w-full max-w-xs mt-2" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleFileChange(null)}
                    className="text-xs text-error hover:underline mt-1 cursor-pointer"
                  >
                    Chọn file khác
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="voice-modal-audio-upload"
                  className="flex flex-col items-center gap-2 cursor-pointer py-2"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Nhấp để tải lên file audio
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Định dạng: MP3, WAV, M4A (Tối đa 10MB)
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="rounded-xl px-4"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl px-4"
          >
            {isSubmitting
              ? isEditMode
                ? 'Đang lưu...'
                : 'Đang tạo...'
              : isEditMode
              ? 'Lưu thay đổi'
              : 'Tạo giọng đọc'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VoiceModal;
