"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/presentation/hooks";

type ProfileTab = "profile" | "favorites" | "purchased" | "password";

interface FavoriteBookItem {
  id: string | number;
  title: string;
  author: string;
  category: string;
  coverImage?: string;
  rating: number;
  duration: string;
  price: number;
}

interface PurchasedBookItem {
  id: string | number;
  orderCode: string;
  title: string;
  author: string;
  category: string;
  coverImage?: string;
  purchaseDate: string;
  amount: number;
  totalChapters: number;
}

export const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  // Tab mặc định là 'profile' theo đúng yêu cầu người dùng
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");

  // State Form Thông tin cá nhân
  const [fullName, setFullName] = useState<string>("Nguyễn Việt Pháp");
  const [email, setEmail] = useState<string>("vietphap2708@gmail.com");
  const [phone, setPhone] = useState<string>("0912 345 678");
  const [gender, setGender] = useState<string>("Nam");
  const [birthDate, setBirthDate] = useState<string>("2002-08-27");
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // State Form Đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isChangingPass, setIsChangingPass] = useState<boolean>(false);
  const [passMessage, setPassMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Đồng bộ thông tin user từ Auth Hook nếu có
  useEffect(() => {
    if (user) {
      if (user.fullName) setFullName(user.fullName);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Mock dữ liệu: Sách yêu thích
  const [favorites, setFavorites] = useState<FavoriteBookItem[]>([
    {
      id: "35",
      title: "Đắc nhân tâm",
      author: "Dale Carnegie",
      category: "Tâm lý học",
      rating: 5.0,
      duration: "02 giờ 45 phút",
      price: 249000,
      coverImage: "https://storage.googleapis.com/do_an/books/35/cover/cover.jpg",
    },
    {
      id: "history-vn",
      title: "Truyện đọc Lịch sử Việt Nam (Tập 1)",
      author: "GS Đinh Xuân Lâm - Lê Quang Chấn",
      category: "Lịch sử",
      rating: 4.9,
      duration: "03 giờ 15 phút",
      price: 189000,
    },
    {
      id: "ai-edu",
      title: "Ứng dụng AI trong giáo dục",
      author: "Rose Luckin",
      category: "Khoa học - Công nghệ",
      rating: 5.0,
      duration: "01 giờ 22 phút",
      price: 249000,
    },
  ]);

  // Mock dữ liệu: Sách đã mua
  const [purchasedBooks] = useState<PurchasedBookItem[]>([
    {
      id: "35",
      orderCode: "ORD2026102401",
      title: "Đắc nhân tâm",
      author: "Dale Carnegie",
      category: "Tâm lý học",
      purchaseDate: "24/10/2026",
      amount: 249000,
      totalChapters: 12,
      coverImage: "https://storage.googleapis.com/do_an/books/35/cover/cover.jpg",
    },
    {
      id: "36",
      orderCode: "ORD2026102008",
      title: "Nghĩ giàu & Làm giàu",
      author: "Napoleon Hill",
      category: "Kinh doanh & Tài chính",
      purchaseDate: "20/10/2026",
      amount: 100000,
      totalChapters: 15,
      coverImage: "https://storage.googleapis.com/do_an/books/36/cover/cover.jpg",
    },
  ]);

  // Xóa khỏi danh sách yêu thích
  const handleRemoveFavorite = (id: string | number) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  // Lưu thông tin cá nhân
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMsg(null);
    setTimeout(() => {
      setIsSavingProfile(false);
      setProfileSuccessMsg("Cập nhật thông tin cá nhân thành công!");
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    }, 600);
  };

  // Đổi mật khẩu
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassMessage({ type: "error", text: "Vui lòng điền đầy đủ các trường mật khẩu." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMessage({ type: "error", text: "Mật khẩu mới và xác nhận mật khẩu không trùng khớp." });
      return;
    }
    if (newPassword.length < 6) {
      setPassMessage({ type: "error", text: "Mật khẩu mới phải có tối thiểu 6 ký tự." });
      return;
    }

    setIsChangingPass(true);
    setPassMessage(null);
    setTimeout(() => {
      setIsChangingPass(false);
      setPassMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPassMessage(null), 3500);
    }, 700);
  };

  // Helper render bìa sách nghệ thuật nếu không có ảnh
  const renderBookCardCover = (title: string, author: string, coverImage?: string) => {
    if (coverImage) {
      return (
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // fallback nếu ảnh lỗi
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      );
    }

    return (
      <div className="w-full h-full bg-gradient-to-b from-[#164e87] via-[#113a69] to-[#0c2849] text-white p-3.5 flex flex-col justify-between relative overflow-hidden select-none group-hover:scale-105 transition-transform duration-300">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />
        <div className="text-center relative z-10">
          <p className="text-[8px] tracking-wider uppercase font-semibold text-sky-200 line-clamp-1">
            {author}
          </p>
        </div>
        <div className="my-auto text-center relative z-10 px-1">
          <span className="text-2xl mb-1 block">📖</span>
          <h5 className="font-bold text-xs text-white leading-snug line-clamp-2">
            {title}
          </h5>
        </div>
        <div className="text-center relative z-10 border-t border-sky-400/30 pt-1">
          <span className="text-[8px] text-rose-300 font-semibold uppercase tracking-wider">
            Audio Bản Quyền
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb điều hướng */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/customer" className="hover:text-rose-600 transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Tài khoản cá nhân</span>
        </nav>

        {/* Layout 2 Cột chính */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================================================================= */}
          {/* CỘT TRÁI: SIDEBAR THÔNG TIN TÀI KHOẢN & MENU                      */}
          {/* ================================================================= */}
          <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
            
            {/* Card Avatar & Tên người dùng */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 text-center">
              
              {/* Logo / Avatar Vuông bo tròn theo chuẩn ảnh mẫu */}
              <div className="relative inline-block mx-auto mb-4 group">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-700 text-white flex flex-col items-center justify-center shadow-lg shadow-rose-600/30 overflow-hidden border-2 border-white">
                  <span className="text-2xl font-black tracking-tight leading-none">
                    Tammi
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-rose-100 mt-0.5">
                    BOOKS
                  </span>
                </div>
                {/* Nút camera thay avatar */}
                <button
                  type="button"
                  title="Thay đổi ảnh đại diện"
                  className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-slate-900 hover:bg-rose-600 text-white flex items-center justify-center text-xs shadow-md border-2 border-white transition-colors"
                >
                  📷
                </button>
              </div>

              {/* Tên người dùng */}
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {fullName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{email}</p>

              {/* Huy hiệu tài khoản (ĐÃ BỎ PHẦN NÂNG CẤP VIP THEO YÊU CẦU) */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Thành viên Độc giả</span>
              </div>

              {/* Thống kê nhanh */}
              <div className="grid grid-cols-2 gap-2 mt-5 pt-5 border-t border-slate-100 text-center">
                <div
                  onClick={() => setActiveTab("favorites")}
                  className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <span className="text-xs text-slate-500 block">Yêu thích</span>
                  <span className="text-base font-extrabold text-rose-600">
                    {favorites.length}
                  </span>
                </div>
                <div
                  onClick={() => setActiveTab("purchased")}
                  className="p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <span className="text-xs text-slate-500 block">Đã mua</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {purchasedBooks.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu điều hướng dọc (Đúng thứ tự yêu cầu: Thông tin profile -> Yêu thích -> Sách đã mua) */}
            <nav className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3 space-y-1">
              
              {/* Mục 1: Thông tin profile (Mặc định) */}
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "profile"
                    ? "bg-rose-50 text-rose-600 border border-rose-200/80 shadow-xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-base">👤</span>
                <span>Thông tin profile</span>
              </button>

              {/* Mục 2: Yêu thích */}
              <button
                type="button"
                onClick={() => setActiveTab("favorites")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "favorites"
                    ? "bg-rose-50 text-rose-600 border border-rose-200/80 shadow-xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">❤️</span>
                  <span>Yêu thích</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === "favorites"
                      ? "bg-rose-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {favorites.length}
                </span>
              </button>

              {/* Mục 3: Sách đã mua */}
              <button
                type="button"
                onClick={() => setActiveTab("purchased")}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "purchased"
                    ? "bg-rose-50 text-rose-600 border border-rose-200/80 shadow-xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">📚</span>
                  <span>Sách đã mua</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === "purchased"
                      ? "bg-rose-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {purchasedBooks.length}
                </span>
              </button>

              {/* Mục 4: Đổi mật khẩu */}
              <button
                type="button"
                onClick={() => setActiveTab("password")}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === "password"
                    ? "bg-rose-50 text-rose-600 border border-rose-200/80 shadow-xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-base">🔒</span>
                <span>Đổi mật khẩu</span>
              </button>

              <div className="pt-2 border-t border-slate-100">
                {/* Mục 5: Đăng xuất */}
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    router.push("/login");
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <span className="text-base">🚪</span>
                  <span>Đăng xuất</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* ================================================================= */}
          {/* CỘT PHẢI: KHU VỰC HIỂN THỊ NỘI DUNG CHÍNH (MAIN CONTENT)          */}
          {/* ================================================================= */}
          <main className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 min-h-[580px]">
            
            {/* --------------------------------------------------------------- */}
            {/* TAB 1: THÔNG TIN PROFILE (MỤC MẶC ĐỊNH)                         */}
            {/* --------------------------------------------------------------- */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header Tab */}
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Tài khoản của tôi
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                    THÔNG TIN PROFILE
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Quản lý thông tin hồ sơ để bảo mật và tối ưu trải nghiệm đọc sách
                  </p>
                </div>

                {/* Thông báo thành công */}
                {profileSuccessMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <span className="text-base">✓</span>
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                {/* Form chỉnh sửa profile */}
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    {/* Họ và tên */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Họ và tên <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                        placeholder="Nhập họ và tên"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 block">
                          Địa chỉ Email
                        </label>
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                          Đã xác thực ✓
                        </span>
                      </div>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed select-none"
                        placeholder="email@example.com"
                      />
                    </div>

                    {/* Số điện thoại */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                        placeholder="0912 345 678"
                      />
                    </div>

                    {/* Giới tính */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Giới tính
                      </label>
                      <div className="flex items-center gap-4 pt-2">
                        {["Nam", "Nữ", "Khác"].map((item) => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                            <input
                              type="radio"
                              name="gender"
                              value={item}
                              checked={gender === item}
                              onChange={(e) => setGender(e.target.value)}
                              className="text-rose-600 focus:ring-rose-500"
                            />
                            <span>{item}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Ngày sinh */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                      />
                    </div>

                    {/* Ngày tham gia */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Ngày tham gia
                      </label>
                      <input
                        type="text"
                        value="15/10/2026"
                        disabled
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed select-none"
                      />
                    </div>
                  </div>

                  {/* Nút Submit */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (user?.fullName) setFullName(user.fullName);
                        if (user?.phone) setPhone(user.phone);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Đặt lại
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-7 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all flex items-center gap-2"
                    >
                      {isSavingProfile ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <span>Lưu thay đổi</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* TAB 2: YÊU THÍCH (THEO ĐÚNG MẪU BÌA SÁCH TRONG ẢNH)             */}
            {/* --------------------------------------------------------------- */}
            {activeTab === "favorites" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header Tab */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      Thư viện cá nhân
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                      SÁCH YÊU THÍCH
                    </h1>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                    {favorites.length} cuốn sách
                  </span>
                </div>

                {favorites.length === 0 ? (
                  /* Empty state */
                  <div className="text-center py-16 px-4 space-y-3">
                    <span className="text-4xl block">🤍</span>
                    <h3 className="text-base font-bold text-slate-800">
                      Chưa có cuốn sách nào trong danh sách yêu thích
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Hãy dạo qua kho sách nói phong phú và bấm nút tim để lưu lại những cuốn sách bạn yêu thích nhé!
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/customer/store"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all"
                      >
                        Khám phá sách nói ngay
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Grid Sách yêu thích chuẩn theo tỉ lệ bìa trong ảnh */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-5">
                    {favorites.map((item) => (
                      <div
                        key={item.id}
                        className="group bg-white rounded-2xl border border-slate-200/90 hover:border-rose-300 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative"
                      >
                        {/* Khung bìa sách chuẩn tỉ lệ 3:4.5 giống ảnh mẫu */}
                        <div className="relative aspect-[3/4.2] overflow-hidden bg-slate-100">
                          {renderBookCardCover(item.title, item.author, item.coverImage)}

                          {/* Nút Bỏ yêu thích góc trên */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleRemoveFavorite(item.id);
                            }}
                            title="Xóa khỏi yêu thích"
                            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-rose-600 hover:bg-rose-600 hover:text-white shadow-sm flex items-center justify-center text-xs transition-colors z-10"
                          >
                            ✕
                          </button>

                          {/* Badge Thể loại */}
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-bold text-white z-10">
                            {item.category}
                          </span>
                        </div>

                        {/* Thông tin bên dưới */}
                        <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                          <div>
                            <Link href={`/customer/books/${item.id}`}>
                              <h4
                                className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug"
                                title={item.title}
                              >
                                {item.title}
                              </h4>
                            </Link>
                            <p className="text-[11px] text-slate-500 mt-1 truncate">
                              {item.author}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">
                              ⏱️ {item.duration}
                            </span>
                            <Link
                              href={`/customer/books/${item.id}`}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1"
                            >
                              <span>Nghe</span>
                              <span>🎧</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* TAB 3: SÁCH ĐÃ MUA                                              */}
            {/* --------------------------------------------------------------- */}
            {activeTab === "purchased" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header Tab */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      Thư viện bản quyền
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                      SÁCH ĐÃ MUA
                    </h1>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                    {purchasedBooks.length} cuốn đã sở hữu vĩnh viễn
                  </span>
                </div>

                {purchasedBooks.length === 0 ? (
                  /* Empty state */
                  <div className="text-center py-16 px-4 space-y-3">
                    <span className="text-4xl block">📚</span>
                    <h3 className="text-base font-bold text-slate-800">
                      Bạn chưa mua cuốn sách bản quyền nào
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Mua sách để sở hữu trọn bộ audio chất lượng cao và quyền tải về không giới hạn.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/customer/store"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all"
                      >
                        Xem kho sách nói
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Grid Sách đã mua */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {purchasedBooks.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 bg-white flex gap-4 items-center group"
                      >
                        {/* Bìa sách thu nhỏ */}
                        <div className="w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden shadow-md relative bg-slate-100">
                          {renderBookCardCover(item.title, item.author, item.coverImage)}
                        </div>

                        {/* Thông tin chi tiết */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Đã mua ✓
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.orderCode}
                            </span>
                          </div>

                          <Link href={`/customer/books/${item.id}`}>
                            <h4
                              className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors truncate"
                              title={item.title}
                            >
                              {item.title}
                            </h4>
                          </Link>

                          <p className="text-xs text-slate-500 truncate">
                            {item.author}
                          </p>

                          <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                            <span>Ngày mua: {item.purchaseDate}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">
                              {item.totalChapters} chương
                            </span>
                          </div>

                          {/* Action button */}
                          <div className="pt-2">
                            <Link
                              href={`/customer/books/${item.id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
                            >
                              <span>Nghe trọn bộ</span>
                              <span>🎧</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --------------------------------------------------------------- */}
            {/* TAB 4: ĐỔI MẬT KHẨU                                             */}
            {/* --------------------------------------------------------------- */}
            {activeTab === "password" && (
              <div className="space-y-6 max-w-lg animate-in fade-in duration-200">
                {/* Header Tab */}
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Bảo mật tài khoản
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                    ĐỔI MẬT KHẨU
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Nên sử dụng mật khẩu mạnh kết hợp chữ hoa, chữ thường và chữ số
                  </p>
                </div>

                {/* Thông báo kết quả */}
                {passMessage && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      passMessage.type === "success"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                  >
                    <span>{passMessage.type === "success" ? "✓" : "⚠️"}</span>
                    <span>{passMessage.text}</span>
                  </div>
                )}

                {/* Form Đổi mật khẩu */}
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Mật khẩu hiện tại <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Mật khẩu mới <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={isChangingPass}
                      className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all flex items-center gap-2"
                    >
                      {isChangingPass ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Đang cập nhật...</span>
                        </>
                      ) : (
                        <span>Cập nhật mật khẩu</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
