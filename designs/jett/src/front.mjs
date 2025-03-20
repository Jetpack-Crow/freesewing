import { front as brianFront } from '@freesewing/brian'
import { hidePresets } from '@freesewing/core'

function draftfront({
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
  utils,
}) {
  store.set('Test', 'test')

  macro('rmCutOnFold', 'cutonfold')

  //Change default Brian to respect hip measurement and hip ease
  points.hem.x = (measurements.hips * (1 + options.hipsEase)) / 4

  // Shorten body to take ribbing into account
  if (options.ribbing) {
    let rh = options.ribbingHeight * (measurements.hpsToWaistBack + measurements.waistToHips)
    for (let p of ['hem', 'cfHem']) points[p] = points[p].shift(90, rh)
    store.set('ribbingHeight', rh)
  } else store.set('ribbingHeight', 0)

  points.cfNeck = points.cfNeck.shift(-90, measurements.neck * options.neckShiftForward)
  points.cfNeckCp1 = points.cfNeckCp1.shift(-90, measurements.neck * options.neckShiftForward)
  points.frontNeckCpEdge = points.frontNeckCpEdge.shift(
    -90,
    measurements.neck * options.neckShiftForward
  )
  points.neckCp2Front = points.neckCp2Front.shift(-90, measurements.neck * options.neckShiftForward)

  // Adapt the shoulder line according to the relevant options
  // Don't bother with less than 10% as that's just asking for trouble
  if (options.s3Collar < 0.1 && options.s3Collar > -0.1) {
    points.s3CollarSplit = points.hps
    paths.frontCollar = new Path()
      .move(points.hps)
      .curve(points.neckCp2Front, points.cfNeckCp1, points.cfNeck)
      .hide()
  } else if (options.s3Collar > 0) {
    // Shift shoulder seam forward on the collar side
    points.s3CollarSplit = utils.curveIntersectsY(
      points.hps,
      points.neckCp2Front,
      points.cfNeckCp1,
      points.cfNeck,
      store.get('s3CollarMaxFront') * options.s3Collar
    )
    paths.frontCollar = new Path()
      .move(points.hps)
      .curve(points.neckCp2Front, points.cfNeckCp1, points.cfNeck)
      .split(points.s3CollarSplit)[1]
      .hide()
  } else if (options.s3Collar < 0) {
    // Shift shoulder seam backward on the collar side
    points.s3CollarSplit = utils.curveIntersectsY(
      points.mirroredCbNeck,
      points.mirroredCbNeck,
      points.mirroredNeckCp2,
      points.hps,
      store.get('s3CollarMaxBack') * options.s3Collar
    )
    paths.frontCollar = new Path()
      .move(points.hps)
      .curve_(points.mirroredNeckCp2, points.mirroredCbNeck)
      .split(points.s3CollarSplit)[0]
      .reverse()
      .join(new Path().move(points.hps).curve(points.neckCp2Front, points.cfNeckCp1, points.cfNeck))
      .hide()
  }

  let placketwidth = measurements.chest * (1 + options.chestEase) * options.placketwidth

  //Create points for placket
  points.innerPlacketTop = points.cfNeck.shift(0, placketwidth / 2)
  points.innerPlacketBottom = points.cfHem.shift(0, placketwidth / 2)

  points.centerPlacketTop = points.cfNeck.shift(180, placketwidth / 2)
  points.centerPlacketBottom = points.cfHem.shift(180, placketwidth / 2)

  points.outerPlacketTop = points.cfNeck.shift(180, placketwidth * 1.5)
  points.outerPlacketBottom = points.cfHem.shift(180, placketwidth * 1.5)

  //Draw vertical guidelines for placket
  paths.innerPlacketLine = new Path()
    .move(points.innerPlacketTop)
    .line(points.innerPlacketBottom)
    .attr('class', 'sa')

  paths.centerPlacketLine = new Path()
    .move(points.centerPlacketTop)
    .line(points.centerPlacketBottom)
    .attr('class', 'sa')
    .setClass('lining')
  //.hide()
  paths.edgePlacketLine = new Path()
    .move(points.outerPlacketTop)
    .line(points.outerPlacketBottom)
    .attr('class', 'sa')

  paths.centerLine = new Path().move(points.cfNeck).line(points.cfHem).attr('class', 'sa').hide()

  //apply the full bust adjustment
  if (options.bustDart && options.draftForHighBust) {
    //Add a note to bustDart that it only works if draftForHighBust is selected
    points.bustpoint = new Point(measurements.bustSpan / 2, measurements.hpsToBust)

    snippets.bustpoint = new Snippet('notch', points.bustpoint)

    log.info('chest is ' + measurements.bust)
    log.info('high bust is ' + measurements.highBust)
    let bustDifferential = measurements.bust - measurements.highBust
    log.info('Bust differential is ' + bustDifferential)

    if (bustDifferential <= 0) {
      log.info('Bust error')
      store.flag.note({
        msg: 'jett:bustWarning',
      })
    }

    log.info('hps to waist front is ' + measurements.hpsToWaistFront)
    log.info('hps to waist back is ' + measurements.hpsToWaistBack)

    let waistDifferential = measurements.hpsToWaistFront - measurements.hpsToWaistBack

    if (waistDifferential <= 0) {
      log.info('Waist error')
      store.flag.info({
        msg: 'jett:waistWarning',
      })
    }

    if (bustDifferential > 0 && waistDifferential > 0) {
      //Shift outer points by bust differential / 2
      points.armhole = points.armhole.shift(0, bustDifferential / 2)
      points.hem = points.hem.shift(0, bustDifferential / 2)

      //shift lower points down by waist differential
      points.hem = points.hem.shift(-90, waistDifferential)
      points.outerPlacketBottom = points.outerPlacketBottom.shift(-90, waistDifferential)

      //Define the point on the side seam that the dart should be centered on
      paths.sideSeam = new Path().move(points.armhole).line(points.hem).hide()

      points.sideSeamIntercept = paths.sideSeam.shiftFractionAlong(options.bustDartHeight)

      let sideseamangle = points.hem.angle(points.armhole)
      points.dartTopEdge = points.sideSeamIntercept.shift(sideseamangle, waistDifferential / 2)
      points.dartBottomEdge = points.sideSeamIntercept.shift(
        sideseamangle - 180,
        waistDifferential / 2
      )

      points.dartPoint = points.bustpoint.shiftFractionTowards(
        points.sideSeamIntercept,
        options.bustDartOffset
      )

      points.armhole = points.armhole.shift(180, bustDifferential / 2)

      paths.bustDart = new Path()
        .move(points.dartTopEdge)
        .line(points.dartPoint)
        .line(points.dartBottomEdge)

      paths.sideSeam = new Path()
        .move(points.hem)
        .line(points.dartBottomEdge)
        .line(points.dartTopEdge)
        .line(points.armhole)
        .hide()
    } else {
      paths.sideSeam = new Path().move(points.hem).line(points.armhole)
    }
  } else {
    paths.sideSeam = new Path().move(points.hem).line(points.armhole).hide()
  }

  //Redefine base seam and seam allowance to respect placket
  paths.saBase = new Path()
    .move(points.outerPlacketBottom)
    .line(points.hem)
    .join(paths.sideSeam)
    .curve(points.armholeCp2, points.armholeHollowCp1, points.armholeHollow)
    .curve(points.armholeHollowCp2, points.armholePitchCp1, points.armholePitch)
    .join(paths.frontArmhole)
    .line(points.s3CollarSplit)
    .join(paths.frontCollar)
    .line(points.outerPlacketTop)
    .line(points.outerPlacketBottom)
    .close()

  //Seam allowance
  if (sa) {
    paths.sa = paths.saBase.offset(sa).attr('class', 'fabric sa')
    paths.sa.line(paths.sa.start())
  }

  paths.seam = paths.saBase

  //Draw the pocket

  if (options.frontWeltPockets) {
    points.pocketBottom = points.cfHem.shiftFractionTowards(points.hem, options.pocketBottomX)
    points.pocketBottom.y = points.pocketBottom.shiftFractionTowards(
      points.hps,
      options.pocketBottomY
    ).y

    points.pocketTop = points.cfHem.shiftFractionTowards(points.hem, options.pocketTopX)
    points.pocketTop.y = points.pocketTop.shiftFractionTowards(points.hps, options.pocketTopY).y

    let pocketslope =
      -(points.pocketBottom.y - points.pocketTop.y) / (points.pocketBottom.x - points.pocketTop.x)
    let pocketangle = (Math.atan(pocketslope) * 180) / 3.14159

    paths.pocketLine = new Path().move(points.pocketTop).line(points.pocketBottom)
    //.hide()

    let pocketWeltOffset = (options.pocketWeltWidth * measurements.hips) / 10

    store.set('pocketLength', paths.pocketLine.length())

    log.info('Pocket length is ' + paths.pocketLine.length())

    store.set('pocketWidth', pocketWeltOffset * 2)

    points.pocketTopInner = points.pocketTop.shift(pocketangle - 90, pocketWeltOffset)
    points.pocketTopOuter = points.pocketTop.shift(pocketangle + 90, pocketWeltOffset)

    points.pocketBottomInner = points.pocketBottom.shift(pocketangle - 90, pocketWeltOffset)
    points.pocketBottomOuter = points.pocketBottom.shift(pocketangle + 90, pocketWeltOffset)

    paths.pocketOutline = new Path()
      .move(points.pocketTopInner)
      .line(points.pocketTopOuter)
      .line(points.pocketBottomOuter)
      .line(points.pocketBottomInner)
      .close()
      .attr('class', 'sa')

    log.info('Pocket angle is ' + pocketangle)
  }

  macro('rmtitle')
  store.cutlist.addCut({ cut: false })
  store.cutlist.addCut({ cut: 2, from: 'fabric', identical: false })
  store.cutlist.addCut({ cut: 2, from: 'lining', identical: false })

  points.title = points.outerPlacketTop.shiftFractionTowards(points.hem, 0.5)
  macro('title', { at: points.title, nr: 1, title: 'front' })

  //Remove unneeded paperless macros
  macro('rmVd', 'hTotal')
  macro('rmVd', 'hHemToArmholePitch')
  macro('rmVd', 'hHemToShoulder')
  macro('rmVd', 'hHemToArmhole')
  macro('rmVd', 'hHemToWaist')
  macro('rmVd', 'hHemToNeckOpeningBottom')

  //make new macros
  macro('hd', {
    id: 'wHem',
    from: points.cfHem,
    to: points.hem,
    y: points.cfHem.y + sa + 15,
  })
  macro('hd', {
    id: 'wChest',
    from: points.cfHem,
    to: points.armhole,
    y: points.armhole.y,
  })
  macro('hd', {
    id: 'wArmhole',
    from: points.cfHem,
    to: points.frontArmholePitch,
    y: points.frontArmholePitch.y,
  })
  macro('hd', {
    id: 'wPlacket',
    from: points.outerPlacketTop,
    to: points.cfNeck,
    y: points.cfNeck.y - sa - 15,
  })
  macro('vd', {
    id: 'hNeck',
    from: points.cfNeck,
    to: points.s3CollarSplit,
    x: points.cfNeck.x,
  })
  macro('vd', {
    id: 'hTotal',
    from: points.cfHem,
    to: points.s3CollarSplit,
    x: points.armhole.x + sa + 30,
  })
  macro('vd', {
    id: 'hHemToWaist',
    from: points.cfHem,
    to: points.cfWaist,
    x: points.armhole.x + sa + 15,
  })
  macro('vd', {
    id: 'hWaistToChest',
    from: points.cfWaist,
    to: points.armhole,
    x: points.armhole.x + sa + 15,
  })
  macro('vd', {
    id: 'hChestToArmHollow',
    from: points.armhole,
    to: points.backArmholePitch,
    x: points.armhole.x + sa + 15,
  })
  macro('vd', {
    id: 'hArmHollowToShoulder',
    from: points.backArmholePitch,
    to: points.s3ArmholeSplit,
    x: points.armhole.x + sa + 15,
  })
  macro('vd', {
    id: 'hShoulderSlope',
    from: points.s3ArmholeSplit,
    to: points.s3CollarSplit,
    x: points.armhole.x + sa + 15,
  })

  return part
}

