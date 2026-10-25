'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, FileDropzone } from '@/src/presentation/components/common';
import { voiceService } from '@/src/infrastructure/api/services';
import type { Voice } from '@/src/shared/types';
import { resolveMediaUrl } from '@/src/shared/utils';

const AUDIO_HINT = 'MP3, WAV, M4A (Tối đa 10MB)';

interface VoiceModalProps {
  /** Voice to edit; omit to create a new one. The modal is mounted per open. */
  voice?: Voice | null;
  onClose: () => void;
  onSuccess: (saved: Voice) => void;
}

const labelClass = 'block text-sm font-semibold text-text-primary mb-1.5';
const fieldClass =
  'w-full px-3.5 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-colors';

export const VoiceModal: React.FC<VoiceModalProps> = ({ voice, onClose, onSuccess }) => {
  const isEditMode = Boolean(voice);
  const [name, setName] = useState(voice?.name ?? '');
  const [description, setDescription] = useState(voice?.description ?? '');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewUrl = useMemo(() => (audioFile ? URL.createObjectURL(audioFile) : null), [audioFile]);
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên giọng đọc');
      return;
    }
    if (!isEditMode && !audioFile) {
      alert('Vui lòng chọn file audio mẫu');
      return;
    }

    const form = new FormData();
    form.append('voiceInfo', JSON.stringify({ name: name.trim(), description: description.trim() }));
    if (audioFile) form.append('exampleAudio', audioFile);

    setIsSubmitting(true);
    try {
      const saved = voice
        ? await voiceService.updateVoice(voice.id, form)
        : await voiceService.createVoice(form);
      onSuccess(saved);
      onClose();
    } catch (error) {
      console.error('Error saving voice:', error);
      alert(isEditMode ? 'Có lỗi xảy ra khi cập nhật giọng đọc' : 'Có lỗi xảy ra khi tạo giọng đọc');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLabel = isEditMode
    ? isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'
    : isSubmitting ? 'Đang tạo...' : 'Tạo giọng đọc';

  return (
    <Modal title={isEditMode ? 'Cập nhật giọng đọc' : 'Thêm giọng đọc mới'} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>
            Tên giọng đọc <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
            placeholder="VD: Giọng nam Hà Nội, Giọng nữ ngọt ngào..."
            required
            autoFocus
          />
        </div>

        <div>
          <label className={labelClass}>Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${fieldClass} resize-none`}
            rows={3}
            placeholder="Mô tả đặc điểm giọng đọc (VD: Giọng đọc truyền cảm, ấm áp...)"
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>
            File audio mẫu {!isEditMode && <span className="text-error">*</span>}
          </label>
          {voice?.exampleAudio && !audioFile && (
            <audio controls src={resolveMediaUrl(voice.exampleAudio)} className="h-8 w-full" />
          )}
          <FileDropzone
            id="voice-modal-audio"
            accept="audio/*"
            file={audioFile}
            onChange={setAudioFile}
            prompt={voice?.exampleAudio ? 'Tải lên file audio mới' : 'Kéo thả hoặc chọn file audio mẫu'}
            hint={voice?.exampleAudio ? `${AUDIO_HINT} · Bỏ trống nếu muốn giữ file hiện tại` : AUDIO_HINT}
            className="h-28"
          />
          {previewUrl && <audio controls src={previewUrl} className="h-8 w-full" />}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-xl px-4">
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting} className="rounded-xl px-4">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
