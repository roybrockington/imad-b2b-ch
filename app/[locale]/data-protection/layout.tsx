import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'dataProtection' });

  return {
    title: `${t('title')} | Sound Service`,
  };
}

export default function DataProtectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
