"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { bookService, purchaseService } from "@/src/infrastructure/api/services";
import { useAuth } from "@/src/presentation/hooks";
import { BookDetail, Book, PaymentResponse } from "@/src/shared/types";

// ============================================================================
// DỮ LIỆU MẪU CHUẨN XÁC THEO ẢNH CHỤP CHO "ỨNG DỤNG AI TRONG GIÁO DỤC"
// ============================================================================

interface SampleChapter {
  id: string;
  title: string;
  duration: string;
  isFree: boolean;
}

const SAMPLE_BOOK = {
  id: "ai-in-education",
  title: "Ứng dụng AI trong giáo dục",
  author: "Rose Luckin",
  category: "Khoa học - Công nghệ",
  listens: 743,
  chaptersCount: 11,
  duration: "01 giờ 22 phút",
  rating: 5.0,
  reviewsCount: 1,
  price: 249000,
  description:
    'Trí tuệ nhân tạo đang từng bước thay đổi cách chúng ta dạy và học, từ thiết kế bài giảng, xây dựng học liệu đến cá nhân hóa trải nghiệm học tập. "Ứng dụng AI trong giáo dục" mang đến góc nhìn thực tiễn về cách khai thác AI như một công cụ hỗ trợ giáo viên, học sinh và các nhà quản lý giáo dục. Cuốn sách giúp người đọc hiểu những ứng dụng nổi bật của AI trong giáo dục, đồng thời gợi mở cách sử dụng các công cụ AI hiệu quả, sáng tạo và có trách nhiệm. Đây là tài liệu phù hợp cho giáo viên, phụ huynh, người học và những ai quan tâm đến tương lai của giáo dục trong thời đại số. Hãy cùng lắng nghe "Ứng dụng AI trong giáo dục" để khám phá cách AI có thể trở thành người đồng hành, góp phần nâng cao hiệu quả dạy và học.',
  tags: [
    "Khoa học - Công nghệ",
    "Tư duy - Sáng tạo",
    "Phương pháp học tập",
    "Công nghệ thông tin",
  ],
  chapters: [
    {
      id: "ch-0",
      title: "Lời giới thiệu: Ứng dụng AI trong giáo dục",
      duration: "56 phút",
      isFree: true,
    },
    {
      id: "ch-1",
      title: "Chương 1 - AI là gì và tại sao nó có thể 'Cách mạng giáo dục'?",
      duration: "20 phút",
      isFree: true,
    },
    {
      id: "ch-2",
      title: "Chương 2 - Những thách thức trong giáo dục và AI",
      duration: "25 phút",
      isFree: true,
    },
    {
      id: "ch-3",
      title: "Chương 3 - Dữ liệu: Lộ trình mới",
      duration: "25 phút",
      isFree: false,
    },
    {
      id: "ch-4",
      title: "Chương 4 - Nhìn nhận dữ liệu theo cách khác",
      duration: "18 phút",
      isFree: false,
    },
    {
      id: "ch-5",
      title: "Chương 5 - Ứng dụng AI để hiểu dữ liệu",
      duration: "22 phút",
      isFree: false,
    },
    {
      id: "ch-6",
      title: "Chương 6 - Học hỏi từ AI",
      duration: "19 phút",
      isFree: false,
    },
    {
      id: "ch-7",
      title: "Chương 7 - Cân câu hỏi và đạo đức và tiếp theo...",
      duration: "20 phút",
      isFree: false,
    },
  ] as SampleChapter[],
  authorBooks: [
    {
      id: "author-b1",
      title: "Tiếp cận AI để nâng cao chất lượng đào tạo (Ứng dụng AI)",
      author: "Rose Luckin & Karine George",
      category: "Khoa học - Công nghệ",
      price: 199000,
      duration: "3h 40m",
      rating: 4.9,
      type: "ai-training",
    },
  ],
  similarBooks: [
    {
      id: "sim-1",
      title: "Moonshot: Kỳ tích Pfizer",
      subtitle: "9 tháng chạy đua biến điều không thể thành có thể",
      author: "TS. Albert Bourla",
      category: "Khoa học - Kinh tế",
      price: 219000,
      duration: "6h 15m",
      rating: 4.9,
      type: "moonshot",
    },
    {
      id: "sim-2",
      title: "Sự trỗi dậy của xã hội công nghệ",
      subtitle: "The Rise of Technosocialism",
      author: "Brett King & Dr. Richard Petty",
      category: "Công nghệ",
      price: 239000,
      duration: "5h 50m",
      rating: 4.8,
      type: "technosocialism",
    },
    {
      id: "sim-3",
      title: "Chat GPT & 10++ ứng dụng AI đình đám",
      subtitle: "Cẩm nang làm chủ kỷ nguyên số",
      author: "Tuấn Hà - Vinalink",
      category: "Công nghệ thông tin",
      price: 189000,
      duration: "4h 20m",
      rating: 4.9,
      type: "chatgpt",
    },
    {
      id: "sim-4",
      title: "Tóm lược Chuyển đổi số: Chiến lược & Lộ trình",
      subtitle: "David L. Rogers",
      author: "David L. Rogers",
      category: "Quản trị - Công nghệ",
      price: 220000,
      duration: "5h 10m",
      rating: 4.8,
      type: "digital-trans",
    },
    {
      id: "sim-5",
      title: "Du hành vũ trụ mạng",
      subtitle: "Khám phá chiều không gian số",
      author: "Nhiều tác giả",
      category: "Khoa học",
      price: 179000,
      duration: "4h 45m",
      rating: 4.7,
      type: "cyber-space",
    },
  ],
};

