import { front as brianFront } from '@freesewing/brian'
import { hidePresets } from '@freesewing/core'

function draftfront({
  options,
  Point,
  Path,
  points,
  paths,
  Snippet,
  snippets,
  sa,
  macro,
  part,
  measurements,
}) {
  points.hem.x = (measurements.hips * (1 + options.hipsEase)) / 4
  return part
}

export const front = {
  name: 'genie.front',
  from: brianFront,
  measurements: ['hips'],
  hide: hidePresets.HIDE_TREE,
  options: { hipsEase: { pct: 10, min: -10, max: 50, menu: 'fit' } },
  draft: draftfront,
}
