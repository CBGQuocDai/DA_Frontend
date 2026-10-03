"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { AdminLayout } from "@/src/presentation/layouts";
import { voiceService } from "@/src/infrastructure/api/services";
import type { Voice } from "@/src/shared/types";
import { Button, ConfirmDeleteModal } from "@/src/presentation/components/ui";
import { VoiceModal } from "@/src/presentation/components/admin/VoiceModal";
import {
  Search,
  ChevronUp,
  ChevronDown,
  X,
  Pencil,
  Trash2,
  MoreVertical,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Mic,
} from "lucide-react";

type SortField = "name" | "id";
type SortDir = "asc" | "desc";
type FilterAudio = "all" | "has_audio" | "no_audio";

export const ManageVoicePage = () => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [audioFilter, setAudioFilter] = useState<FilterAudio>("all");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [isMounted, setIsMounted] = useState(false);

  // Unified Create / Edit Modal State
  const [voiceModalConfig, setVoiceModalConfig] = useState<{
    isOpen: boolean;
    voice?: Voice | null;
  }>({
    isOpen: false,
    voice: null,
  });

  // Delete Confirmation Modal State
  const [deletingVoice, setDeletingVoice] = useState<Voice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Unified Audio Player State
  const [playingVoice, setPlayingVoice] = useState<Voice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Floating action menu position
  const [menuAnchor, setMenuAnchor] = useState<{
    voice: Voice;
    top: number;
    right: number;
  } | null>(null);

  const fetchVoices = async () => {
    setIsLoading(true);
    try {
      const data = await voiceService.getVoices();
      setVoices(data.content ?? []);
    } catch (error) {
      console.error("Error fetching voices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchVoices();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Close floating menu on click outside, scroll, or resize
  useEffect(() => {
    if (!menuAnchor) return;
    const handleClose = () => setMenuAnchor(null);
    window.addEventListener("click", handleClose);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => {
      window.removeEventListener("click", handleClose);
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [menuAnchor]);

  // Audio Playback Controls
  const handleTogglePlay = (voice: Voice) => {
    if (!voice.exampleAudio) return;

    if (playingVoice?.id === voice.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    const audio = new Audio(voice.exampleAudio);
    audioRef.current = audio;
    setPlayingVoice(voice);
    setIsPlaying(true);
    setCurrentTime(0);
    setAudioProgress(0);

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setDuration(audio.duration);
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      setCurrentTime(0);
    };

    audio.play().catch((err) => {
      console.error("Error playing audio:", err);
      setIsPlaying(false);
    });
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setPlayingVoice(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setAudioProgress(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
    setAudioProgress(pct * 100);
  };

  const fmt = (s: number) => {
    if (!isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Filter & Sort
  const filteredAndSortedVoices = useMemo(() => {
    const q = searchKeyword.trim().toLowerCase();
    let result = voices;

    if (q) {
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.description?.toLowerCase().includes(q),
      );
    }

    if (audioFilter === "has_audio") {
      result = result.filter((v) => Boolean(v.exampleAudio));
    } else if (audioFilter === "no_audio") {
      result = result.filter((v) => !v.exampleAudio);
    }

    const sorted = [...result].sort((a, b) => {
      if (sortField === "name") {
        return a.name.localeCompare(b.name, "vi");
      }
      return a.id - b.id;
    });

    return sortDir === "asc" ? sorted : sorted.reverse();
  }, [voices, searchKeyword, audioFilter, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <span className="opacity-0 group-hover:opacity-30 ml-1">↕</span>;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 ml-1 inline-block" strokeWidth={2.5} />
    ) : (
      <ChevronDown
        className="w-3.5 h-3.5 ml-1 inline-block"
        strokeWidth={2.5}
      />
    );
  };

  const handleConfirmDelete = async () => {
    if (!deletingVoice) return;
    setIsDeleting(true);
    try {
      if (playingVoice?.id === deletingVoice.id) {
        handleStopAudio();
      }
      await voiceService.deleteVoice(deletingVoice.id);
      setDeletingVoice(null);
      await fetchVoices();
    } catch (error) {
      console.error("Error deleting voice:", error);
      alert("Có lỗi xảy ra khi xóa giọng đọc");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleMenu = (
    e: React.MouseEvent<HTMLButtonElement>,
    voice: Voice,
  ) => {
    e.stopPropagation();
    if (menuAnchor?.voice.id === voice.id) {
      setMenuAnchor(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 88;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < menuHeight && rect.top > menuHeight;

    setMenuAnchor({
      voice,
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  };

  const hasAudioCount = voices.filter((v) => v.exampleAudio).length;
  const noAudioCount = voices.length - hasAudioCount;

  return (
    <AdminLayout>
      <div className="w-full h-full flex-1 flex flex-col min-h-0 space-y-4">
        {/* Toolbar: Search + Quick Filter Tabs */}
        <div className="rounded-xl flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mô tả..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors h-10"
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
              strokeWidth={2}
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-text-muted hover:text-text-primary rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            onClick={() => setVoiceModalConfig({ isOpen: true, voice: null })}
            className="flex items-center gap-2 h-10 px-4 rounded-xl shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm giọng mới</span>
          </Button>
        </div>

        {/* Table Card filling remaining screen height */}
        <div className="flex-1 min-h-0 bg-surface rounded-xl border border-border overflow-hidden shadow-sm flex flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-bg/95 backdrop-blur-sm z-10 border-b border-border">
                <tr className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                  <th className="text-center px-4 py-3.5 w-14 font-mono">#</th>
                  <th
                    onClick={() => handleSort("name")}
                    className="text-left px-4 py-3.5 cursor-pointer select-none group w-56"
                  >
                    <span className="inline-flex items-center">
                      Tên giọng
                      <SortIndicator field="name" />
                    </span>
                  </th>
                  <th className="text-left px-4 py-3.5 w-72">Mô tả</th>
                  <th className="text-center px-4 py-3.5 w-48">Mẫu audio</th>
                  <th className="text-right px-4 py-3.5 w-20 pr-5">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`skel-${i}`}>
                      <td className="px-4 py-4 text-center">
                        <div className="h-4 w-6 bg-bg rounded animate-pulse mx-auto" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-32 bg-bg rounded animate-pulse" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-3.5 w-40 bg-bg rounded animate-pulse" />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="h-7 w-24 bg-bg rounded-full animate-pulse mx-auto" />
                      </td>
                      <td className="px-4 py-4 text-right pr-5">
                        <div className="h-7 w-7 bg-bg rounded-lg animate-pulse ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredAndSortedVoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-28 text-center">
                      {searchKeyword || audioFilter !== "all" ? (
                        <div className="max-w-sm mx-auto">
                          <p className="text-sm font-semibold text-text-primary">
                            Không tìm thấy giọng đọc phù hợp
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            Thử tìm kiếm với từ khóa khác hoặc{" "}
                            <button
                              onClick={() => {
                                setSearchKeyword("");
                                setAudioFilter("all");
                              }}
                              className="text-accent hover:underline font-medium cursor-pointer"
                            >
                              xóa bộ lọc
                            </button>
                          </p>
                        </div>
                      ) : (
                        <div className="max-w-sm mx-auto">
                          <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-3">
                            <Mic className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-semibold text-text-primary">
                            Chưa có giọng đọc nào
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            Bắt đầu tạo giọng đọc mẫu đầu tiên cho hệ thống
                          </p>
                          <Button
                            onClick={() =>
                              setVoiceModalConfig({ isOpen: true, voice: null })
                            }
                            className="mt-4 text-xs h-9 px-4 rounded-lg inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm giọng mới</span>
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedVoices.map((voice, index) => {
                    const isVoiceActive = playingVoice?.id === voice.id;
                    const isVoicePlaying = isVoiceActive && isPlaying;

                    return (
                      <tr
                        key={voice.id}
                        className={`hover:bg-accent-light/30 transition-colors group ${
                          isVoiceActive ? "bg-accent-light/40" : ""
                        }`}
                      >
                        {/* STT */}
                        <td className="px-4 py-3.5 text-center text-xs font-mono text-text-muted tabular-nums align-middle">
                          {index + 1}
                        </td>

                        {/* Tên giọng */}
                        <td className="px-4 py-3.5 align-middle">
                          <p
                            className="text-sm font-semibold text-text-primary truncate"
                            title={voice.name}
                          >
                            {voice.name}
                          </p>
                        </td>

                        {/* Mô tả */}
                        <td className="px-4 py-3.5 align-middle text-xs text-text-secondary max-w-sm">
                          {voice.description ? (
                            <p
                              className="line-clamp-2 leading-relaxed"
                              title={voice.description}
                            >
                              {voice.description}
                            </p>
                          ) : (
                            <span className="italic text-text-muted">
                              Chưa có mô tả
                            </span>
                          )}
                        </td>

                        {/* Mẫu audio */}
                        <td className="px-4 py-3.5 align-middle text-center">
                          {voice.exampleAudio ? (
                            isVoicePlaying ? (
                              <button
                                type="button"
                                onClick={() => handleTogglePlay(voice)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-white text-xs font-semibold shadow-sm hover:bg-accent-hover transition-all cursor-pointer"
                              >
                                <span className="flex items-end gap-[2px] h-3">
                                  <span className="w-0.5 bg-white rounded-full animate-bounce h-3 [animation-delay:-0.3s]" />
                                  <span className="w-0.5 bg-white rounded-full animate-bounce h-2 [animation-delay:-0.15s]" />
                                  <span className="w-0.5 bg-white rounded-full animate-bounce h-3.5" />
                                  <span className="w-0.5 bg-white rounded-full animate-bounce h-2 [animation-delay:-0.2s]" />
                                </span>
                                <Pause className="w-3 h-3 fill-current ml-0.5" />
                                <span>Đang phát</span>
                              </button>
                            ) : isVoiceActive ? (
                              <button
                                type="button"
                                onClick={() => handleTogglePlay(voice)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Tiếp tục</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleTogglePlay(voice)}
                                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg border border-border text-text-secondary hover:border-accent hover:text-accent hover:bg-accent-light/50 text-xs font-medium transition-all cursor-pointer shadow-2xs"
                              >
                                <Play className="w-3 h-3 fill-current transition-transform group-hover:scale-110" />
                                <span>Nghe thử</span>
                              </button>
                            )
                          ) : (
                            <span className="text-xs text-text-muted italic">
                              Chưa có file
                            </span>
                          )}
                        </td>

                        {/* Thao tác */}
                        <td className="px-4 py-3.5 align-middle text-right pr-5">
                          <button
                            type="button"
                            onClick={(e) => handleToggleMenu(e, voice)}
                            disabled={actionLoading === voice.id}
                            className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            aria-label="Mở menu thao tác"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Docked Sticky Bottom Audio Player */}
          {playingVoice && (
            <div className="flex-shrink-0 border-t border-border bg-surface/95 backdrop-blur px-5 py-3 shadow-lg flex items-center justify-between gap-4 animate-in slide-in-from-bottom-2 duration-200">
              {/* Left: Info */}
              <div className="flex items-center gap-3 min-w-[200px] max-w-xs">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                  <Mic className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {playingVoice.name}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {playingVoice.description || "Đang nghe thử giọng mẫu"}
                  </p>
                </div>
              </div>

              {/* Center: Controls & Scrubber */}
              <div className="flex-1 max-w-xl flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleTogglePlay(playingVoice)}
                  className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors shadow-sm flex-shrink-0 cursor-pointer"
                  title={isPlaying ? "Tạm dừng" : "Tiếp tục phát"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <span className="text-xs font-mono text-text-muted tabular-nums w-10 text-right">
                  {fmt(currentTime)}
                </span>

                {/* Scrubber bar */}
                <div
                  onClick={handleSeek}
                  className="flex-1 h-2 bg-bg border border-border rounded-full cursor-pointer relative group flex items-center"
                >
                  <div
                    className="h-full bg-accent rounded-full relative transition-all"
                    style={{ width: `${audioProgress}%` }}
                  >
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-accent border-2 border-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <span className="text-xs font-mono text-text-muted tabular-nums w-10">
                  {fmt(duration)}
                </span>
              </div>

              {/* Right: Close button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStopAudio}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-bg rounded-lg transition-colors cursor-pointer"
                  title="Đóng trình phát"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Portal Menu */}
      {isMounted &&
        menuAnchor &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: `${menuAnchor.top}px`,
              right: `${menuAnchor.right}px`,
              zIndex: 9999,
            }}
            className="bg-surface border border-border rounded-xl shadow-xl py-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setVoiceModalConfig({ isOpen: true, voice: menuAnchor.voice });
                setMenuAnchor(null);
              }}
              className="w-full px-3.5 py-2 text-left text-sm text-text-primary hover:bg-bg flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-text-secondary" />
              <span>Sửa</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDeletingVoice(menuAnchor.voice);
                setMenuAnchor(null);
              }}
              className="w-full px-3.5 py-2 text-left text-sm text-error hover:bg-error-light/50 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-error" />
              <span>Xóa</span>
            </button>
          </div>,
          document.body,
        )}

      {/* Reusable Voice Modal (Create & Update) */}
      <VoiceModal
        isOpen={voiceModalConfig.isOpen}
        voice={voiceModalConfig.voice}
        onClose={() => setVoiceModalConfig({ isOpen: false, voice: null })}
        onSuccess={fetchVoices}
      />

      {/* Custom Reusable Delete Confirmation Modal */}
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

export default ManageVoicePage;
