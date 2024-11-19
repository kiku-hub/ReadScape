export default function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative">
        {/* メインのスピナー */}
        <div className="border-slate-200 border-t-blue-500 h-16 w-16 animate-spin rounded-full border-4" />

        {/* 内側の装飾的なリング */}
        <div className="border-blue-400/30 absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border-2" />

        {/* 中心の点 */}
        <div className="bg-blue-500 absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
      </div>
    </div>
  );
}
