'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, FileDropzone, showAlert } from '@/src/presentation/components/common';
import { uploadService, voiceService } from '@/src/infrastructure/api/services';
import type { Voice } from '@/src/shared/types';
import { getApiErrorMessage, resolveMediaUrl } from '@/src/shared/utils';

const AUDIO_HINT = 'MP3, WAV (Tối đa 10MB)';
const TRANSCRIPT_MAX_LENGTH = 1000;

interface VoiceModalProps {
  /** Giọng đọc cần sửa; bỏ trống để tạo mới. Modal được mount lại mỗi lần mở. */
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
  const [exampleTranscript, setExampleTranscript] = useState(voice?.exampleTranscript ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewUrl = useMemo(() => (audioFile ? URL.createObjectURL(audioFile) : null), [audioFile]);
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showAlert('Vui lòng nhập tên giọng đọc', 'warning');
      return;
    }
    if (!isEditMode && !audioFile) {
      showAlert('Vui lòng chọn file audio mẫu', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      // File mẫu được đưa thẳng lên cloud storage; giọng đọc chỉ lưu đường dẫn
      const exampleAudio = audioFile
        ? await uploadService.uploadFile(audioFile, 'AUDIO')
        : voice?.exampleAudio?.path;
      const payload = {
        name: name.trim(),
        description: description.trim(),
        exampleAudio,
        exampleTranscript: exampleTranscript.trim(),
      };
      const saved = voice
        ? await voiceService.updateVoice(voice.id, payload)
        : await voiceService.createVoice(payload);
      onSuccess(saved);
      onClose();
    } catch (error) {
      console.error('Error saving voice:', error);
      showAlert(
        getApiErrorMessage(error, isEditMode ? 'Có lỗi xảy ra khi cập nhật giọng đọc' : 'Có lỗi xảy ra khi tạo giọng đọc'),
      );
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
            <audio controls src={resolveMediaUrl(voice.exampleAudio.url)} className="h-8 w-full" />
          )}
          <FileDropzone
            id="voice-modal-audio"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
            file={audioFile}
            onChange={setAudioFile}
            prompt={voice?.exampleAudio ? 'Tải lên file audio mới' : 'Kéo thả hoặc chọn file audio mẫu'}
            hint={voice?.exampleAudio ? `${AUDIO_HINT} · Bỏ trống nếu muốn giữ file hiện tại` : AUDIO_HINT}
            className="h-28"
          />
          {previewUrl && <audio controls src={previewUrl} className="h-8 w-full" />}
        </div>

        <div>
          <label className={labelClass}>Lời thoại của audio mẫu</label>
          <textarea
            value={exampleTranscript}
            onChange={(e) => setExampleTranscript(e.target.value)}
            className={`${fieldClass} resize-none`}
            rows={3}
            maxLength={TRANSCRIPT_MAX_LENGTH}
            placeholder="Không bắt buộc. Nhập đúng từng chữ được đọc trong file mẫu"
          />
          <p className="mt-1 text-xs text-text-secondary">
            Bỏ trống thì hệ thống tự nhận dạng lời thoại. Nhớ cập nhật lại khi đổi file mẫu.
          </p>
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
