import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/">
      <h1 className="text-gray-900 text-2xl font-bold">
        <span className="text-[#4caf50]">Read</span> Scape
      </h1>
    </Link>
  );
}
