import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-black mb-6">
          DA Audiobooks
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8">
          Nền tảng sách nói chất lượng cao
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/customer"
            className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-yellow-300 hover:text-indigo-900 transition-all shadow-lg"
          >
            Khách hàng
          </Link>
          <Link
            href="/admin"
            className="px-8 py-4 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 transition-all border border-indigo-500"
          >
            Quản trị viên
          </Link>
        </div>
      </div>
    </div>
  );
}
