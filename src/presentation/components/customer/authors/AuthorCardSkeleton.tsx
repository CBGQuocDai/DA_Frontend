export const AuthorCardSkeleton = () => (
  <div aria-hidden="true" className="flex min-h-78 animate-pulse flex-col items-center rounded-2xl border border-slate-200/80 bg-white px-6 pb-5 pt-7 motion-reduce:animate-none">
    <div className="h-24 w-24 rounded-full bg-slate-100" />
    <div className="mt-5 h-5 w-3/4 rounded bg-slate-100" />
    <div className="mt-3 h-3 w-full rounded bg-slate-100" />
    <div className="mt-4 h-6 w-24 rounded-full bg-slate-100" />
    <div className="mt-5 h-10 w-full rounded-xl bg-slate-100" />
  </div>
);
