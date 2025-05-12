import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongoPromise";
import InstagramProvider from "next-auth/providers/instagram";

const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorization: {
      params: {
        prompt: 'select_account'
      }
    }
  }),
];

if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
  providers.push(
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "user_profile,user_media,instagram_basic,pages_show_list,pages_read_engagement,pages_manage_metadata,instagram_manage_messages"
        }
      }
    })
  );
}

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn() {
      // Permitir login siempre, el registro es automático
      return true;
    },
  },
});

export { handler as GET, handler as POST }; 