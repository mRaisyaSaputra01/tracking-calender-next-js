'use client'

import Link from "next/link"
import { useSession } from "next-auth/react"

const LoginButton = () => {
    const { data: session } = useSession()
    console.log(session)

    const user = session?.user
    console.log(user)

    const actionLabel = user ? "Sign out" : "Sign in"
    const actionUrl = user ? "/api/auth/signout" : "/api/auth/signin"

    return (
        <button className={ user? "profile-link signout" : "profile-link signin" }>
            <Link href={actionUrl}>
                {actionLabel}
            </Link>
        </button>
    )
}

export default LoginButton