import { back as brianBack } from '@freesewing/brian'
import { back } from './back.mjs'

import { hidePresets } from '@freesewing/core'

function draftYoke({ options, Point, Path, points, paths, Snippet, snippets, sa, macro, part }) {
  if (!options.yoke) {
    return part.hide()
  }
  points.armholesplit = paths.backArmhole.shiftFractionAlong(options.yokesplit, 1)

  points.centerbottom = new Point(0, points.armholesplit.y)

  delete paths.saBase
  delete paths.waist

  //Delete existing points lower than a given cutoff
  let cutoffy = points.frontArmholePitchCp1.y
  for (const i in points) {
    if (points[i].y > cutoffy) {
      delete points[i]
    }
  }

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

  if (sa) {
    paths.sa = new Path()
      .move(points.centerbottom)
      .line(points.armholesplit)
      .join(paths.saBase)
      .offset(sa)
      .attr('class', 'fabric sa')

    paths.sa.line(paths.sa.start())
  }

  macro('cutonfold', {
    from: points.cbNeck,
    to: points.centerbottom,
    grainline: true,
  })

  return part
}

export const yoke = {
  name: 'jett.yoke',
  from: brianBack,
  after: back,
  hide: hidePresets.HIDE_TREE,
  options: { yokesplit: { pct: 50, min: 5, max: 95, menu: 'style' } },
  draft: draftYoke,
}
