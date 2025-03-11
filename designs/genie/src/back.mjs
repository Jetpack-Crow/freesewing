import { back as brianBack } from '@freesewing/brian'
import { hidePresets } from '@freesewing/core'

function draftBack({
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

  points.armholesplit = paths.backArmhole.shiftFractionAlong(options.yokesplit, 1)
  points.centertop = new Point(0, points.armholesplit.y)

  delete paths.waist

  delete paths.saBase

  paths.saBase = new Path()
    .move(points.cbHem)
    .line(points.hem)
    .line(points.armhole)
    .curve(points.armholeCp2, points.armholeHollowCp1, points.armholeHollow)
    .curve(points.armholeHollowCp2, points.armholePitchCp1, points.armholePitch)
    .line(points.armholesplit)

    //.join(paths.backArmhole)
    .line(points.centertop)

    .hide()

  paths.seam = new Path()
    .move(points.centertop)
    .line(points.cbHips)
    .join(paths.saBase)
    .attr('class', 'fabric')
    .unhide()

  macro('cutonfold', {
    from: points.centertop,
    to: points.cbHem,
    grainline: true,
  })

  return part
}

export const back = {
  name: 'genie.back',
  from: brianBack,
  hide: hidePresets.HIDE_TREE,
  measurements: ['hips'],
  options: {
    hipsEase: { pct: 10, min: -15, max: 50, menu: 'fit' },
    yokesplit: { pct: 30, min: 5, max: 100, menu: 'style' },
  },
  draft: draftBack,
}
