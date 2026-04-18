import { createAvatar } from '@dicebear/core'
import { openPeeps } from '@dicebear/collection'

export function buildAvatar(seed: string, backgroundColor: string) {
  return createAvatar(openPeeps, {
    seed,
    radius: 16,
    backgroundColor: [backgroundColor.replace('#', '')],
    backgroundType: ['solid'],
    scale: 105,
  }).toDataUri()
}
