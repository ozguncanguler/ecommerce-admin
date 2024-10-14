import NextAuth, { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
  ],
  adapter: MongoDBAdapter(client),
  callbacks: {
    // signIn callback ile kullanıcı erişimini kontrol ediyoruz
    async signIn({ user }) {
      const userEmail = user.email || "";
      if (adminEmails.includes(userEmail)) {
        return true; // Admin girişine izin ver
      } else {
        return false; // Admin olmayan kullanıcıları reddet
      }
    },
    // session callback'inde oturum yapısını değiştirmeden geri döndürüyoruz
    async session({ session }) {
      return session; // Oturumda değişiklik yapmadan geri döndür
    },
  },
  pages: {
    error: "/unauthorized", // Yetkisiz kullanıcılar bu sayfaya yönlendirilir
  },
};

export default NextAuth(authOptions);

// Admin isteklerini kontrol eden fonksiyon
export async function isAdminRequest(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !adminEmails.includes(session?.user?.email || "")) {
    res.status(401).end(); // Yetkisiz erişim
    throw new Error("not an admin");
  }
}
