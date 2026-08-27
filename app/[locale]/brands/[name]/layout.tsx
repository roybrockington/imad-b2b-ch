import type { Metadata } from "next";

type Props = {
  params: Promise<{ name: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  // Convert dashed URL slug back to brand name with spaces and capitalize
  const brandName = name
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${brandName} | Sound Service`,
  };
}

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
