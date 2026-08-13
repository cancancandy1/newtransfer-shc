// Layout สำหรับ /login — wrap ด้วย NextAuthProvider
// เพื่อให้ signIn() รู้ basePath ที่ถูกต้อง (/new-transfer/api/auth)
import NextAuthProvider from "@/components/NextAuthProvider";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
