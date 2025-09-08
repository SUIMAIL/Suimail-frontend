import type { IUser } from '@/types/generic'
import mixpanel from 'mixpanel-browser'

mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN!, {
  track_pageview: 'url-with-path-and-query-string',
  persistence: 'localStorage',
  record_sessions_percent: 80,
  record_mask_text_selector: '.password',
})

export const trackPageView = (path: string) => {
  mixpanel.track_pageview({
    page: path,
  })
}

export const identifyUser = (user: IUser) => {
  mixpanel.identify(user.suimailNs)
  mixpanel.people.set({
    $address: user.address,
    $email: user.suimailNs,
    $mailFee: user.mailFee || 0,
  })
}

export default mixpanel
