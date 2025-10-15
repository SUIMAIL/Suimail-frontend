import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToastContext } from '@/components/ui/toast'
import { useEffect, useState } from 'react'

export function FormSection() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState(
    Notification.permission
  )

  const { setNotification } = useToastContext()

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission)

      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true)
      }
    }
  }, [])

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setNotification({
        message: 'This browser does not support notifications',
        type: 'error',
      })
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    const permission = await Notification.requestPermission()
    setPermissionStatus(permission)

    if (permission === 'granted') {
      new Notification('Notifications Enabled!', {
        body: 'You will now receive notifications for new mails and updates.',
      })
      return true
    } else {
      setNotification({
        message: 'Notification permission was denied',
        type: 'error',
      })
      return false
    }
  }

  const handleSwitchChange = async (checked: boolean) => {
    if (checked) {
      const granted = await requestNotificationPermission()
      if (granted) {
        setNotificationsEnabled(true)
      } else {
        setNotificationsEnabled(false)
      }
    } else {
      setNotificationsEnabled(false)
    }
  }

  return (
    <form>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 max-w-md">
        {/* Receive Notifications Switch */}
        <div className="w-full rounded-lg border border-border surface-light elevation-2 p-5 sm:p-6 transition-all duration-200 hover:elevation-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <Label
                htmlFor="receive-notifications"
                className="text-base font-semibold text-foreground cursor-pointer"
              >
                Receive Notifications
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Receive notifications for new mails, replies and updates.
              </p>
            </div>
            <Switch
              id="receive-notifications"
              checked={notificationsEnabled}
              onCheckedChange={handleSwitchChange}
              disabled={
                !('Notification' in window) || permissionStatus === 'denied'
              }
              className="flex-shrink-0"
            />
          </div>

          {permissionStatus === 'denied' && (
            <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive">
                Notifications are blocked. Please enable them in your browser
                settings.
              </p>
            </div>
          )}

          {!('Notification' in window) && (
            <div className="mt-4 p-3 rounded-md bg-muted border border-border">
              <p className="text-xs text-muted-foreground">
                Your browser does not support notifications.
              </p>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
