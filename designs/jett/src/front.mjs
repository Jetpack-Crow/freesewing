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
    const rh = options.ribbingHeight * (measurements.hpsToWaistBack + measurements.waistToHips)
    for (let p of ['hem', 'cfHem']) points[p] = points[p].shift(90, rh)
    store.set('ribbingHeight', rh)
  } else store.set('ribbingHeight', 0)

  //Shift the neck forward slightly from Brian default
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
  store.set('placketWidth', placketwidth)

  //Create points for placket
  points.innerPlacketTop = points.cfNeck.shift(0, placketwidth / 2)
  points.innerPlacketBottom = points.cfHem.shift(0, placketwidth / 2)

  points.centerPlacketTop = points.cfNeck.shift(180, placketwidth / 2)
  points.centerPlacketBottom = points.cfHem.shift(180, placketwidth / 2)

  points.outerPlacketTop = points.cfNeck.shift(180, placketwidth * 1.5)
  points.outerPlacketBottom = points.cfHem.shift(180, placketwidth * 1.5)

  //Save the current side seam width and waist width?

  paths.sideSeam = new Path().move(points.armhole).line(points.hem).hide()
  let sideseamlength = paths.sideSeam.length()
  points.waist = points.waist.shift(0, 100)
  paths.waist = new Path().move(points.cfWaist).line(points.waist).hide()

  points.waist = paths.waist.intersects(paths.sideSeam)[0]
  paths.waist = new Path().move(points.cfWaist).line(points.waist).hide()

  let waistOriginal = points.waist.x
  log.info('pre-adjustment waist X: ' + waistOriginal)
  log.info('pre-adjustment side seam: ' + sideseamlength)

  //apply the full bust adjustment
  if (options.bustDart == 'Original' && options.draftForHighBust) {
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

      let sideseamangle = points.hem.angle(points.armhole)
      paths.sideSeam = new Path().move(points.armhole).line(points.hem).hide()

      points.FBA_cut_A_end = points.bustpoint.shift(sideseamangle - 90, measurements.bust / 4)

      paths.FBA_cut_A = new Path().move(points.bustpoint).line(points.FBA_cut_A_end).hide()

      if (paths.sideSeam.intersects(paths.FBA_cut_A).length == 0) {
        points.sideSeamIntercept = paths.sideSeam.shiftFractionAlong(options.bustDartHeight)
      } else {
        points.sideSeamIntercept = paths.sideSeam.intersects(paths.FBA_cut_A)[0]
      }

      /*if (!points.sideSeamIntercept) {
          points.sideSeamIntercept = paths.sideSeam.shiftFractionAlong(options.bustDartOffset)
        }*/

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
  } else if (options.bustDart == 'Rotation' && options.draftForHighBust) {
    points.bustpoint = new Point(measurements.bustSpan / 2, measurements.hpsToBust)
    let sideseamangle = points.hem.angle(points.armhole)
    snippets.bustpoint = new Snippet('notch', points.bustpoint)

    paths.sideSeam = new Path().move(points.hem).line(points.armhole).reverse()

    points.FBA_cut_A_end = points.bustpoint.shift(sideseamangle - 90, measurements.bust / 4)
    paths.FBA_cut_A = new Path()
      .move(points.bustpoint)
      .line(points.FBA_cut_A_end)
      .attr('class', 'sa')
      .hide()

    if (paths.sideSeam.intersects(paths.FBA_cut_A).length == 0) {
      points.sideSeamIntercept = paths.sideSeam.shiftFractionAlong(options.bustDartHeight)
    } else {
      points.sideSeamIntercept = paths.sideSeam.intersects(paths.FBA_cut_A)[0]
    }
    points.FBA_cut_B_end = points.bustpoint.shift(
      -90,
      (measurements.hpsToWaistFront + measurements.waistToHips - measurements.hpsToBust) * 1.1
    )
    paths.FBA_cut_B = new Path()
      .move(points.bustpoint)
      .line(points.FBA_cut_B_end)
      .attr('class', 'sa')
      .hide()
    points.bottomHemIntercept = paths.FBA_cut_B.intersectsY(points.hem.y)[0]

    const armCutAngle =
      points.bustpoint.angle(
        points.armholeHollow.shiftFractionTowards(points.frontArmholePitch, 0.5)
      ) * options.armCutAngle

    points.FBA_cut_C_end = points.bustpoint.shift(armCutAngle, measurements.hpsToBust)
    paths.FBA_cut_C = new Path()
      .move(points.bustpoint)
      .line(points.FBA_cut_C_end)
      .attr('class', 'sa')
      .hide()

    points.armholeIntercept = paths.FBA_cut_C.intersects(paths.seam)[0]
    points.bustPointRotated = new Point(points.bustpoint.x, points.bustpoint.y)

    let rotated = [
      'bottomHemIntercept',
      'hem',
      'sideSeamIntercept',
      'FBA_cut_A_end',
      'armhole',
      'armholeCp2',
      '_tmp1',
      '_tmp2',
      '_tmp3',
      'armholeHollowCp1',
      'armholeHollow',
      'bustPointRotated',
    ]

    let bustDifferential =
      measurements.bust * (1 + options.fullBustEase) -
      measurements.highBust * (1 + options.chestEase)
    let anglemoved = 0
    while (points.bustpoint.dx(points.bustPointRotated) < bustDifferential) {
      //log.info("dx: " + points.bustpoint.dx(points.bustPointRotated) )
      for (let p of rotated) {
        points[p] = points[p].rotate(1, points.armholeIntercept)
      }
      anglemoved += 1
    }
    log.info('Angle moved: ' + anglemoved)

    points.hem = points.hem.rotate(-anglemoved, points.bustPointRotated)
    points.sideSeamIntercept = points.sideSeamIntercept.rotate(-anglemoved, points.bustPointRotated)

    paths.sideSeam = new Path()
      .move(points.hem)
      .line(points.sideSeamIntercept)
      .line(points.armhole)
      .hide()

    let verticaldifferential = points.hem.y - points.cfHem.y
    let hemlower = ['outerPlacketBottom', 'centerPlacketBottom', 'cfHem', 'innerPlacketBottom']

    for (let p of hemlower) {
      points[p] = new Point(points[p].x, points.hem.y)
    }

    points.dartTopEdge = points.sideSeamIntercept.shift(sideseamangle, verticaldifferential)
    points.dartBottomEdge = points.sideSeamIntercept.shift(
      sideseamangle - 180,
      verticaldifferential
    )
    points.dartPoint = points.bustpoint.shiftFractionTowards(
      points.sideSeamIntercept,
      options.bustDartOffset
    )
    paths.bustDart = new Path()
      .move(points.dartTopEdge)
      .line(points.dartPoint)
      .line(points.dartBottomEdge)
  } else {
    paths.sideSeam = new Path().move(points.hem).line(points.armhole).hide()
  }

  //Apply full belly adjustment if it's needed
  if (options.useBellyAdjustment) {
    log.info('Full belly adjustment is enabled')

    let waistTarget = (measurements.waist * (1 + options.waistEase) - 2 * waistOriginal) / 2
    let waistY = measurements.hpsToWaistBack

    if (points.sideSeamIntercept) points.rotatePoint = points.sideSeamIntercept
    else points.rotatePoint = points.armhole

    points.waistIntersect = paths.sideSeam.intersectsY(waistY)[0]

    log.info(
      'Waist front target is ' +
        waistTarget +
        ', waist front current is ' +
        points.waistIntersect.x +
        '. starting rotation'
    )

    let totalAngle = 0
    paths.sideTarget = new Path().move(points.hem).line(points.rotatePoint).hide()

    points.bellyEdge = points.cfHem.shiftFractionTowards(points.hem, options.bellyAdjustmentX)

    while (waistTarget > points.waistIntersect.x && totalAngle < 30) {
      points.hem = points.hem.rotate(1, points.rotatePoint)
      points.bellyEdge = points.bellyEdge.rotate(1, points.rotatePoint)

      totalAngle++

      paths.sideTarget = new Path().move(points.hem).line(points.rotatePoint).hide()

      points.waistIntersect = paths.sideTarget.intersectsY(waistY)[0]
    }
    log.info(
      'Waist front target is ' +
        waistTarget +
        ', waist front current is ' +
        points.waistIntersect.x +
        ', angle ' +
        totalAngle
    )
    points.outerPlacketBottom.y = points.bellyEdge.y
    points.cfHem.y = points.bellyEdge.y

    if (!options.bustDart) {
      paths.sideSeam = new Path().move(points.hem).line(points.armhole).hide()
    } else {
      paths.sideSeam = new Path()
        .move(points.hem)
        .line(points.rotatePoint)
        .line(points.armhole)
        .hide()
    }
  }

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

  //Draw the buttons
  paths.centerLine = new Path().move(points.cfNeck).line(points.cfHem).attr('class', 'sa').hide()
  let j = options.closureCount
  j--
  let closurePoints = []

  points.topButton = points.cfNeck.shiftTowards(points.cfHem, placketwidth / 2)
  snippets['top_button'] = new Snippet('button', points.topButton)
  for (let i = 1; i < j; i++) {
    closurePoints.push(points.topButton.shiftFractionTowards(points.cfHem, i / j))
  }
  for (let b in closurePoints) {
    snippets[b + '_button'] = new Snippet('button', closurePoints[b])
  }

  //Redefine base seam and seam allowance to respect placket
  paths.saBase = new Path().move(points.outerPlacketBottom)
  if (options.useBellyAdjustment) {
    paths.saBase = paths.saBase.line(points.bellyEdge)
  }
  paths.saBase = paths.saBase
    .line(points.hem)
    .join(paths.sideSeam)
    .curve(points.armholeCp2, points.armholeHollowCp1, points.armholeHollow)

  if (options.bustDart == 'Rotation' && options.draftForHighBust) {
    paths.saBase = paths.saBase.line(points.armholeIntercept)
  } else {
    paths.saBase = paths.saBase.curve(
      points.armholeHollowCp2,
      points.armholePitchCp1,
      points.armholePitch
    )
  }
  paths.saBase = paths.saBase
    //.curve(points.armholeHollowCp2, points.armholePitchCp1, points.armholePitch)
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

    paths.pocketLine = new Path().move(points.pocketTop).line(points.pocketBottom).hide()

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

  store.set('frontWaistLength', points.cfHem.dist(points.hem))

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
  macro('hd', {
    id: 'wGreen',
    from: points.outerPlacketTop,
    to: points.centerPlacketTop,
    y: points.cfNeck.y + 15,
  })
  macro('hd', {
    id: 'wGreenBottom',
    from: points.outerPlacketTop,
    to: points.centerPlacketTop,
    y: points.cfHem.y - 15,
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
    from: points.hem,
    to: points.waist,
    x: points.armhole.x + sa + 15,
  })
  macro('vd', {
    id: 'hWaistToChest',
    from: points.waist,
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

  if (options.frontWeltPockets) {
    macro('ld', {
      id: 'pocketLength',
      from: points.pocketTopOuter,
      to: points.pocketBottomOuter,
    })
    macro('ld', {
      id: 'pocketWidth',
      to: points.pocketTopOuter,
      from: points.pocketTopInner,
    })
    macro('vd', {
      id: 'pocketBottomHeight',
      to: points.cfHem,
      from: points.pocketBottom,
      x: points.pocketBottom.x,
    })
    macro('hd', {
      id: 'pocketBottomX',
      from: points.centerPlacketBottom,
      to: points.pocketBottom,
      y: points.pocketBottom.y,
    })
    macro('vd', {
      id: 'pocketTopHeight',
      to: points.cfHem,
      from: points.pocketTop,
      x: points.pocketTop.x - 15,
    })
    macro('hd', {
      id: 'pocketTopX',
      from: points.centerPlacketBottom,
      to: points.pocketTop,
      y: points.pocketTop.y,
    })
  }

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
    'waist',
  ],
  hide: hidePresets.HIDE_TREE,
  options: {
    hipsEase: { pct: 8, min: -10, max: 50, menu: 'fit' },
    chestEase: { pct: 15, min: -10, max: 50, menu: 'fit' },

    placketwidth: { pct: 3, min: 0, max: 10, menu: 'style.placket' },
    neckShiftForward: { pct: 0, min: 0, max: 40, menu: 'style' },
    collarEase: { pct: 2, min: -10, max: 50, menu: 'fit' },

    draftForHighBust: { bool: false, menu: 'fit.bust' },
    bustDart: { dflt: 'None', list: ['None', 'Rotation', 'Original'], menu: 'fit.bust' },
    bustDartOffset: { pct: 25, min: 5, max: 90, menu: 'fit.bust' },
    bustDartHeight: { pct: 20, min: 5, max: 95, menu: 'fit.bust.advanced' },
    fullBustEase: { pct: 10, min: 0, max: 50, menu: 'fit.bust' },
    armCutAngle: { pct: 100, min: 75, max: 125, menu: 'fit.bust.advanced' },

    ribbing: { bool: true, menu: 'construction' },
    ribbingHeight: { pct: 10, min: 5, max: 15, menu: 'style' },

    frontWeltPockets: { bool: true, menu: 'style.pocket' },
    pocketBottomX: { pct: 70, min: 40, max: 95, menu: 'style.pocket' },
    pocketTopX: { pct: 60, min: 40, max: 95, menu: 'style.pocket' },
    pocketBottomY: { pct: 7, min: 0, max: 50, menu: 'style.pocket' },
    pocketTopY: { pct: 30, min: 0, max: 50, menu: 'style.pocket' },

    pocketWeltWidth: { pct: 7, min: 0, max: 20, menu: 'style.pocket' },

    closureCount: { count: 7, min: 3, max: 12, menu: 'style.placket' },

    waistEase: { pct: 10, min: 0, max: 50, menu: 'fit.belly' },
    bellyAdjustmentX: { pct: 40, min: 5, max: 95, menu: 'fit.belly' },
    useBellyAdjustment: { bool: false, menu: 'fit.belly' },
  },
  draft: draftfront,
}
