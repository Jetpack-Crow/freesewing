import { back as brianBack, front } from '@freesewing/brian'
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


  log.info("text: " + store.get('Test'))

  // Shorten body to take ribbing into account
  if (options.ribbing) {

    //Just redefining ribbing height again until I figure out how to make it work with the store
    let rh = options.ribbingHeight * (measurements.hpsToWaistBack + measurements.waistToHips)
    //let rh = store.get('ribbingHeight')

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

    macro('cutonfold', {
      from: points.centertop,
      to: points.cbHem,
      grainline: true,
    })
  }
  else {

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

  return part
}

export const back = {
  name: 'genie.back',
  from: brianBack,
  after: front,

  hide: hidePresets.HIDE_TREE,
  measurements: ['hips'],
  options: {
    chestEase: { pct: 10, min: -15, max: 50, menu: 'fit' },
    hipsEase: { pct: 10, min: -15, max: 50, menu: 'fit' },
    yoke: {bool: true, menu: 'construction'},
    yokesplit: { pct: 30, min: 5, max: 100, menu: 'style' },
  },
  draft: draftBack,
}
