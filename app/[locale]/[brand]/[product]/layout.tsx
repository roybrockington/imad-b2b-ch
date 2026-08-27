import type { Metadata } from "next";
import { api } from "@/lib/api";

type Props = {
  params: Promise<{ brand: string; product: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, product: productSlug } = await params;

  try {
    // Fetch the actual product data to get the real brand name and product name
    const productData = await api.getProductByBrandAndName(brand, productSlug);

    // Get the brand name
    const brandName = productData.brand?.name || brand
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Get the product name (use name1_en from description if available, otherwise fallback to name)
    const productName = productData.description?.name1_en || productData.name;

    return {
      title: `${brandName} ${productName} | Sound Service`,
    };
  } catch (error) {
    // Fallback if API call fails
    const brandName = brand
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const productName = productSlug
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      title: `${brandName} ${productName} | Sound Service`,
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
