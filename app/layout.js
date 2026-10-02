import './global.css'
import ProfileButton from "@/app/component/profile-button"
import ThemeButton from "@/app/component/theme-button"
import { ThemeProvider } from "@/app/context/theme-context"


export default function DashboardLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <div className="app">

            <div className="header">

              <h2>Tracking Calendar</h2>
              <div className="navbar-btn">
                <ThemeButton />
              </div>
              <ProfileButton />

            </div>
            {children}
          </div>
          {/* Layout UI */}
          {/* Place children where you want to render a page or nested layout */}
        </ThemeProvider>
      </body>
    </html>
  )
}