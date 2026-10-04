import './global.css'

import Link from "next/link"
import ProfileButton from "@/app/component/profile-button"
import ThemeButton from "@/app/component/theme-button"
import { ThemeProvider } from "@/app/context/theme-context"
import SessionProviderWrapper from "@/app/component/session-provider"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { authUserSession } from "@/app/libs/auth-libs"


export default async function DashboardLayout({ children }) {
  const user = await authUserSession()

  return (
    <html lang="en">
      <body>
        <ThemeProvider>

          <SessionProviderWrapper>
          <div className="app">

            <div className="header">

              <h2>Tracking Calendar</h2>
              <div className="navbar-btn">
                <ThemeButton />
              </div>
              <ProfileButton user={user}/>

            </div>
            {children}
          </div>
          {/* Layout UI */}
          {/* Place children where you want to render a page or nested layout */}
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
      <SpeedInsights />
    </html>
  )
}