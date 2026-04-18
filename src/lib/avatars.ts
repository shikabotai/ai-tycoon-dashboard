import { createAvatar } from '@dicebear/core'
import { adventurerNeutral } from '@dicebear/collection'

export function buildAvatar(seed: string, backgroundColor: string) {
  return createAvatar(adventurerNeutral, {
    seed,
    radius: 16,
    backgroundColor: [backgroundColor.replace('#', '')],
    backgroundType: ['solid'],
    scale: 90,
  }).toDataUri()
}
