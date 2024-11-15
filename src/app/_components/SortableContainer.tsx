type Props = {
  title: string;
};

export default function SortableContainer({ title }: Props) {
  const items = ["記事A", "記事B", "記事C"]; // 仮データ

  return (
    <div className="bg-white text-gray-800 flex w-64 flex-col rounded-2xl p-6 shadow-lg transition-shadow duration-300 hover:shadow-2xl">
      {/* タイトル */}
      <h2 className="mb-6 text-center text-xl font-extrabold tracking-wide text-[#4caf50]">
        {title}
      </h2>

      {/* アイテム */}
      {items.map((item, index) => (
        <div
          key={index}
          className="text-gray-700 mb-4 cursor-pointer rounded-lg bg-[#f5faf6] p-3 text-center shadow transition-colors duration-300 hover:bg-[#e2f5e4]"
        >
          {item}
        </div>
      ))}
    </div>
  );
}
