import { front } from './front.mjs'
import { cuff } from './cuff.mjs'

import { draftRibbing } from './shared.mjs'

//This code is taken from Huey with only the change for the ribbing ends, but it'll be using slightly
// different math after i add the full belly adjustment

function draftJettWaistband({ points, measurements, options, macro, store, part }) {
  if (!options.ribbing) return part.hide()

  let width =
    (((1 + options.hipsEase) * measurements.hips) / 2 + store.get('frontWaistLength') * 2) *
    (1 - options.ribbingStretch) *
    (1 - options.ribbingEndsPercentage)

  draftRibbing(part, width)

  /*
   * Annotations
   */
  // Cutlist
  store.cutlist.setCut({ cut: 1, from: 'ribbing' })

  // Title
  macro('title', {
    at: points.title,
    nr: 7,
    title: 'waistband',
  })

  return part
}

export const waistband = {
  name: 'Jett.waistband',
  after: front,
  cuff,
  options: {
    ribbingEndsPercentage: { pct: 5, min: 0, max: 20, menu: 'construction' },
  },
  draft: draftJettWaistband,
}
