import { back as brianBack } from '@freesewing/brian'
import { hidePresets } from '@freesewing/core'

function draftBack({ options, Point, Path, points, paths, Snippet, snippets, sa, macro, part }) {
  return part
}

export const back = {
  name: 'genie.back',
  from: brianBack,
  hide: hidePresets.HIDE_TREE,
  options: {},
  draft: draftBack,
}
