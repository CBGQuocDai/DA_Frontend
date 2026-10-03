import React from "react";
import { Button } from "@/src/presentation/components/ui";
import type { Chapter } from "@/src/shared/types";
import { getChapterStatusBadge } from "@/src/presentation/utils/chapterStatus";
import { Volume2, Plus, Search } from "lucide-react";

interface ChapterListProps {
  chapters: Chapter[];
  selectedChapterId: number | null;
  filteredChapters: Chapter[];
  chapterSearch: string;
  onSearchChange: (value: string) => void;
  onSelectChapter: (chapterId: number) => void;
  onAddChapter: () => void;
}

const getWordCount = (text?: string) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  selectedChapterId,
  filteredChapters,
  chapterSearch,
  onSearchChange,
  onSelectChapter,
  onAddChapter,
}) => {
  return (
    <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-border gap-2 flex-shrink-0">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-text-primary whitespace-nowrap">
            Danh sách chương ({chapters.length})
          </h2>
          <p className="text-[11px] text-text-muted whitespace-nowrap">
            Chọn chương để duyệt nội dung
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onAddChapter}
          className="text-xs px-2.5 py-1.5 shadow-sm whitespace-nowrap flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm chương</span>
        </Button>
      </div>

      <div className="py-2.5 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            value={chapterSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên hoặc số chương..."
            className="w-full pl-8 pr-3 py-1.5 bg-bg border border-border rounded-lg text-xs focus:outline-none focus:border-accent"
          />
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1 pt-1">
        {filteredChapters.length === 0 ? (
          <div className="py-12 text-center text-text-muted text-xs">
            <p>Không tìm thấy chương nào</p>
          </div>
        ) : (
          filteredChapters.map((chapter) => {
            const isSelected = selectedChapterId === chapter.id;
            const wordCount = getWordCount(chapter.rawText);
            const hasAudio =
              !!chapter.audioUrl || chapter.status === "AUDIO_READY";

            return (
              <div
                key={chapter.id}
                onClick={() => onSelectChapter(chapter.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? "bg-accent/10 border-accent text-text-primary shadow-sm ring-1 ring-accent/30"
                    : "bg-bg/50 border-border/80 hover:bg-bg hover:border-accent/40 text-text-secondary"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-accent text-white"
                        : "bg-surface text-text-muted border border-border"
                    }`}
                  >
                    {chapter.chapterOrder < 10
                      ? `0${chapter.chapterOrder}`
                      : chapter.chapterOrder}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isSelected ? "text-accent" : "text-text-primary"
                        }`}
                      >
                        {chapter.title || `Chương ${chapter.chapterOrder}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChapterList;
