export default function header() {
  return (
    <header className="flex items-center justify-between rounded-b-2xl bg-[#f1fdf5] p-6 shadow-lg">
      {/* ロゴ */}
      <h1 className="text-3xl font-extrabold tracking-tight text-[#4caf50] transition duration-300 ease-in-out hover:text-[#43a047]">
        Read Scape
      </h1>

      {/* ボタン */}
      <button className="text-white flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4caf50] to-[#66bb6a] px-6 py-3 font-bold shadow-lg transition-transform duration-300 hover:scale-105 hover:from-[#43a047] hover:to-[#81c784]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4 4m0 0l4-4m-4 4V4"
          />
        </svg>
        logout
      </button>
    </header>
  );
}
