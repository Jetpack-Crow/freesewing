import { back as brianBack } from '@freesewing/brian'
import { hidePresets } from '@freesewing/core'

function draftYoke({ options, Point, Path, points, paths, Snippet, snippets, sa, macro, part }) {
  points.centerbottom = new Point(0, points.frontArmholePitch.y)

  delete paths.saBase
  delete paths.waist

  paths.saBase = new Path()
    .move(points.centerbottom)

    .line(points.backArmholePitch)
    .join(paths.backArmhole)
    .line(points.s3CollarSplit)
    .join(paths.backCollar)
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
  hide: hidePresets.HIDE_TREE,
  options: {},
  draft: draftYoke,
}
