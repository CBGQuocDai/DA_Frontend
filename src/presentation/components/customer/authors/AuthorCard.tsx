import Link from 'next/link';
import { ROUTES } from '@/src/shared/constants';
import { AuthorAvatar } from './AuthorAvatar';
import type { Author } from '@/src/shared/types';
import { resolveMediaUrl } from '@/src/shared/utils/media.utils';

interface AuthorCardProps {
  author: Author;
}

export const AuthorCard = ({ author }: AuthorCardProps) => {
  const name = author.fullName || 'Tác giả';
  return (
  <article className="group flex h-full flex-col items-center rounded-2xl border border-slate-200/80 bg-white px-5 pb-5 pt-7 text-center shadow-sm shadow-slate-200/40 transition duration-200 hover:-translate-y-1 hover:border-accent/25 hover:shadow-lg hover:shadow-accent/5 motion-reduce:transform-none motion-reduce:transition-none sm:px-6">
    <AuthorAvatar author={{ name, portrait: resolveMediaUrl(author.avatar?.url) }} />
    <h2 className="mt-5 text-lg font-bold tracking-tight text-slate-900">{name}</h2>
    <p className="mt-1 text-xs leading-5 text-slate-500">Tác giả sách nói</p>
    <Link
      href={ROUTES.CUSTOMER.AUTHOR_DETAIL(String(author.id))}
      aria-label={`Xem tác phẩm của ${name}`}
      className="mt-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-accent hover:bg-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      Xem tác phẩm
    </Link>
  </article>
  );
};
