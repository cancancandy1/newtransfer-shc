import NextAuthProvider from "@/components/NextAuthProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
