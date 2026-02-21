type GameJsonLdProps = {
  title: string;
  description: string;
  slug: string;
  thumbnailUrl: string | null;
  creatorName: string;
  publishedAt: string | null;
};

export function GameJsonLd({
  title,
  description,
  slug,
  thumbnailUrl,
  creatorName,
  publishedAt,
}: GameJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vibehunt.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: title,
    description,
    url: `${baseUrl}/games/${slug}`,
    ...(thumbnailUrl ? { image: thumbnailUrl } : {}),
    author: {
      "@type": "Person",
      name: creatorName,
    },
    gamePlatform: "Web Browser",
    applicationCategory: "Game",
    operatingSystem: "Any",
    ...(publishedAt ? { datePublished: publishedAt } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
