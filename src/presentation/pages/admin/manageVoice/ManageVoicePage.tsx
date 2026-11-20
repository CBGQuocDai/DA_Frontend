"use client";

import { useCallback, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminLayout } from "@/src/presentation/layouts";
import { voiceService } from "@/src/infrastructure/api/services";
import type { Voice } from "@/src/shared/types";
import { resolveMediaUrl } from "@/src/shared/utils";
import {
  Button,
  ConfirmDeleteModal,
  ErrorState,
  FloatingMenu,
  getMenuAnchor,
  Pagination,
  SearchInput,
  type MenuAnchor,
} from "@/src/presentation/components/common";
import {
  VoiceModal,
  VoicePlayerBar,
  VoiceTable,
} from "@/src/presentation/components/admin/voice";
import { useAudioPlayer } from "@/src/presentation/hooks/common";
import { invalidateBookFormOptions, useAdminSearchList, useDeleteConfirm } from "@/src/presentation/hooks/admin";

// Chiều cao ước lượng của menu thao tác, để biết mở lên trên hay xuống dưới
const MENU_HEIGHT = 88;

const menuItemClass =
  "w-full px-3.5 py-2 text-left text-sm flex items-center gap-2.5 transition-colors cursor-pointer";

/** Trang quản lý giọng đọc: tìm kiếm, nghe thử file mẫu, thêm/sửa/xóa. */
export const ManageVoicePage = () => {
  const list = useAdminSearchList(voiceService.searchVoices);

  // `undefined` = đóng modal, `null` = đang tạo mới, Voice = đang sửa
  const [editingVoice, setEditingVoice] = useState<Voice | null | undefined>(undefined);
  const [menu, setMenu] = useState<{ voice: Voice; anchor: MenuAnchor } | null>(null);

  const [playingVoice, setPlayingVoice] = useState<Voice | null>(null);
  const player = useAudioPlayer();
  const { togglePlay } = player;

  // Bấm lại giọng đang phát thì tạm dừng/tiếp tục, bấm giọng khác thì chuyển sang giọng đó
  const handleTogglePlay = useCallback(
    (voice: Voice) => {
      if (playingVoice?.id === voice.id) togglePlay();
      else setPlayingVoice(voice);
    },
    [playingVoice?.id, togglePlay],
  );

  const handleOpenMenu = useCallback((e: React.MouseEvent<HTMLButtonElement>, voice: Voice) => {
    e.stopPropagation();
    const trigger = e.currentTarget;
    setMenu((current) =>
      current?.voice.id === voice.id ? null : { voice, anchor: getMenuAnchor(trigger, MENU_HEIGHT) },
    );
  }, []);
  const closeMenu = useCallback(() => setMenu(null), []);
  const openCreate = useCallback(() => setEditingVoice(null), []);

  // Thêm/sửa/xóa đều làm thay đổi danh sách lựa chọn của form sách
  const handleChanged = () => {
    invalidateBookFormOptions();
    list.reload();
  };

  const deletion = useDeleteConfirm<Voice>({
    remove: (voice) => voiceService.deleteVoice(voice.id),
    onDeleted: (voice) => {
      // Giọng vừa xóa không còn file mẫu để phát tiếp
      if (playingVoice?.id === voice.id) setPlayingVoice(null);
      handleChanged();
    },
    errorMessage: "Có lỗi xảy ra khi xóa giọng đọc",
    successMessage: (voice) => `Đã xóa giọng đọc “${voice.name}”`,
  });

  return (
    <AdminLayout>
      <div className="w-full h-full flex-1 flex flex-col min-h-0 space-y-4">
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3">
            <SearchInput
              value={list.keyword}
              onChange={list.setKeyword}
              placeholder="Tìm theo tên giọng..."
              className="flex-1 max-w-md"
            />
            {!list.isLoading && (
              <span className="hidden sm:inline text-xs text-text-muted tabular-nums" aria-live="polite">
                {list.total} giọng đọc
              </span>
            )}
          </div>
          <Button onClick={openCreate} className="h-10 px-4 rounded-xl shadow-sm hover:shadow">
            <Plus className="w-4 h-4" />
            <span>Thêm giọng mới</span>
          </Button>
        </div>

        {list.error && <ErrorState message={list.error} onRetry={list.reload} className="flex-shrink-0" />}

        <div className="flex-1 min-h-0 bg-surface rounded-xl border border-border overflow-hidden shadow-sm flex flex-col">
          <div
            className={`flex-1 min-h-0 overflow-auto transition-opacity ${list.isFetching && !list.isLoading ? "opacity-60" : ""}`}
            aria-busy={list.isFetching}
          >
            <VoiceTable
              voices={list.items}
              startIndex={list.page * list.pageSize}
              isLoading={list.isLoading}
              isFiltered={list.isFiltered}
              playingVoiceId={playingVoice?.id ?? null}
              isPlaying={player.isPlaying}
              onTogglePlay={handleTogglePlay}
              onOpenMenu={handleOpenMenu}
              onClearSearch={list.clearSearch}
              onCreate={openCreate}
            />
          </div>

          {!list.isLoading && list.items.length > 0 && (
            <div className="flex-shrink-0 px-4 py-3 border-t border-border">
              <Pagination page={list.page} totalPage={list.totalPage} onPageChange={list.setPage} className="" />
            </div>
          )}

          {playingVoice?.exampleAudio && (
            <>
              <audio
                key={playingVoice.id}
                src={resolveMediaUrl(playingVoice.exampleAudio.url)}
                {...player.audioProps}
              />
              <VoicePlayerBar
                voice={playingVoice}
                isPlaying={player.isPlaying}
                currentTime={player.currentTime}
                duration={player.duration}
                onTogglePlay={togglePlay}
                onSeek={player.seek}
                onClose={() => setPlayingVoice(null)}
              />
            </>
          )}
        </div>
      </div>

      {menu && (
        <FloatingMenu anchor={menu.anchor} onClose={closeMenu}>
          <button
            type="button"
            onClick={() => {
              setEditingVoice(menu.voice);
              closeMenu();
            }}
            className={`${menuItemClass} text-text-primary hover:bg-bg`}
          >
            <Pencil className="w-3.5 h-3.5 text-text-secondary" />
            <span>Sửa</span>
          </button>
          <button
            type="button"
            onClick={() => {
              deletion.ask(menu.voice);
              closeMenu();
            }}
            className={`${menuItemClass} text-error hover:bg-error-light/50`}
          >
            <Trash2 className="w-3.5 h-3.5 text-error" />
            <span>Xóa</span>
          </button>
        </FloatingMenu>
      )}

      {editingVoice !== undefined && (
        <VoiceModal
          key={editingVoice?.id ?? "new"}
          voice={editingVoice}
          onClose={() => setEditingVoice(undefined)}
          onSuccess={handleChanged}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deletion.target !== null}
        onClose={deletion.cancel}
        onConfirm={deletion.confirm}
        title="Xóa giọng đọc"
        itemName={deletion.target?.name}
        isLoading={deletion.isDeleting}
      />
    </AdminLayout>
  );
};
