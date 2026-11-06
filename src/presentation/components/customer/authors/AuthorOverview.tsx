import { LibraryBig } from 'lucide-react';
import { AuthorAvatar } from './AuthorAvatar';

interface AuthorOverviewProps {
  author: { name: string; bio?: string; portrait?: string; bookCount: number | null };
}

export const AuthorOverview = ({ author }: AuthorOverviewProps) => (
  <section aria-labelledby="author-name" className="rounded-2xl border border-white bg-gradient-to-br from-white via-white to-accent-light/60 p-5 shadow-sm shadow-slate-200/50 sm:p-7 lg:p-8">
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start lg:gap-8">
      <AuthorAvatar author={author} variant="profile" />
      <div className="min-w-0 flex-1 text-center sm:text-left">
        <h1 id="author-name" className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">{author.name}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">{author.bio || 'Thông tin giới thiệu tác giả đang được cập nhật.'}</p>
        <div className="mt-5 flex items-center justify-center gap-3 border-t border-slate-200/70 pt-4 sm:justify-start">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-light text-accent">
            <LibraryBig className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="text-left">
            <p className="text-xl font-bold leading-6 text-slate-900">{author.bookCount ?? '—'}</p>
            <p className="mt-0.5 text-xs text-slate-500">Tác phẩm sách nói</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