export const front = {
  name: 'jett.front',
  from: brianFront,
  measurements: [
    'chest',
    'highBust',
    'hips',
    'waistToHips',
    'hpsToWaistBack',
    'hpsToWaistFront',
    'bustSpan',
    'hpsToBust',
  ],
  hide: hidePresets.HIDE_TREE,
  options: {
    hipsEase: { pct: 5, min: -10, max: 50, menu: 'fit' },
    chestEase: { pct: 10, min: -10, max: 50, menu: 'fit' },
    collarEase: { pct: 2, min: -10, max: 50, menu: 'fit' },
    placketwidth: { pct: 3, min: 0, max: 10, menu: 'style' },
    neckShiftForward: { pct: 8.8, min: 0, max: 40, menu: 'style' },
    ribbing: { bool: true, menu: 'construction' },
    bustDart: { bool: false, menu: 'fit.bust' },
    bustDartOffset: { pct: 25, min: 5, max: 90, menu: 'fit.bust' },
    bustDartHeight: { pct: 20, min: 5, max: 95, menu: 'fit.bust' },
    ribbingHeight: { pct: 10, min: 5, max: 15, menu: 'style' },

    frontWeltPockets: { bool: true, menu: 'style.pocket' },

    pocketBottomX: { pct: 70, min: 40, max: 95, menu: 'style.pocket' },
    pocketTopX: { pct: 60, min: 40, max: 95, menu: 'style.pocket' },
    pocketBottomY: { pct: 7, min: 0, max: 50, menu: 'style.pocket' },
    pocketTopY: { pct: 30, min: 0, max: 50, menu: 'style.pocket' },

    pocketWeltWidth: { pct: 7, min: 0, max: 20, menu: 'style.pocket' },
  },
  draft: draftfront,
}
