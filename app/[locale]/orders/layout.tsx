import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'orders' });

  return {
    title: `${t('pageTitle')} | Sound Service`,
  };
}

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
