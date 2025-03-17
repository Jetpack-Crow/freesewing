import { back, back as brianBack } from '@freesewing/brian'
import { hidePresets } from '@freesewing/core'

function draftYoke({ options, Point, Path, points, paths, Snippet, snippets, sa, macro, part }) {
  if (!options.yoke) {
    return part.hide()
  }
  points.armholesplit = paths.backArmhole.shiftFractionAlong(options.yokesplit, 1)

  points.centerbottom = new Point(0, points.armholesplit.y)

  delete paths.saBase
  delete paths.waist

  paths.saBase = new Path()
    .move(points.centerbottom)

    .line(points.armholesplit)
    .join(paths.backArmhole)
    .line(points.s3CollarSplit)
    .join(paths.backCollar)
    .trim()
    .hide()

  paths.seam = new Path()
    .move(points.cbNeck)
    .line(points.centerbottom)
    .join(paths.saBase)
    .attr('class', 'fabric')

  macro('cutonfold', {
    from: points.cbNeck,
    to: points.centerbottom,
    grainline: true,
  })

  return part
}

export const yoke = {
  name: 'genie.yoke',
  from: brianBack,
  after: back,
  hide: hidePresets.HIDE_TREE,
  options: { yokesplit: { pct: 50, min: 5, max: 95, menu: 'style' } },
  draft: draftYoke,
}
