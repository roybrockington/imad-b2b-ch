import { redirect, notFound } from 'next/navigation';
import { buildLocalePath } from '@/lib/utils';
import { locales } from '@/i18n';

interface ArtikelPageProps {
  params: Promise<{
    locale: string;
    article: string;
  }>;
}

async function getProductByArticle(article: string) {
  // Build API URL - strip trailing /api if present and add it back
  let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  // Ensure we have the full path
  if (!apiBaseUrl.endsWith('/api')) {
    apiBaseUrl = apiBaseUrl + '/api';
  }

  const fullUrl = `${apiBaseUrl}/artikel/${article}`;

  try {
    const response = await fetch(fullUrl, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`API request failed: ${response.status} - ${fullUrl}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product by article:', error);
    return null;
  }
}

export default async function ArtikelPage({ params }: ArtikelPageProps) {
  const { locale, article } = await params;

  // Fetch product information from API
  const productData = await getProductByArticle(article);

  if (!productData || !productData.brand_slug || !productData.product_slug) {
    // If product not found, return 404
    notFound();
  }

  // Build the product path
  const productPath = `/${productData.brand_slug}/${productData.product_slug}`;

  // If locale is not enabled (pl, nl, fr), redirect to English version
  // Otherwise use the requested locale
  const targetLocale = locales.includes(locale as any) ? locale : 'en';
  const fullPath = buildLocalePath(productPath, targetLocale);

  // Perform redirect to the product page
  redirect(fullPath);
}
