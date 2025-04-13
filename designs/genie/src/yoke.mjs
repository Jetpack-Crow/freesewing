import { back as brianBack } from '@freesewing/brian'
import { back } from './back.mjs'

import { hidePresets } from '@freesewing/core'

function draftYoke({
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
  store,
}) {
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

  store.cutlist.addCut({ cut: false })
  macro('cutonfold', {
    from: points.cbNeck,
    to: points.centerbottom,
    grainline: true,
  })

  store.cutlist.addCut({ cut: 1, from: 'fabric', onFold: true })

  //Remove unneeded paperless macros
  macro('rmHd', 'lShoulder')
  macro('rmHd', 'wCFrontToHps')
  macro('rmLd', 'lShoulder')
  macro('rmVd', 'hTotal')
  macro('rmVd', 'hHemToNeckOpeningBottom')
  macro('rmVd', 'hHemToShoulder')
  macro('rmVd', 'hHemToArmholePitch')
  macro('rmVd', 'hHemToArmhole')
  macro('rmHd', 'wHem')
  macro('rmVd', 'hHemToWaist')
  macro('rmPd', 'lShoulderToArmholePitch')
  macro('rmPd', 'lArmhole')

  //Make new macros

  macro('hd', {
    id: 'wHem',
    from: points.centerbottom,
    to: points.armholesplit,
    y: points.centerbottom.y + sa + 15,
  })
  macro('hd', {
    id: 'wTop',
    from: points.centerbottom,
    to: points.s3ArmholeSplit,
    y: points.s3CollarSplit.y - sa - 30,
  })
  macro('hd', {
    id: 'wCollar',
    from: points.centerbottom,
    to: points.s3CollarSplit,
    y: points.s3CollarSplit.y - sa - 15,
  })
  macro('hd', {
    id: 'wShoulder',
    from: points.s3CollarSplit,
    to: points.s3ArmholeSplit,
    y: points.s3CollarSplit.y - sa - 15,
  })

  macro('vd', {
    id: 'hInner',
    from: points.centerbottom,
    to: points.cbShoulder,
    x: points.centerbottom.x - sa - 15,
  })
  macro('vd', {
    id: 'hCollar',
    from: points.cbShoulder,
    to: points.cbHps,
    x: points.centerbottom.x - sa - 15,
  })
  macro('vd', {
    id: 'hTotal',
    from: points.centerbottom,
    to: points.cbHps,
    x: points.centerbottom.x - sa - 30,
  })

  points.title = points.cbShoulder.shiftFractionTowards(points.armholesplit, 0.5)
  macro('title', { at: points.title, nr: 4, title: 'yoke' })

  return part
}

export const yoke = {
  name: 'jett.yoke',
  from: brianBack,
  after: back,
  hide: hidePresets.HIDE_TREE,
  options: {},
  draft: draftYoke,
}
