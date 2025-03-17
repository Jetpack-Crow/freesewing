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
  paths.edgePlacketLine = new Path()
    .move(points.outerPlacketTop)
    .line(points.outerPlacketBottom)
    .attr('class', 'sa')

  paths.centerLine = new Path().move(points.cfNeck).line(points.cfHem).attr('class', 'sa')

  //apply the full bust adjustment
  if (options.bustDart && options.draftForHighBust) {
    //Add a note to bustDart that it only works if draftForHighBust is selected
    points.bustpoint = new Point(measurements.bustSpan / 2, measurements.hpsToBust)

    log.info('chest is ' + measurements.bust)
    log.info('high bust is ' + measurements.highBust)
    let bustDifferential = measurements.bust - measurements.highBust
    log.info('Bust differential is ' + bustDifferential)

    if (bustDifferential <= 0) {
      log.info('Bust error')
      store.flag.info('bustError', "The bust dart won't be generated correctly")
    }

    log.info('hps to waist front is ' + measurements.hpsToWaistFront)
    log.info('hps to waist back is ' + measurements.hpsToWaistBack)

    let waistDifferential = measurements.hpsToWaistFront - measurements.hpsToWaistBack

    if (waistDifferential <= 0) {
      log.info('Bust error')
      store.flag.info('waistError', "The bust dart won't be generated correctly")
    }

    if (bustDifferential > 0 && waistDifferential > 0) {
      //Shift outer points by bust differential / 2
      points.armhole = points.armhole.shift(0, bustDifferential / 2)
      points.hem = points.hem.shift(0, bustDifferential / 2)

      //shift lower points down by waist differential/2 and armhole up by waist differential/2
      points.hem = points.hem.shift(-90, waistDifferential / 2)
      points.outerPlacketBottom = points.outerPlacketBottom.shift(-90, waistDifferential / 2)
      points.armhole = points.armhole.shift(90, waistDifferential / 2)

      //Define the point on the side seam that the dart should be centered on
      paths.sideSeam = new Path().move(points.armhole).line(points.hem).hide()

      let dartPointShift = points.bustpoint.y - points.armhole.y

      points.sideSeamIntercept = paths.sideSeam.shiftAlong(dartPointShift)

      points.dartTopEdge = paths.sideSeam.shiftAlong(dartPointShift - waistDifferential / 2)
      points.dartBottomEdge = paths.sideSeam.shiftAlong(dartPointShift + waistDifferential / 2)

      points.dartPoint = points.bustpoint.shiftFractionTowards(
        points.sideSeamIntercept,
        options.bustDartOffset
      )

      paths.bustDart = new Path()
        .move(points.dartTopEdge)
        .line(points.dartPoint)
        .line(points.dartBottomEdge)
    }
  }

  //Redefine base seam and seam allowance to respect placket
  paths.saBase = new Path()
    .move(points.outerPlacketBottom)
    .line(points.hem)
    .line(points.armhole)
    .curve(points.armholeCp2, points.armholeHollowCp1, points.armholeHollow)
    .curve(points.armholeHollowCp2, points.armholePitchCp1, points.armholePitch)
    .join(paths.frontArmhole)
    .line(points.s3CollarSplit)
    .join(paths.frontCollar)
    .line(points.outerPlacketTop)
    .line(points.outerPlacketBottom)
    .close()

  //This isn't working. fix later
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

    let pocketWeltOffset = (options.pocketWeltWidth * measurements.hips) / 10

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
      .attr('sa')

    log.info('Pocket angle is ' + pocketangle)
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
  ],
  hide: hidePresets.HIDE_TREE,
  options: {
    hipsEase: { pct: 10, min: -10, max: 50, menu: 'fit' },
    chestEase: { pct: 15, min: -10, max: 50, menu: 'fit' },
    collarEase: { pct: 2, min: -10, max: 50, menu: 'fit' },
    placketwidth: { pct: 3, min: 0, max: 10, menu: 'style' },
    ribbing: { bool: true, menu: 'construction' },
    bustDart: { bool: false, menu: 'fit.bust' },
    bustDartOffset: { pct: 25, min: 5, max: 60, menu: 'fit.bust' },
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
