import Link from "next/link";

export default function Signout() {
  return (
    <Link href="/api/auth/signout" className="text-red-600 hover:text-red-800">
      Sign Out
    </Link>
  );
}
