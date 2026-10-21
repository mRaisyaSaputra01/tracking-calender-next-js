import NextAuth from "next-auth"
import githubAuth from "next-auth/providers/github"
import googleAuth from "next-auth/providers/google"
import { prisma } from "@/app/libs/prisma"

export const authOption = {
    providers: [
        githubAuth({
            clientId: process.env.GITHUB_CLIENT,
            clientSecret: process.env.GITHUB_SECRET
        }),
        googleAuth({
            clientId: process.env.GOOGLE_CLIENT,
            clientSecret: process.env.GOOGLE_SECRET
        })
    ],

    callbacks: {
        async signIn({ user }) {
            if (!user.email) {
                return false
            }

            await prisma.users.upsert({
                where: {
                    email: user.email
                },
                update: {},
                create: {
                    email: user.email
                }
            })
            return true
        },

        async jwt({ token, user }) {
            if (user?.email) {
                const dbUser = await prisma.users.findUnique({
                    where: { email: user.email },
                    select: { id: true }
                })

                if (dbUser) {
                    token.userId = dbUser.id
                }
            }
            return token
        },

        async session({ session, token }) {
            if (session.user && token.userId) {
                session.user.id = token.userId
            }
            return session
        }
    },
    secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOption)

export { handler as GET, handler as POST } 