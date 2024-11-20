interface ArticleCardProps {
  title: string;
  url: string;
  description: string;
  status: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  url,
  description,
  status,
}) => {
  return (
    <div className="bg-gray-800/50 hover:bg-gray-800/70 rounded-lg p-4 transition-all">
      <h3 className="text-white mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-gray-300 mb-2">{description}</p>
      <div className="flex items-center justify-between">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          記事を読む
        </a>
        <span className="bg-gray-700 text-gray-300 rounded px-2 py-1 text-sm">
          {status}
        </span>
      </div>
    </div>
  );
};
