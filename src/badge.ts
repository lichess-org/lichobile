import { registerPlugin } from '@capacitor/core'

export interface BadgePlugin {
  setNumber(options: { badge: number }): void
}

const Badge = registerPlugin<BadgePlugin>('Badge')

export default Badge
