import { draftRibbing } from './shared.mjs'

//This code is taken from Huey with only the change for the ribbing ends, but it'll be using slightly
// different math after i add the full belly adjustment

function draftJettWaistband({ points, measurements, options, macro, store, part }) {
  if (!options.ribbing) return part.hide()

  let width =
    measurements.hips *
    (1 + options.hipsEase) *
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
  options: {
    ribbingStretch: { pct: 15, min: 0, max: 30, menu: 'fit' },
    ribbingEndsPercentage: { pct: 5, min: 0, max: 20, menu: 'construction' },
  },
  draft: draftJettWaistband,
}
