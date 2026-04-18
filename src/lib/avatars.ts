import { createAvatar } from '@dicebear/core'
import * as pixelArtModule from '@dicebear/pixel-art'

const pixelArtStyle = {
  meta: pixelArtModule.meta,
  schema: pixelArtModule.schema,
  create: pixelArtModule.create,
}

export function buildAvatar(seed: string) {
  return createAvatar(pixelArtStyle, {
    seed,
    scale: 120,
    backgroundType: ['solid'],
    radius: 6,
  }).toDataUri()
}
