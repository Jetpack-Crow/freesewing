import { yoke as simonYoke } from '@freesewing/simon'
import { hidePresets } from '@freesewing/core'

function draftYoke({ options, Point, Path, points, paths, Snippet, snippets, sa, macro, part }) {
  for (const i in paths) delete paths[i]

  return part
}

export const yoke = {
  name: 'genie.yoke',
  from: simonYoke,
  hide: hidePresets.HIDE_TREE,
  options: {},
  draft: draftYoke,
}
