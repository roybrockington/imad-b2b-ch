import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | Sound Service",
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
