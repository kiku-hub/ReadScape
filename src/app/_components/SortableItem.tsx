type Props = {
  content: string;
};

export default function SortableItem({ content }: Props) {
  return (
    <div className="bg-white hover:bg-gray-100 mb-2 cursor-grab rounded-lg p-2 text-center shadow">
      {content}
    </div>
  );
}
