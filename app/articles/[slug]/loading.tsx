export default function ArticleLoading() {
  return (
    <main className="page-main">
      <div className="site-container grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="theme-skeleton h-[440px] animate-pulse rounded-[34px]" />
          <div className="theme-skeleton h-[680px] animate-pulse rounded-[34px]" />
        </div>
        <div className="theme-skeleton h-[420px] animate-pulse rounded-[30px]" />
      </div>
    </main>
  );
}
