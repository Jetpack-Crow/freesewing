import { draftRibbing } from './shared.mjs'

//This code is taken from Huey with only the change for the ribbing ends, but it'll be using slightly
// different math after i add the full belly adjustment

function draftJettCuff({ points, measurements, options, macro, store, part }) {
  if (!options.ribbing) return part.hide()

  let width = measurements.wrist * (1 + options.cuffEase) * (1 - options.ribbingStretch)
  draftRibbing(part, width)

  /*
   * Annotations
   */
  // Cutlist
  store.cutlist.setCut({ cut: 2, from: 'ribbing', identical: true })

  // Title
  macro('rmTitle', 'title_notes')

  macro('title', {
    at: points.title,
    nr: 6,
    title: 'cuff',
  })

  return part
}

export const cuff = {
  name: 'Jett.cuff',
  options: {
    ribbingStretch: { pct: 15, min: 0, max: 30, menu: 'construction' },
  },
  draft: draftJettCuff,
}
