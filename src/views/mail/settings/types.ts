export type SettingsViewType =
  | 'mailaddress'
  | 'notifications'
  | 'account'
  | 'preferences'

export interface SettingsTab {
  label: string
  view: SettingsViewType
}
