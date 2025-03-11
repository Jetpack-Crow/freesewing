import { sleeve as briansleeve } from '@freesewing/brian'
import { hidePresets } from '@freesewing/core'

function draftsleeve({
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
  //points.hem.x = measurements.hips * (1+options.hipsEase ) / 4
  return part
}

export const sleeve = {
  name: 'genie.sleeve',
  from: briansleeve,
  hide: hidePresets.HIDE_TREE,
  options: {},
  draft: draftsleeve,
}
