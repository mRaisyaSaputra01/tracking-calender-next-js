'use client'

import Image from "next/image"
import ThemeDark from "@/app/assets/dark.svg"
import ThemeLight from "@/app/assets/light.svg"
import { useTheme } from "@/app/context/theme-context"

const ThemeButton = () => {
    const { isDark, setIsDark } = useTheme()

    return (
        <button className="dark-light"
            onClick={() => setIsDark(!isDark)
            }>
            <Image src={isDark ? ThemeDark : ThemeLight} alt="Theme Icon" />
        </button>
    )
}


export default ThemeButton