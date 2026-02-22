import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    pages: {
        signIn: "/",
        error: "/",
    },
    callbacks: {
        async signIn({ user }) {
            if (!user.email) return false;
            try {
                const apiUrl = process.env.INTERNAL_API_URL || "http://lundedev-core:8080";
                const res = await fetch(`${apiUrl}/api/public/auth/verify?email=${encodeURIComponent(user.email)}`, {
                    cache: 'no-store'
                });
                if (res.ok) {
                    return true;
                }
                console.warn(`User ${user.email} denied access because they are not in the database.`);
                return false;
            } catch (error) {
                console.error("Auth verification failed:", error);
                return false;
            }
        },
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token
                token.idToken = account.id_token
            }
            return token
        },
        async session({ session, token }) {
            // @ts-expect-error - extending session type
            session.accessToken = token.accessToken
            // @ts-expect-error - extending session type
            session.idToken = token.idToken
            return session
        },
    },
})
