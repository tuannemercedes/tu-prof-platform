type Props = {
  url?: string | null;
  label?: string | null;
};

export default function TreinoAppBanner({ url, label }: Props) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-black text-white text-sm font-medium px-4 py-2 hover:bg-gray-800 transition-colors"
    >
      {label} →
    </a>
  );
}
