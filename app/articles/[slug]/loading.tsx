export default function ArticleLoading() {
  return (
    <main className="page-main">
      <div className="site-container grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="h-[440px] animate-pulse rounded-[34px] border border-white/8 bg-white/5" />
          <div className="h-[680px] animate-pulse rounded-[34px] border border-white/8 bg-white/5" />
        </div>
        <div className="h-[420px] animate-pulse rounded-[30px] border border-white/8 bg-white/5" />
      </div>
    </main>
  );
}
