import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://sound-service.eu';

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  code: string;
  name: string;
  brand?: { name: string; slug: string };
  updated_at: string;
}

interface Article {
  slug: string;
  updated_at: string;
}

async function fetchBrands(): Promise<Brand[]> {
  try {
    const response = await fetch(`${API_URL}/brands`, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error('Failed to fetch brands for sitemap:', error);
    return [];
  }
}

async function fetchProducts(): Promise<Product[]> {
  try {
    // Fetch first page to get total
    const response = await fetch(`${API_URL}/products?per_page=100`, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const data = await response.json();

    // For now, just return first page of products
    // In production, you might want to fetch all pages or limit to featured products
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error);
    return [];
  }
}

async function fetchArticles(): Promise<Article[]> {
  try {
    const response = await fetch(`${API_URL}/articles?per_page=100`, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch articles for sitemap:', error);
    return [];
  }
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = ['en', 'de', 'fr', 'it'];
  const defaultLocale = 'de';

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/shipping',
    '/returns',
    '/terms',
    '/imprint',
    '/data-protection',
    '/environment',
    '/jobs',
    '/sales-areas',
    '/brands',
  ];

  // Fetch dynamic data
  const [brands, products, articles] = await Promise.all([
    fetchBrands(),
    fetchProducts(),
    fetchArticles(),
  ]);

  const sitemap: MetadataRoute.Sitemap = [];

  // Add static pages for all locales
  for (const page of staticPages) {
    for (const locale of locales) {
      const url = locale === defaultLocale
        ? `${BASE_URL}${page}`
        : `${BASE_URL}/${locale}${page}`;

      sitemap.push({
        url,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  // Add brand pages for all locales
  for (const brand of brands) {
    const brandSlug = brand.slug;
    for (const locale of locales) {
      const url = locale === defaultLocale
        ? `${BASE_URL}/brands/${brandSlug}`
        : `${BASE_URL}/${locale}/brands/${brandSlug}`;

      sitemap.push({
        url,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      });
    }
  }

  // Add product pages for all locales
  for (const product of products) {
    if (product.brand?.slug) {
      const brandSlug = product.brand.slug;
      const productSlug = slugify(product.name);

      for (const locale of locales) {
        const url = locale === defaultLocale
          ? `${BASE_URL}/${brandSlug}/${productSlug}`
          : `${BASE_URL}/${locale}/${brandSlug}/${productSlug}`;

        sitemap.push({
          url,
          lastModified: new Date(product.updated_at),
          changeFrequency: 'daily',
          priority: 0.6,
        });
      }
    }
  }

  // Add article pages for all locales
  for (const article of articles) {
    for (const locale of locales) {
      const url = locale === defaultLocale
        ? `${BASE_URL}/_news/${article.slug}`
        : `${BASE_URL}/${locale}/_news/${article.slug}`;

      sitemap.push({
        url,
        lastModified: new Date(article.updated_at),
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  }

  return sitemap;
}
