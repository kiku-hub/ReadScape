export default function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="border-blue-500 h-12 w-12 animate-spin rounded-full border-t-4" />
    </div>
  );
}
