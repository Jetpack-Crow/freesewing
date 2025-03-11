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

  points.centertop = new Point(0, points.frontArmholePitch.y)

  paths.saBase = new Path()
    .move(points.cbHem)
    .line(points.hem)
    .line(points.armhole)
    .curve(points.armholeCp2, points.armholeHollowCp1, points.armholeHollow)
    .curve(points.armholeHollowCp2, points.armholePitchCp1, points.armholePitch)

    .line(points.centertop)
    //.join(paths.backArmhole)
    .hide()
  paths.seam = new Path()
    .move(points.centertop)
    .line(points.cbHips)
    .join(paths.saBase)
    .attr('class', 'fabric')

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
  options: { hipsEase: { pct: 15, min: 0, max: 50, menu: 'fit' } },
  draft: draftBack,
}
