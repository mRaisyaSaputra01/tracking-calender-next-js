'use client'

import Link from "next/link"
import { useSession } from "next-auth/react"

const LoginButton = () => {
    const { data: session } = useSession()

    const user = session?.user

    const actionLabel = user ? "Sign out" : "Sign in"
    const actionUrl = user
        ? "/api/auth/signout"
        : "/api/auth/signin"

    return (
        <button
            className={
                user
                    ? "profile-link login"
                    : "profile-link logout"
            }
        >
            <Link href={actionUrl}>
                {actionLabel}
            </Link>
        </button>
    )
}

export default LoginButton