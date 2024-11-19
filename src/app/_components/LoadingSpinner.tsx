interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="bg-transparent flex min-h-full flex-col items-center justify-center">
      <div className="relative">
        {/* 外側のリング - ゆっくり回転 */}
        <div className="animate-spin-slow h-20 w-20 rounded-full border-4 border-green-one/30" />

        {/* 中間のリング - 逆回転 */}
        <div className="animate-spin-reverse absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-green-three/40" />

        {/* 内側のリング - パルス */}
        <div className="animate-pulse-slow absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-green-four/50" />

        {/* 中心の点 */}
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-five/60 shadow-[0_0_12px_rgba(57,112,94,0.3)]" />
      </div>

      {/* メッセージ */}
      {message && (
        <p className="animate-fade-in mt-8 text-base font-medium tracking-wide text-green-five">
          {message}
        </p>
      )}
    </div>
  );
}
