import React, { useMemo, useState } from "react";
import { Button } from "@/src/presentation/components/common";
import type { Chapter } from "@/src/shared/types";
import { Check, Combine, Plus, Search } from "lucide-react";

interface ChapterListProps {
  chapters: Chapter[];
  selectedChapterId: number | null;
  filteredChapters: Chapter[];
  chapterSearch: string;
  onSearchChange: (value: string) => void;
  onSelectChapter: (chapterId: number) => void;
  onAddChapter: () => void;
  /** Gộp các chương đã chọn (đã liền nhau, theo thứ tự); trả về true khi xong để thoát chế độ chọn */
  onMergeChapters: (chapters: Chapter[]) => Promise<boolean>;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  selectedChapterId,
  filteredChapters,
  chapterSearch,
  onSearchChange,
  onSelectChapter,
  onAddChapter,
  onMergeChapters,
}) => {
  const [isMergeMode, setIsMergeMode] = useState(false);
  const [mergeIds, setMergeIds] = useState<Set<number>>(new Set());
  const [isMerging, setIsMerging] = useState(false);

  // Các chương đã chọn theo thứ tự, và chúng có liền nhau trong cả sách hay không
  const sortedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.chapterOrder - b.chapterOrder),
    [chapters]
  );
  const selectedIndexes = sortedChapters.flatMap((chapter, index) => (mergeIds.has(chapter.id) ? [index] : []));
  const selectedChapters = selectedIndexes.map((index) => sortedChapters[index]);
  const isConsecutive =
    selectedIndexes.length > 0 &&
    selectedIndexes[selectedIndexes.length - 1] - selectedIndexes[0] === selectedIndexes.length - 1;
  const canMerge = selectedChapters.length >= 2 && isConsecutive && !isMerging;

  const exitMergeMode = () => {
    setIsMergeMode(false);
    setMergeIds(new Set());
  };

  const toggleMergeId = (id: number) =>
    setMergeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const merge = async () => {
    if (!canMerge) return;
    setIsMerging(true);
    try {
      if (await onMergeChapters(selectedChapters)) exitMergeMode();
    } finally {
      setIsMerging(false);
    }
  };

  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  // Chỉ hiện tooltip khi tiêu đề thực sự bị cắt bớt
  const showTooltip = (e: React.MouseEvent<HTMLElement>, text: string) => {
    const el = e.currentTarget;
    if (el.scrollWidth <= el.clientWidth) return;
    const rect = el.getBoundingClientRect();
    setTooltip({ text, x: rect.left, y: rect.top });
  };

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-border gap-2 flex-shrink-0">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-text-primary whitespace-nowrap">
            Danh sách chương ({chapters.length})
          </h2>
          <p className="text-[11px] text-text-muted whitespace-nowrap">
            {isMergeMode ? "Chọn các chương liền nhau để gộp" : "Chọn chương để duyệt nội dung"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            variant={isMergeMode ? "secondary" : "ghost"}
            size="sm"
            onClick={() => (isMergeMode ? exitMergeMode() : setIsMergeMode(true))}
            className="text-xs px-2.5 py-1.5 whitespace-nowrap"
            title={isMergeMode ? "Thoát chế độ gộp chương" : "Chọn nhiều chương liền nhau để gộp thành một"}
            aria-pressed={isMergeMode}
          >
            <Combine className="w-3.5 h-3.5" />
            <span>{isMergeMode ? "Thoát" : "Gộp"}</span>
          </Button>
          {!isMergeMode && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAddChapter}
              className="text-xs px-2.5 py-1.5 shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm chương</span>
            </Button>
          )}
        </div>
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
            const isChecked = mergeIds.has(chapter.id);
            const isSelected = isMergeMode ? isChecked : selectedChapterId === chapter.id;

            return (
              <div
                key={chapter.id}
                onClick={() => (isMergeMode ? toggleMergeId(chapter.id) : onSelectChapter(chapter.id))}
                role={isMergeMode ? "checkbox" : undefined}
                aria-checked={isMergeMode ? isChecked : undefined}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? "bg-accent/10 border-accent text-text-primary shadow-sm ring-1 ring-accent/30"
                    : "bg-bg/50 border-border/80 hover:bg-bg hover:border-accent/40 text-text-secondary"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isMergeMode && (
                    <span
                      aria-hidden
                      className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isChecked ? "bg-accent border-accent text-white" : "bg-surface border-border"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" strokeWidth={3} />}
                    </span>
                  )}
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isSelected
                        ? "bg-accent text-white"
                        : "bg-surface text-text-muted border border-border"
                    }`}
                  >
                    {String(chapter.chapterOrder).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        onMouseEnter={(e) =>
                          showTooltip(e, chapter.title || `Chương ${chapter.chapterOrder}`)
                        }
                        onMouseLeave={() => setTooltip(null)}
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

      {isMergeMode && (
        <div className="flex-shrink-0 border-t border-border pt-3 mt-2 space-y-2">
          <p className="text-xs text-text-secondary" aria-live="polite">
            {selectedChapters.length === 0
              ? "Chưa chọn chương nào"
              : !isConsecutive
                ? "Chỉ gộp được các chương liền nhau"
                : selectedChapters.length < 2
                  ? "Chọn thêm ít nhất 1 chương liền kề"
                  : `Gộp ${selectedChapters.length} chương vào "${selectedChapters[0].title || `Chương ${selectedChapters[0].chapterOrder}`}"`}
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={exitMergeMode} disabled={isMerging}>
              Hủy
            </Button>
            <Button size="sm" onClick={merge} disabled={!canMerge}>
              <Combine className="w-3.5 h-3.5" />
              {isMerging ? "Đang gộp..." : `Gộp${selectedChapters.length >= 2 ? ` (${selectedChapters.length})` : ""}`}
            </Button>
          </div>
        </div>
      )}

      {tooltip && (
        <div
          style={{ left: tooltip.x, top: tooltip.y - 8 }}
          className="fixed z-50 max-w-xs -translate-y-full px-2.5 py-1.5 rounded-lg bg-text-primary text-bg text-xs font-medium shadow-lg pointer-events-none"
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};
