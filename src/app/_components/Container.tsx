import SortableContainer from "./SortableContainer";

export default function Container() {
  const columns = ["未着手", "進行中", "完了", "全記事"];

  return (
    <div className="flex flex-grow items-start justify-around gap-6 rounded-xl bg-gradient-to-b from-[#e8f5e9] to-[#c8e6c9] p-10 shadow-lg">
      {columns.map((column) => (
        <SortableContainer key={column} title={column} />
      ))}
    </div>
  );
}