// ============================================================================
// COMPONENT CHÍNH
// ============================================================================

export const BookDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const bookIdParam = params?.id as string;

  // Dữ liệu sách & chapters từ Backend hoặc Fallback
  const [book, setBook] = useState<any>(SAMPLE_BOOK);
  const [chapters, setChapters] = useState<SampleChapter[]>(
    SAMPLE_BOOK.chapters,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Trình nghe thử âm thanh (Audio Preview Player)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentChapter, setCurrentChapter] = useState<SampleChapter | null>(
    null,
  );
  const [audioProgress, setAudioProgress] = useState<number>(15);

  // Authentication & Payment
  const { user, isAuthenticated } = useAuth();
  const [currentPayment, setCurrentPayment] = useState<PaymentResponse | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Modal mua sách & VietQR
  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);
  const [isPurchased, setIsPurchased] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Copy helper
  const copyToClipboard = (text: string, fieldName: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleOpenBuyModal = async () => {
    if (isPurchased) {
      handlePlayPreview();
      return;
    }

    const targetBookId = !isNaN(Number(book.id))
      ? Number(book.id)
      : (!isNaN(Number(bookIdParam)) ? Number(bookIdParam) : 35);

    const token = typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

    if (!isAuthenticated && !token) {
      router.push(`/login?redirect=/customer/books/${targetBookId}`);
      return;
    }

    setPaymentSuccess(false);
    setIsBuyModalOpen(true);
    setIsPaymentLoading(true);

    try {
      // Backend: Tự động tái sử dụng đơn PENDING cũ nếu có, nếu chưa thì tạo mới
      const paymentData = await purchaseService.createPayment(targetBookId);
      setCurrentPayment(paymentData);

      if (paymentData?.status === "PAID" || paymentData?.paymentStatus === "PAID") {
        setPaymentSuccess(true);
        setIsPurchased(true);
      }
    } catch (err: any) {
      console.error("Lỗi khi tải thông tin thanh toán:", err);
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message || "Không thể tải thông tin thanh toán";
      if (code === 4010 || err.response?.status === 401) {
        setIsBuyModalOpen(false);
        router.push(`/login?redirect=/customer/books/${targetBookId}`);
      } else {
        alert(msg);
      }
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // Polling tự động kiểm tra trạng thái thanh toán khi mở modal
  useEffect(() => {
    if (!isBuyModalOpen || paymentSuccess || !currentPayment?.id) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await purchaseService.getPaymentStatus(currentPayment.id);
        if (res?.status === "PAID" || res?.paymentStatus === "PAID") {
          setPaymentSuccess(true);
          setIsPurchased(true);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      } catch (e) {
        // Tiếp tục poll ở chu kỳ kế tiếp
      }
    };

    pollingRef.current = setInterval(checkStatus, 2500);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isBuyModalOpen, paymentSuccess, currentPayment?.id]);

  // Kiểm tra quyền sở hữu sách nếu đã đăng nhập
  useEffect(() => {
    let isMounted = true;
    const checkOwnership = async () => {
      const targetBookId = !isNaN(Number(book.id))
        ? Number(book.id)
        : (!isNaN(Number(bookIdParam)) ? Number(bookIdParam) : 35);

      const token = typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

      if (token && targetBookId) {
        try {
          const owned = await purchaseService.checkPurchase(targetBookId);
          if (isMounted && owned) {
            setIsPurchased(true);
          }
        } catch {
          // ignore
        }
      }
    };
    checkOwnership();
    return () => {
      isMounted = false;
    };
  }, [bookIdParam, book.id]);

  // Cuộn ngang các kệ sách liên quan
  const similarRowRef = useRef<HTMLDivElement>(null);

  const scrollSimilarRow = (direction: "left" | "right") => {
    if (similarRowRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      similarRowRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // 1. Tải chi tiết sách từ Backend nếu ID là số hợp lệ
  useEffect(() => {
    let isMounted = true;
    const fetchBookData = async () => {
      setIsLoading(true);
      try {
        if (bookIdParam && !isNaN(Number(bookIdParam))) {
          // Gọi API Backend lấy sách thật
          const apiBook = await bookService.getBookById(bookIdParam);
          let apiChapters: any[] = [];
          try {
            apiChapters = await bookService.getChapters(bookIdParam);
          } catch {
            apiChapters = [];
          }

          if (isMounted) {
            setBook({
              ...SAMPLE_BOOK,
              id: apiBook.id,
              title: apiBook.title || SAMPLE_BOOK.title,
              author: apiBook.author || SAMPLE_BOOK.author,
              category: apiBook.category?.name || SAMPLE_BOOK.category,
              description: apiBook.description || SAMPLE_BOOK.description,
              coverImage: apiBook.coverImage,
              price: apiBook.price || SAMPLE_BOOK.price,
              rating: apiBook.rating || 5.0,
              listens: apiBook.totalListens || 743,
              chaptersCount: apiChapters.length || 11,
            });

            if (apiChapters.length > 0) {
              setChapters(
                apiChapters.map((ch, idx) => ({
                  id: String(ch.id),
                  title: ch.title || `Chương ${idx + 1}`,
                  duration: ch.duration
                    ? `${Math.round(ch.duration / 60)} phút`
                    : `${15 + (idx % 10)} phút`,
                  isFree: idx < 3, // 3 chương đầu nghe thử miễn phí
                })),
              );
            }
          }
        } else {
          // Dùng dữ liệu chuẩn theo ảnh mẫu
          if (isMounted) {
            setBook(SAMPLE_BOOK);
            setChapters(SAMPLE_BOOK.chapters);
          }
        }
      } catch (err) {
        console.warn("Dùng dữ liệu sách mặc định do không tìm thấy ID:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBookData();
    return () => {
      isMounted = false;
    };
  }, [bookIdParam]);

  // Hành động bắt đầu nghe thử
  const handlePlayPreview = (chapter?: SampleChapter) => {
    const targetChapter = chapter || chapters[0];
    setCurrentChapter(targetChapter);
    setIsPlaying(true);
  };

  // Render bìa sách đồ họa (theo mẫu chuẩn trong ảnh)
  const renderVisualCover = (type: string, title: string, author: string) => {
    if (book.coverImage) {
      return (
        <img
          src={book.coverImage}
          alt={title}
          className="w-full h-full object-cover"
        />
      );
    }

    return (
      <div className="w-full h-full bg-gradient-to-b from-[#164e87] via-[#113a69] to-[#0c2849] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden select-none">
        {/* Họa tiết vi mạch AI mờ */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Tác giả đầu bìa */}
        <div className="text-center relative z-10">
          <p className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold text-sky-200/90">
            {author.toUpperCase()}
          </p>
        </div>

        {/* Logo AI & Hình tam giác đồ họa vi mạch */}
        <div className="my-auto text-center relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-sky-300/80 flex items-center justify-center mb-3 bg-sky-900/40 backdrop-blur-sm shadow-lg shadow-sky-500/20">
            <span className="text-xs sm:text-sm font-extrabold tracking-tighter text-sky-200">
              AI EDU
            </span>
          </div>

          <div className="relative py-2">
            <div className="w-32 sm:w-40 h-28 sm:h-36 border border-sky-400/40 rounded-t-full flex items-center justify-center relative">
              <span className="text-4xl sm:text-5xl opacity-40">🤖</span>
              <div className="absolute inset-x-2 bottom-2 h-0.5 bg-sky-400/50" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase text-center mt-2 leading-tight">
            ỨNG DỤNG AI
          </h2>
          <h3 className="text-sm sm:text-base font-bold tracking-widest text-sky-300 uppercase mt-1">
            TRONG GIÁO DỤC
          </h3>
        </div>

        {/* Footer bìa */}
        <div className="text-center relative z-10 border-t border-sky-400/30 pt-2">
          <p className="text-[9px] text-sky-200/80">
            Tiếp cận AI để nâng cao chất lượng đào tạo
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 sm:space-y-12 pb-24 selection:bg-rose-600 selection:text-white">
      {/* ===================================================================== */}
      {/* 1. BREADCRUMB ĐIỀU HƯỚNG                                               */}
      {/* ===================================================================== */}
      <nav aria-label="Breadcrumb" className="pt-2">
        <ol className="flex items-center flex-wrap gap-2 text-xs text-slate-500 font-medium">
          <li>
            <Link
              href="/customer"
              className="hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              <span>Trang chủ</span>
            </Link>
          </li>
          <li className="text-slate-400">/</li>
          <li>
            <Link
              href="/customer/store"
              className="hover:text-rose-600 transition-colors"
            >
              Sách nói
            </Link>
          </li>
          <li className="text-slate-400">/</li>
          <li>
            <span className="text-slate-600">{book.category}</span>
          </li>
          <li className="text-slate-400">/</li>
          <li className="text-rose-600 font-semibold truncate max-w-[200px] sm:max-w-md">
            {book.title}
          </li>
        </ol>
      </nav>

      {/* ===================================================================== */}
      {/* 2. HERO SECTION: BÌA SÁCH & THÔNG TIN CHÍNH                           */}
      {/* ===================================================================== */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
          {/* Bìa sách bên trái */}
          <div className="w-56 sm:w-64 md:w-72 lg:w-80 flex-shrink-0 aspect-[3/4.2] rounded-2xl overflow-hidden shadow-xl shadow-slate-300/60 border border-slate-200/90 relative group">
            {renderVisualCover("ai-edu", book.title, book.author)}

            {/* Badge Bestseller / Nổi bật */}
            {/* <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-[10px] font-bold text-slate-800 border border-slate-200 shadow-sm">
              Bản quyền chính thức
            </div> */}
          </div>

          {/* Cột thông tin chi tiết bên phải */}
          <div className="flex-1 min-w-0 text-center md:text-left flex flex-col justify-between self-stretch">
            <div>
              {/* Tiêu đề & Nút Favorite */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {book.title}
                </h1>

                {/* Nút yêu thích Heart */}
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-2.5 rounded-full border transition-all ${
                    isFavorite
                      ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm"
                      : "bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200"
                  }`}
                  aria-label="Thêm vào yêu thích"
                  title={
                    isFavorite
                      ? "Đã lưu vào danh sách yêu thích"
                      : "Thêm vào yêu thích"
                  }
                >
                  <svg
                    className="w-5 h-5"
                    fill={isFavorite ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              {/* Tác giả & Thể loại */}
              <div className="mt-3 space-y-1 text-sm text-slate-600">
                <p>
                  Tác giả:{" "}
                  <span className="font-bold text-slate-900 hover:text-rose-600 cursor-pointer transition-colors">
                    {book.author}
                  </span>
                </p>
                <p>
                  Thể loại:{" "}
                  <span className="font-semibold text-rose-600">
                    {book.category}
                  </span>
                </p>
              </div>

              {/* Thông số thống kê: Lượt nghe, Số chương, Thời lượng */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-base text-rose-600">🎧</span>
                  <span>
                    <strong className="text-slate-900 font-bold">
                      {book.listens?.toLocaleString("vi-VN")}
                    </strong>{" "}
                    lượt nghe
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-base text-rose-600">📑</span>
                  <span>
                    <strong className="text-slate-900 font-bold">
                      {chapters.length || book.chaptersCount}
                    </strong>{" "}
                    chương
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-base text-rose-600">⏱️</span>
                  <span>{book.duration}</span>
                </div>
              </div>

              {/* Đánh giá sao */}
              <div className="flex items-center justify-center md:justify-start gap-2 mt-4 text-xs">
                <div className="flex items-center text-amber-400 text-sm">
                  {"★".repeat(5)}
                </div>
                <span className="font-bold text-slate-900">
                  {book.rating ? book.rating.toFixed(1) : "5.0"}
                </span>
                <span className="text-slate-400">
                  ({book.reviewsCount || 1} đánh giá)
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS (ĐẶC BIỆT CÓ THÊM NÚT MUA SÁCH THEO YÊU CẦU) */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5">
              {/* Nút 1: Nghe thử miễn phí */}
              <button
                type="button"
                onClick={() => handlePlayPreview()}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-md shadow-rose-600/30 hover:shadow-lg hover:shadow-rose-600/40 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Nghe thử miễn phí</span>
              </button>

              {/* Nút 2: MUA SÁCH (ĐƯỢC THÊM MỚI THEO YÊU CẦU USER) */}
              <button
                type="button"
                onClick={handleOpenBuyModal}
                className={`w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2.5 border-2 transition-all shadow-sm ${
                  isPurchased
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700 cursor-default"
                    : "bg-white border-rose-600 text-rose-600 hover:bg-rose-50 hover:border-rose-700 hover:scale-[1.02] active:scale-95"
                }`}
              >
                {isPurchased ? (
                  <>
                    <span className="text-base">✓</span>
                    <span>Đã sở hữu sách</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>
                      Mua sách • {book.price?.toLocaleString("vi-VN")} đ
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. SECTION: GIỚI THIỆU & TAGS                                         */}
      {/* ===================================================================== */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-4">
          Giới thiệu
        </h2>
        <div className="text-sm sm:text-base text-slate-600 leading-relaxed space-y-3">
          <p>{book.description}</p>
        </div>

        {/* Tags / Nhãn từ khóa */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100">
          {book.tags?.map((tag: string, idx: number) => (
            <span
              key={`tag-${idx}`}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 border border-slate-200 hover:border-rose-200 cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. SECTION: DANH SÁCH CHƯƠNG                                          */}
      {/* ===================================================================== */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Danh sách chương
          </h2>
          <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full">
            {chapters.length} chương
          </span>
        </div>

        {/* Lưới 2 cột các chương */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {chapters.map((chapter, idx) => {
            const isUnlocked = chapter.isFree || isPurchased;
            const isCurrentPlaying =
              isPlaying && currentChapter?.id === chapter.id;

            return (
              <div
                key={chapter.id}
                className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                  isCurrentPlaying
                    ? "bg-rose-50/70 border-rose-300 shadow-sm"
                    : isUnlocked
                      ? "bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-sm"
                      : "bg-slate-50/60 border-slate-200/70 text-slate-400"
                }`}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h3
                    className={`text-xs sm:text-sm font-semibold truncate ${
                      isUnlocked
                        ? "text-slate-900 hover:text-rose-600 cursor-pointer"
                        : "text-slate-500"
                    }`}
                    title={chapter.title}
                    onClick={() => {
                      if (isUnlocked) handlePlayPreview(chapter);
                      else handleOpenBuyModal();
                    }}
                  >
                    {chapter.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-slate-400">
                      {chapter.duration}
                    </span>
                    {chapter.isFree && !isPurchased && (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                        Miễn phí
                      </span>
                    )}
                  </div>
                </div>

                {/* Nút hành động cho chương */}
                <div className="flex-shrink-0">
                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => handlePlayPreview(chapter)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isCurrentPlaying
                          ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105"
                          : "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200"
                      }`}
                      aria-label="Phát chương"
                    >
                      {isCurrentPlaying ? (
                        <span className="text-xs">❚❚</span>
                      ) : (
                        <svg
                          className="w-4 h-4 fill-current ml-0.5"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenBuyModal}
                      className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center border border-slate-200 transition-colors"
                      title="Chương bị khóa, mua sách để mở khóa"
                      aria-label="Chương bị khóa"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. SECTION: CÙNG TÁC GIẢ                                              */}
      {/* ===================================================================== */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Cùng tác giả
          </h2>
          <Link
            href={`/customer/store?search=${encodeURIComponent(book.author)}`}
            className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1"
          >
            <span>Xem tất cả</span>
            <span>→</span>
          </Link>
        </div>

        <div className="flex items-stretch gap-5 overflow-x-auto pb-2 scrollbar-none">
          {SAMPLE_BOOK.authorBooks.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push(`/customer/books/${item.id}`)}
              className="w-44 sm:w-52 flex-shrink-0 group cursor-pointer"
            >
              <div className="aspect-[3/4.2] w-full rounded-xl overflow-hidden shadow-md shadow-slate-200/80 group-hover:shadow-xl group-hover:shadow-rose-600/15 group-hover:scale-[1.03] transition-all duration-300 relative border border-slate-200/90 bg-[#164e87] text-white p-4 flex flex-col justify-between">
                <div className="text-center">
                  <p className="text-[8px] font-semibold tracking-wider text-sky-200 uppercase">
                    ROSE LUCKIN & KARINE GEORGE
                  </p>
                </div>
                <div className="text-center my-auto">
                  <div className="w-10 h-10 mx-auto rounded-full border border-sky-300 flex items-center justify-center mb-2">
                    🤖
                  </div>
                  <h4 className="text-xs font-bold uppercase leading-tight text-white">
                    TIẾP CẬN AI ĐỂ NÂNG CAO CHẤT LƯỢNG ĐÀO TẠO
                  </h4>
                </div>
                <div className="text-center text-[7px] text-sky-200 border-t border-sky-400/30 pt-1">
                  Audio Book Bản Quyền
                </div>
              </div>
              <div className="mt-2.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-rose-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {item.author}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                  <span className="text-amber-500 font-bold">
                    ★ {item.rating}
                  </span>
                  <span>•</span>
                  <span>{item.price.toLocaleString("vi-VN")} đ</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 6. SECTION: ĐẦU SÁCH TƯƠNG TỰ                                         */}
      {/* ===================================================================== */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Đầu sách tương tự
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href="/customer/store"
              className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <span>→</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollSimilarRow("left")}
                className="p-1.5 rounded-full bg-white hover:bg-rose-600 text-slate-600 hover:text-white border border-slate-200 shadow-sm transition-all"
                aria-label="Cuộn trái"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollSimilarRow("right")}
                className="p-1.5 rounded-full bg-white hover:bg-rose-600 text-slate-600 hover:text-white border border-slate-200 shadow-sm transition-all"
                aria-label="Cuộn phải"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Shelf cuộn ngang */}
        <div
          ref={similarRowRef}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {SAMPLE_BOOK.similarBooks.map((simBook) => (
            <div
              key={simBook.id}
              onClick={() => router.push(`/customer/books/${simBook.id}`)}
              className="w-40 sm:w-48 md:w-52 flex-shrink-0 snap-start group cursor-pointer"
            >
              {/* Bìa sách đồ họa tương ứng */}
              <div className="aspect-[3/4.2] w-full rounded-xl overflow-hidden shadow-md shadow-slate-200/90 group-hover:shadow-xl group-hover:shadow-rose-600/15 group-hover:scale-[1.03] transition-all duration-300 relative border border-slate-200/90 bg-white">
                {/* Visual Cover mô phỏng theo từng đầu sách trong ảnh */}
                {simBook.type === "moonshot" ? (
                  <div className="w-full h-full bg-[#f8fafc] text-slate-900 p-3.5 flex flex-col justify-between border-t-4 border-blue-600">
                    <div className="text-center">
                      <h4 className="text-base font-extrabold text-blue-900 tracking-tight">
                        Moonshot
                      </h4>
                      <p className="text-[10px] font-bold text-slate-600">
                        Kỳ tích Pfizer
                      </p>
                    </div>
                    <div className="text-center my-auto">
                      <div className="w-8 h-12 mx-auto border border-blue-400 rounded-sm mb-1 flex items-center justify-center text-xs">
                        🧪
                      </div>
                      <p className="text-[8px] text-slate-500 italic">
                        9 tháng chạy đua biến điều không thể thành có thể
                      </p>
                    </div>
                    <div className="text-center text-[8px] font-bold text-blue-700">
                      TIẾN SĨ ALBERT BOURLA
                    </div>
                  </div>
                ) : simBook.type === "technosocialism" ? (
                  <div className="w-full h-full bg-[#fdfbf7] text-slate-900 p-3.5 flex flex-col justify-between border-t-4 border-rose-600">
                    <div className="text-center text-[7px] font-semibold text-slate-500 uppercase">
                      BRETT KING & DR. RICHARD PETTY
                    </div>
                    <div className="text-center my-auto">
                      <div className="text-2xl mb-1">✊💻</div>
                      <h4 className="text-[11px] font-black leading-tight text-slate-900 uppercase">
                        SỰ TRỖI DẬY CỦA XÃ HỘI CÔNG NGHỆ
                      </h4>
                      <p className="text-[7px] text-rose-600 font-bold uppercase mt-0.5">
                        THE RISE OF TECHNOSOCIALISM
                      </p>
                    </div>
                    <div className="text-center text-[7px] text-slate-400 border-t border-slate-200 pt-0.5">
                      Bản Quyền Độc Quyền
                    </div>
                  </div>
                ) : simBook.type === "chatgpt" ? (
                  <div className="w-full h-full bg-[#0a0a0c] text-amber-400 p-3.5 flex flex-col justify-between border border-amber-500/30">
                    <div className="text-center text-[7px] font-semibold text-slate-400">
                      TUẤN HÀ - VINALINK
                    </div>
                    <div className="text-center my-auto">
                      <h4 className="text-xl font-black text-amber-400 tracking-widest">
                        CHAT GPT
                      </h4>
                      <div className="text-[9px] font-bold text-white mt-1">
                        & 10++ ỨNG DỤNG AI ĐÌNH ĐÁM
                      </div>
                    </div>
                    <div className="text-center text-[7px] text-amber-500 font-bold">
                      Bestseller Công Nghệ
                    </div>
                  </div>
                ) : simBook.type === "digital-trans" ? (
                  <div className="w-full h-full bg-[#0f281e] text-white p-3.5 flex flex-col justify-between border-t-4 border-emerald-500">
                    <div className="text-center text-[7px] text-emerald-200">
                      TÓM LƯỢC CHIẾN LƯỢC
                    </div>
                    <div className="text-center my-auto">
                      <h4 className="text-xs font-black uppercase text-emerald-300 leading-tight">
                        CHUYỂN ĐỔI SỐ
                      </h4>
                      <p className="text-[8px] text-white/80 mt-1">
                        Chiến lược & Lộ trình
                      </p>
                    </div>
                    <div className="text-center text-[8px] text-emerald-400 font-bold">
                      DAVID L. ROGERS
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-purple-900 to-indigo-950 text-white p-3.5 flex flex-col justify-between">
                    <div className="text-center text-[7px] text-purple-200">
                      KHÁM PHÁ KHÔNG GIAN SỐ
                    </div>
                    <div className="text-center my-auto">
                      <div className="text-2xl mb-1">🚀🌐</div>
                      <h4 className="text-xs font-black uppercase text-white">
                        DU HÀNH VŨ TRỤ MẠNG
                      </h4>
                    </div>
                    <div className="text-center text-[7px] text-purple-300">
                      Sách Bản Quyền
                    </div>
                  </div>
                )}

                {/* Audio Pill */}
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-medium text-white flex items-center gap-1">
                  <span>🎧</span>
                  <span>{simBook.duration}</span>
                </div>
              </div>

              {/* Thông tin đầu sách */}
              <div className="mt-2.5">
                <h4
                  className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-rose-600 transition-colors"
                  title={simBook.title}
                >
                  {simBook.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {simBook.author}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                  <span className="text-amber-500 font-bold">
                    ★ {simBook.rating}
                  </span>
                  <span>•</span>
                  <span>{simBook.price.toLocaleString("vi-VN")} đ</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 7. BOTTOM STICKY AUDIO PLAYER (KHI BẤM NGHE THỬ)                     */}
      {/* ===================================================================== */}
      {isPlaying && currentChapter && (
        <aside
          aria-label="Trình phát âm thanh"
          className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl p-3 sm:p-4 transition-all"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Sách & Chương đang nghe */}
            <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
              <div className="w-12 h-14 rounded-lg bg-rose-600 text-white flex items-center justify-center flex-shrink-0 text-xl font-bold shadow-md shadow-rose-600/30">
                🎧
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {currentChapter.title}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {book.title} • {book.author}
                </p>
              </div>
            </div>

            {/* Thanh điều khiển Play / Pause / Progress */}
            <div className="flex flex-col items-center gap-1.5 w-full sm:max-w-md">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setAudioProgress((prev) => Math.max(0, prev - 10))
                  }
                  className="text-slate-500 hover:text-slate-800 text-xs font-bold"
                  title="Lùi 10 giây"
                >
                  -10s
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all"
                  aria-label={isPlaying ? "Tạm dừng" : "Tiếp tục phát"}
                >
                  {isPlaying ? (
                    <span className="text-xs font-bold">❚❚</span>
                  ) : (
                    <span className="text-xs font-bold ml-0.5">▶</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAudioProgress((prev) => Math.min(100, prev + 10))
                  }
                  className="text-slate-500 hover:text-slate-800 text-xs font-bold"
                  title="Tiến 10 giây"
                >
                  +10s
                </button>
              </div>

              {/* Thanh tiến trình thời gian */}
              <div className="w-full flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span>02:15</span>
                <div
                  className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden cursor-pointer relative"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = ((e.clientX - rect.left) / rect.width) * 100;
                    setAudioProgress(pct);
                  }}
                >
                  <div
                    className="h-full bg-rose-600 rounded-full transition-all"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                <span>{currentChapter.duration}</span>
              </div>
            </div>

            {/* Action Mua Ngay & Nút Đóng */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {!isPurchased && (
                <button
                  type="button"
                  onClick={handleOpenBuyModal}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors whitespace-nowrap"
                >
                  Mua trọn bộ
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Đóng thanh nghe"
              >
                ✕
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ===================================================================== */}
      {/* 8. MODAL MUA SÁCH (VIETQR THANH TOÁN TỰ ĐỘNG)                          */}
      {/* ===================================================================== */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-7 relative animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            {/* Nút đóng */}
            <button
              type="button"
              onClick={() => setIsBuyModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors z-10"
              aria-label="Đóng"
            >
              ✕
            </button>

            {/* Header Modal */}
            <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
              <div className="w-12 h-16 rounded-lg bg-[#164e87] text-white flex items-center justify-center text-xl flex-shrink-0 shadow-sm overflow-hidden">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "🎧"
                )}
              </div>
              <div className="pr-6 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  Thanh toán VietQR 24/7
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1 line-clamp-1">
                  {book.title}
                </h3>
                <p className="text-xs font-extrabold text-rose-600 mt-0.5">
                  {(book.price || 100000).toLocaleString("vi-VN")} đ
                </p>
              </div>
            </div>

            {paymentSuccess ? (
              /* Trạng thái: ĐÃ THANH TOÁN THÀNH CÔNG */
              <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
                  ✓
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Thanh toán thành công
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-2">
                    Mở khóa thành công sách nói!
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 px-4">
                    Chúc mừng bạn đã sở hữu trọn bộ {chapters.length} chương
                    audio của cuốn sách{" "}
                    <span className="font-semibold text-slate-900">
                      "{book.title}"
                    </span>
                    .
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBuyModalOpen(false);
                      handlePlayPreview(chapters[0]);
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Bắt đầu nghe sách ngay</span>
                    <span>🎧</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Trạng thái: CHƯA THANH TOÁN (PENDING) - HIỆN QR & THÔNG TIN */
              <>
                {/* 1. MÃ QR VIETQR THEO ĐÚNG LINK MẪU */}
                <div className="text-center bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 mt-4 relative">
                  {isPaymentLoading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-500 font-medium">
                        Đang tải mã thanh toán...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="inline-block bg-white p-2.5 rounded-xl border border-slate-200 shadow-md">
                        <img
                          src={
                            currentPayment?.qrUrl ||
                            `https://vietqr.app/img?bank=Vietcombank&acc=SBSEPAYL39V6TXCOZQD&template=compact&amount=${currentPayment?.amount || book.price || 100000}&des=${currentPayment?.paymentCode || "SP" + book.id}`
                          }
                          alt="Mã QR thanh toán VietQR"
                          className="w-56 h-auto sm:w-64 max-w-full mx-auto rounded-lg object-contain"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2.5 font-medium flex items-center justify-center gap-1.5">
                        <span>📲</span>
                        <span>
                          Mở app Ngân hàng bất kỳ để quét mã QR chuyển khoản
                        </span>
                      </p>
                    </>
                  )}
                </div>

                {/* 2. THÔNG TIN THANH TOÁN CHI TIẾT */}
                <div className="mt-3.5 bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
                  {/* Ngân hàng */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">
                      Ngân hàng:
                    </span>
                    <span className="font-bold text-slate-900">
                      Vietcombank (VCB)
                    </span>
                  </div>

                  {/* Chủ tài khoản */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">
                      Chủ tài khoản:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs uppercase tracking-wide">
                        AudioBook
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard("AudioBook", "holder")
                        }
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-semibold transition-colors"
                      >
                        {copiedField === "holder" ? "Đã chép ✓" : "Sao chép"}
                      </button>
                    </div>
                  </div>

                  {/* Số tài khoản */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">
                      Số tài khoản:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                        SBSEPAYL39V6TXCOZQD
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard("SBSEPAYL39V6TXCOZQD", "acc")
                        }
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-semibold transition-colors"
                      >
                        {copiedField === "acc" ? "Đã chép ✓" : "Sao chép"}
                      </button>
                    </div>
                  </div>

                  {/* Số tiền */}
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Số tiền:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-sm">
                        {Number(
                          currentPayment?.amount || book.price || 100000,
                        ).toLocaleString("vi-VN")}{" "}
                        đ
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            String(
                              currentPayment?.amount || book.price || 100000,
                            ),
                            "amount",
                          )
                        }
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-semibold transition-colors"
                      >
                        {copiedField === "amount" ? "Đã chép ✓" : "Sao chép"}
                      </button>
                    </div>
                  </div>

                  {/* Nội dung chuyển khoản */}
                  <div className="flex items-center justify-between bg-amber-50/80 p-2 rounded-lg border border-amber-200/70">
                    <div>
                      <span className="text-amber-900 font-bold block">
                        Nội dung CK:
                      </span>
                      <span className="text-[10px] text-amber-700">
                        Vui lòng nhập đúng mã
                      </span>
                    </div>
                    <div className="flex items-center gap-2 max-w-[65%]">
                      <span
                        className="font-bold font-mono text-amber-950 bg-white px-2 py-1 rounded border border-amber-300 text-xs truncate"
                        title={currentPayment?.paymentCode || "SP" + book.id}
                      >
                        {currentPayment?.paymentCode || "Đang lấy mã..."}
                      </span>
                      <button
                        type="button"
                        disabled={!currentPayment?.paymentCode}
                        onClick={() =>
                          copyToClipboard(
                            currentPayment?.paymentCode || "",
                            "des",
                          )
                        }
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded text-[11px] font-bold shadow-sm transition-colors whitespace-nowrap"
                      >
                        {copiedField === "des" ? "Đã chép ✓" : "Sao chép"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trạng thái thanh toán (Auto-Polling) */}
                <div className="mt-3 flex items-center justify-center gap-2 py-2 px-3 bg-amber-50/80 text-amber-800 text-[11px] rounded-xl border border-amber-200/80 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>
                    Trạng thái: Đang chờ chuyển khoản (Tự động nhận diện)
                  </span>
                </div>

                {/* Footer Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBuyModalOpen(false)}
                    className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetailPage;
