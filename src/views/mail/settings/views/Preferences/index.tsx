import { useEffect, useState } from 'react'
import { SubviewHeader } from '../../components/subview-header'
import { Moon, Sun, Monitor } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

export function PreferencesView() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('suimail-theme')
    return (stored as Theme) || 'system'
  })

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (selectedTheme: Theme) => {
      root.classList.remove('light', 'dark')

      if (selectedTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
          .matches
          ? 'dark'
          : 'light'
        root.classList.add(systemTheme)
      } else {
        root.classList.add(selectedTheme)
      }
    }

    applyTheme(theme)
    localStorage.setItem('suimail-theme', theme)

    // Listen for system theme changes if system is selected
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme('system')
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className="h-full overflow-y-auto smooth-scroll">
      <SubviewHeader
        title="Preferences"
        description="Customize your Suimail experience"
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Theme Section */}
        <section className="surface-light elevation-1 rounded-xl p-5 sm:p-6 transition-all duration-200 hover:elevation-2">
          <div className="mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
              Appearance
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose how Suimail looks to you
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {themeOptions.map(option => {
              const Icon = option.icon
              const isSelected = theme === option.value

              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`
                    touch-target p-4 sm:p-5 rounded-lg border-2 transition-all duration-200
                    flex flex-col items-center gap-3
                    ${
                      isSelected
                        ? 'border-blue-base bg-blue-base/10 shadow-hover'
                        : 'border-border surface-base hover:border-blue-base/50 hover:elevation-1'
                    }
                  `}
                >
                  <Icon
                    className={`w-6 h-6 sm:w-7 sm:h-7 ${
                      isSelected ? 'text-blue-base' : 'text-muted-foreground'
                    }`}
                  />
                  <span
                    className={`text-sm sm:text-base font-medium ${
                      isSelected ? 'text-blue-base' : 'text-foreground'
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Display Section */}
        <section className="surface-light elevation-1 rounded-xl p-5 sm:p-6 transition-all duration-200 hover:elevation-2">
          <div className="mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
              Display
            </h2>
            <p className="text-sm text-muted-foreground">
              Adjust how content is displayed
            </p>
          </div>

          <div className="space-y-4">
            <PreferenceRow
              label="Compact view"
              description="Show more emails per screen"
              badge="Coming soon"
            />
            <PreferenceRow
              label="Show avatars"
              description="Display sender avatars in email list"
              badge="Coming soon"
            />
          </div>
        </section>

        {/* Language Section */}
        <section className="surface-light elevation-1 rounded-xl p-5 sm:p-6 transition-all duration-200 hover:elevation-2">
          <div className="mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
              Language & Region
            </h2>
            <p className="text-sm text-muted-foreground">
              Customize language preferences
            </p>
          </div>

          <div className="space-y-4">
            <PreferenceRow
              label="Language"
              description="English (US)"
              badge="Coming soon"
            />
            <PreferenceRow
              label="Date format"
              description="MM/DD/YYYY"
              badge="Coming soon"
            />
          </div>
        </section>

        {/* Notifications Section */}
        <section className="surface-light elevation-1 rounded-xl p-5 sm:p-6 transition-all duration-200 hover:elevation-2">
          <div className="mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1">
              Notifications
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage your notification preferences
            </p>
          </div>

          <div className="space-y-4">
            <PreferenceRow
              label="Email notifications"
              description="Receive notifications for new emails"
              badge="Coming soon"
            />
            <PreferenceRow
              label="Desktop notifications"
              description="Show notifications on your desktop"
              badge="Coming soon"
            />
          </div>
        </section>
      </div>
    </div>
  )
}

// Helper component for preference rows
const PreferenceRow = ({
  label,
  description,
  badge,
}: {
  label: string
  description: string
  badge?: string
}) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div className="flex-1">
        <p className="text-sm sm:text-base font-medium text-foreground">
          {label}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          {description}
        </p>
      </div>
      {badge && (
        <span className="ml-4 px-3 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
          {badge}
        </span>
      )}
    </div>
  )
}
