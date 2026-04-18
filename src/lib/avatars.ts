import { createAvatar } from '@dicebear/core'
import { create as pixelArt } from '@dicebear/pixel-art'

export function buildAvatar(seed: string, backgroundColor: string) {
  const avatar = createAvatar(pixelArt as never, {
    seed,
    backgroundColor: [backgroundColor.replace('#', '')],
    backgroundType: ['solid'],
    scale: 120,
  } as never)

  return avatar.toDataUri()
}
