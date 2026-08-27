import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Environment | Sound Service",
};

export default function EnvironmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
