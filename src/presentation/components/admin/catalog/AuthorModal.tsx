'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FileDropzone, Modal } from '@/src/presentation/components/common';
import { authorService, uploadService } from '@/src/infrastructure/api/services';
import type { Author } from '@/src/shared/types';
import { getApiErrorMessage, resolveMediaUrl } from '@/src/shared/utils';
import { CATALOG_LIMITS, CatalogField, CatalogFormFooter, inputClass } from './catalogForm';

const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp';
const AVATAR_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

interface AuthorModalProps {
  /** Author to edit; omit to create one. The modal is mounted per open. */
  author?: Author | null;
  /** Prefills the name when creating, e.g. what was typed in the book form's author search */
  initialName?: string;
  onClose: () => void;
  onSuccess: (saved: Author) => void;
}

const validateAvatar = (file: File | null) => {
  if (!file) return undefined;
  if (!AVATAR_EXTENSIONS.test(file.name)) return 'Ảnh phải là định dạng JPG, PNG hoặc WebP';
  if (file.size > CATALOG_LIMITS.avatarBytes) return 'Ảnh không được lớn hơn 5 MB';
  return undefined;
};

export const AuthorModal: React.FC<AuthorModalProps> = ({ author, initialName = '', onClose, onSuccess }) => {
  const isEdit = Boolean(author);
  const [fullName, setFullName] = useState(author?.fullName ?? initialName);
  const [bio, setBio] = useState(author?.bio ?? '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const fileUrl = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : null), [avatarFile]);
  useEffect(() => () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

  const currentAvatar = !removeAvatar ? author?.avatar ?? null : null;
  const previewUrl = fileUrl ?? (currentAvatar ? resolveMediaUrl(currentAvatar.url) : null);

  const nameError = !fullName.trim() ? 'Nhập tên tác giả' : undefined;
  const avatarError = validateAvatar(avatarFile);
  const shownNameError = submitAttempted ? nameError : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // The book form's own submit must not fire when this modal sits on top of it
    e.stopPropagation();
    if (isSubmitting) return;
    setSubmitAttempted(true);
    setServerError(null);
    if (nameError || avatarError) return;

    setIsSubmitting(true);
    try {
      // A new image goes straight to cloud storage; the author only stores its path
      const avatar = avatarFile
        ? await uploadService.uploadFile(avatarFile, 'IMAGE')
        : currentAvatar?.path ?? '';
      const payload = { fullName: fullName.trim(), bio: bio.trim(), avatar };
      const saved = author
        ? await authorService.updateAuthor(author.id, payload)
        : await authorService.createAuthor(payload);
      onSuccess(saved);
      onClose();
    } catch (error) {
      console.error('Error saving author:', error);
      setServerError(
        getApiErrorMessage(error, isEdit ? 'Không lưu được tác giả, thử lại sau' : 'Không tạo được tác giả, thử lại sau'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Sửa tác giả' : 'Thêm tác giả'} onClose={onClose} size="md">
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[8rem_1fr]">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-text-primary">Ảnh</span>
            <FileDropzone
              id="author-avatar"
              accept={AVATAR_ACCEPT}
              file={avatarFile}
              onChange={(file) => {
                setServerError(null);
                setAvatarFile(file);
              }}
              previewUrl={previewUrl}
              prompt="Chọn ảnh"
              hint="Tối đa 5 MB"
              hasError={Boolean(avatarError)}
              disabled={isSubmitting}
              className="aspect-square w-32"
            />
            {avatarError ? (
              <p role="alert" className="mt-1.5 text-xs text-error">
                {avatarError}
              </p>
            ) : (
              currentAvatar &&
              !avatarFile && (
                <button
                  type="button"
                  onClick={() => setRemoveAvatar(true)}
                  disabled={isSubmitting}
                  className="mt-1.5 text-xs font-medium text-text-secondary hover:text-error cursor-pointer"
                >
                  Gỡ ảnh
                </button>
              )
            )}
            {removeAvatar && !avatarFile && (
              <button
                type="button"
                onClick={() => setRemoveAvatar(false)}
                disabled={isSubmitting}
                className="mt-1.5 text-xs font-medium text-accent hover:underline cursor-pointer"
              >
                Giữ ảnh cũ
              </button>
            )}
          </div>

          <div className="space-y-4">
            <CatalogField id="author-name" label="Tên tác giả" required error={shownNameError}>
              <input
                id="author-name"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setServerError(null);
                  setFullName(e.target.value);
                }}
                maxLength={CATALOG_LIMITS.name}
                aria-invalid={Boolean(shownNameError)}
                aria-describedby={shownNameError ? 'author-name-error' : undefined}
                disabled={isSubmitting}
                className={inputClass(Boolean(shownNameError))}
                placeholder="VD: Nguyễn Nhật Ánh"
                autoFocus
              />
            </CatalogField>

            <CatalogField
              id="author-bio"
              label="Tiểu sử"
              hint={`${bio.length}/${CATALOG_LIMITS.text} ký tự`}
            >
              <textarea
                id="author-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={CATALOG_LIMITS.text}
                rows={4}
                disabled={isSubmitting}
                className={`${inputClass(false)} resize-none`}
                placeholder="Vài dòng giới thiệu tác giả"
              />
            </CatalogField>
          </div>
        </div>

        <CatalogFormFooter
          serverError={serverError}
          isSubmitting={isSubmitting}
          isEdit={isEdit}
          createLabel="Thêm tác giả"
          onCancel={onClose}
        />
      </form>
    </Modal>
  );
};
