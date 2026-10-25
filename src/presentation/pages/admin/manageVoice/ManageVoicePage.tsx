"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminLayout } from "@/src/presentation/layouts";
import { voiceService } from "@/src/infrastructure/api/services";
import type { Voice } from "@/src/shared/types";
import { resolveMediaUrl } from "@/src/shared/utils";
import {
  Button,
  ConfirmDeleteModal,
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
  type SortDir,
  type VoiceSortField,
} from "@/src/presentation/components/admin/voice";
import { useAudioPlayer } from "@/src/presentation/hooks/common";
import { invalidateBookFormOptions } from "@/src/presentation/hooks/admin";

const VOICES_PER_PAGE = 10;
const MENU_HEIGHT = 88;

const menuItemClass =
  "w-full px-3.5 py-2 text-left text-sm flex items-center gap-2.5 transition-colors cursor-pointer";

export const ManageVoicePage = () => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortField, setSortField] = useState<VoiceSortField>("id");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pageState, setPageState] = useState({ page: 0, filterKey: "" });

  // `undefined` = closed, `null` = creating, Voice = editing
  const [editingVoice, setEditingVoice] = useState<Voice | null | undefined>(undefined);
  const [deletingVoice, setDeletingVoice] = useState<Voice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [menu, setMenu] = useState<{ voice: Voice; anchor: MenuAnchor } | null>(null);

  const [playingVoice, setPlayingVoice] = useState<Voice | null>(null);
  const player = useAudioPlayer();
  const { togglePlay } = player;

  useEffect(() => {
    voiceService
      .getVoices()
      .then((data) => setVoices(data.content ?? []))
      .catch((error) => console.error("Error fetching voices:", error))
      .finally(() => setIsLoading(false));
  }, []);

  const handleTogglePlay = useCallback(
    (voice: Voice) => {
      if (playingVoice?.id === voice.id) togglePlay();
      else setPlayingVoice(voice);
    },
    [playingVoice?.id, togglePlay],
  );

  const handleSort = useCallback(
    (field: VoiceSortField) => {
      if (sortField === field) {
        setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("asc");
      }
    },
    [sortField],
  );

  const handleOpenMenu = useCallback((e: React.MouseEvent<HTMLButtonElement>, voice: Voice) => {
    e.stopPropagation();
    const trigger = e.currentTarget;
    setMenu((current) =>
      current?.voice.id === voice.id ? null : { voice, anchor: getMenuAnchor(trigger, MENU_HEIGHT) },
    );
  }, []);
  const closeMenu = useCallback(() => setMenu(null), []);
  const clearSearch = useCallback(() => setSearchKeyword(""), []);
  const openCreate = useCallback(() => setEditingVoice(null), []);

  const filteredVoices = useMemo(() => {
    const q = searchKeyword.trim().toLowerCase();
    const matched = q
      ? voices.filter(
          (v) => v.name.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q),
        )
      : voices;
    const sorted = [...matched].sort((a, b) =>
      sortField === "name" ? a.name.localeCompare(b.name, "vi") : a.id - b.id,
    );
    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [voices, searchKeyword, sortField, sortDir]);

  // Client-side pagination; back to the first page whenever the filter/sort changes
  const filterKey = `${searchKeyword}|${sortField}|${sortDir}`;
  const totalPage = Math.max(1, Math.ceil(filteredVoices.length / VOICES_PER_PAGE));
  const page = Math.min(pageState.filterKey === filterKey ? pageState.page : 0, totalPage - 1);
  const pagedVoices = useMemo(
    () => filteredVoices.slice(page * VOICES_PER_PAGE, (page + 1) * VOICES_PER_PAGE),
    [filteredVoices, page],
  );

  const handleSaved = (saved: Voice) => {
    invalidateBookFormOptions();
    setVoices((prev) =>
      prev.some((v) => v.id === saved.id)
        ? prev.map((v) => (v.id === saved.id ? saved : v))
        : [...prev, saved],
    );
  };

  const handleConfirmDelete = async () => {
    if (!deletingVoice) return;
    setIsDeleting(true);
    try {
      if (playingVoice?.id === deletingVoice.id) setPlayingVoice(null);
      await voiceService.deleteVoice(deletingVoice.id);
      invalidateBookFormOptions();
      setVoices((prev) => prev.filter((v) => v.id !== deletingVoice.id));
      setDeletingVoice(null);
    } catch (error) {
      console.error("Error deleting voice:", error);
      alert("Có lỗi xảy ra khi xóa giọng đọc");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="w-full h-full flex-1 flex flex-col min-h-0 space-y-4">
        <div className="rounded-xl flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <SearchInput
            value={searchKeyword}
            onChange={setSearchKeyword}
            placeholder="Tìm theo tên hoặc mô tả..."
            className="flex-1 max-w-md"
          />
          <Button onClick={openCreate} className="h-10 px-4 rounded-xl shadow-sm hover:shadow">
            <Plus className="w-4 h-4" />
            <span>Thêm giọng mới</span>
          </Button>
        </div>

        <div className="flex-1 min-h-0 bg-surface rounded-xl border border-border overflow-hidden shadow-sm flex flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
            <VoiceTable
              voices={pagedVoices}
              startIndex={page * VOICES_PER_PAGE}
              isLoading={isLoading}
              isFiltered={Boolean(searchKeyword)}
              sortField={sortField}
              sortDir={sortDir}
              playingVoiceId={playingVoice?.id ?? null}
              isPlaying={player.isPlaying}
              onSort={handleSort}
              onTogglePlay={handleTogglePlay}
              onOpenMenu={handleOpenMenu}
              onClearSearch={clearSearch}
              onCreate={openCreate}
            />
          </div>

          {!isLoading && totalPage > 1 && (
            <div className="flex-shrink-0 px-4 py-3 border-t border-border">
              <Pagination
                page={page}
                totalPage={totalPage}
                onPageChange={(next) => setPageState({ page: next, filterKey })}
              />
            </div>
          )}

          {playingVoice?.exampleAudio && (
            <>
              <audio
                key={playingVoice.id}
                src={resolveMediaUrl(playingVoice.exampleAudio)}
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
              setDeletingVoice(menu.voice);
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
          onSuccess={handleSaved}
        />
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deletingVoice)}
        onClose={() => setDeletingVoice(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa giọng đọc"
        itemName={deletingVoice?.name}
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
};
