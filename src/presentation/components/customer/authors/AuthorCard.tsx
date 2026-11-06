import Link from 'next/link';
import { Headphones } from 'lucide-react';
import { ROUTES } from '@/src/shared/constants';
import { AuthorAvatar } from './AuthorAvatar';
import type { CustomerAuthorSummary } from '@/src/shared/types';
import { resolveMediaUrl } from '@/src/shared/utils/media.utils';

interface AuthorCardProps {
  author: CustomerAuthorSummary;
}

export const AuthorCard = ({ author }: AuthorCardProps) => (
  <article className="group flex h-full flex-col items-center rounded-2xl border border-slate-200/80 bg-white px-5 pb-5 pt-7 text-center shadow-sm shadow-slate-200/40 transition duration-200 hover:-translate-y-1 hover:border-accent/25 hover:shadow-lg hover:shadow-accent/5 motion-reduce:transform-none motion-reduce:transition-none sm:px-6">
    <AuthorAvatar author={{ name: author.fullName, portrait: resolveMediaUrl(author.avatar ?? undefined) }} />
    <h2 className="mt-5 text-lg font-bold tracking-tight text-slate-900">{author.fullName}</h2>
    <p className="mt-1 text-xs leading-5 text-slate-500">{author.specialty || 'Tác giả sách nói'}</p>
    <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-600">
      <Headphones className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
      {author.bookCount} sách nói
    </span>
    <Link
      href={ROUTES.CUSTOMER.AUTHOR_DETAIL(String(author.id))}
      aria-label={`Xem tác phẩm của ${author.fullName}`}
      className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-accent hover:bg-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      Xem tác phẩm
    </Link>
  </article>
);
