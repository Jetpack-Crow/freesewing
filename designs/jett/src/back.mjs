import { back as brianBack } from '@freesewing/brian'
import { front } from './front.mjs'
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
  store,
  log,
}) {
  log.info('text: ' + store.get('Test'))

  // Shorten body to take ribbing into account
  if (options.ribbing) {
    //Just redefining ribbing height again until I figure out how to make it work with the store
    //let rh = options.ribbingHeight * (measurements.hpsToWaistBack + measurements.waistToHips)
    let rh = store.get('ribbingHeight')

    for (let p of ['cbHips', 'hem', 'cbHem']) points[p] = points[p].shift(90, rh)
  }

  points.hem.x = (measurements.hips * (1 + options.hipsEase)) / 4

  //If using the yoke option, have to redraw a significant chunk of the path

  if (options.yoke) {
    points.armholesplit = paths.backArmhole.shiftFractionAlong(options.yokesplit, 1)
    points.centertop = new Point(0, points.armholesplit.y)

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

    if (sa) {
      paths.sa = paths.saBase.offset(sa).attr('class', 'fabric sa').move(points.cbHips)
      paths.sa.line(paths.sa.start())
    }

    macro('cutonfold', {
      from: points.centertop,
      to: points.cbHem,
      grainline: true,
    })

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

    //Make new paperless macros
    macro('hd', {
      id: 'wHem',
      from: points.cbHem,
      to: points.hem,
      y: points.hem.y + sa + 15,
    })
    macro('hd', {
      id: 'wTop',
      from: points.centertop,
      to: points.armholesplit,
      y: points.centertop.y - sa - 15,
    })
    macro('hd', {
      id: 'wChest',
      from: points.centertop,
      to: points.armhole,
      y: points.armhole.y,
    })
    macro('hd', {
      id: 'armholeHoriz',
      from: points.armholesplit,
      to: points.armhole,
      y: points.centertop.y,
    })

    macro('vd', {
      id: 'hHemToWaist',
      from: points.cbHem,
      to: points.cbWaist,
      x: points.cbHips.x - 15,
    })
    macro('vd', {
      id: 'hWaistToChest',
      from: points.cbWaist,
      to: points.cbArmhole,
      x: points.cbHips.x - 15,
    })
    macro('vd', {
      id: 'hChestToTop',
      from: points.cbArmhole,
      to: points.centertop,
      x: points.cbHips.x - 15,
    })
    macro('vd', {
      id: 'hTotal',
      from: points.cbHem,
      to: points.centertop,
      x: points.cbHips.x - 30,
    })
  } else {
    macro('vd', {
      id: 'hTotal',
      from: points.s3CollarSplit,
      to: points.hem,
      x: points.cbHem.x - 30,
    })
    macro('vd', {
      id: 'hHemToNeckOpeningBottom',
      from: points.cbNeck,
      to: points.hem,
      x: points.cbHem.x - 15,
    })
    macro('vd', {
      id: 'hHemToWaist',
      from: points.cbHem,
      to: points.cbWaist,
      x: points.cbHem.x + 30,
    })
    macro('vd', {
      id: 'hHemToArmhole',
      from: points.hem,
      to: points.armhole,
      x: points.armhole.x + 15,
    })
    macro('vd', {
      id: 'hHemToArmholePitch',
      from: points.hem,
      to: points.armholePitch,
      x: points.armhole.x + 30,
    })
    macro('vd', {
      id: 'hHemToShoulder',
      from: points.hem,
      to: points.s3ArmholeSplit,
      x: points.armhole.x + 45,
    })
    macro('hd', {
      id: 'wHem',
      from: points.cbHem,
      to: points.hem,
      y: points.hem.y + sa + 15,
    })
    macro('hd', {
      id: 'wArmhole',
      from: points.cbHem,
      to: points.armhole,
      y: points.armhole.y,
    })
    macro('hd', {
      id: 'wArmholeHollow',
      from: points.cbHem,
      to: points.backArmholePitch,
      y: points.backArmholePitch.y,
    })

    //just copying the same code from brian. i'm not sure why just returning it
    //without the other changes doesn't work
    paths.saBase = new Path()
      .move(points.cbHem)
      .line(points.hem)
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholeHollowCp1, points.armholeHollow)
      .curve(points.armholeHollowCp2, points.armholePitchCp1, points.armholePitch)
      .join(paths.backArmhole)
      .line(points.s3CollarSplit)
      .join(paths.backCollar)
      .hide()
    paths.seam = new Path()
      .move(points.cbNeck)
      .line(points.cbHips)
      .join(paths.saBase)
      .attr('class', 'fabric')
  }

  macro('rmtitle')
  store.cutlist.addCut({ cut: false })
  store.cutlist.addCut({ cut: false, from: 'lining' })
  store.cutlist.addCut({ cut: 1, from: 'fabric', onFold: true })
  store.cutlist.addCut({ cut: 1, from: 'lining', onFold: true })

  //points.title = points.outerPlacketTop.shiftFractionTowards(points.hem, 0.5)
  macro('title', { at: points.title, nr: 2, title: 'back' })

  return part
}

export const back = {
  name: 'jett.back',
  from: brianBack,
  after: front,

  hide: hidePresets.HIDE_TREE,
  measurements: ['hips'],
  options: {
    chestEase: { pct: 10, min: -15, max: 50, menu: 'fit' },
    hipsEase: { pct: 10, min: -15, max: 50, menu: 'fit' },
    yoke: { bool: true, menu: 'construction' },
    yokesplit: { pct: 30, min: 5, max: 100, menu: 'style' },
  },
  draft: draftBack,
}
