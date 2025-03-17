import { sleeve as briansleeve } from '@freesewing/brian'
import { front } from './front.mjs'
import { hidePresets } from '@freesewing/core'

function draftsleeve({
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
}) {
  //points.hem.x = measurements.hips * (1+options.hipsEase ) / 4

  // Shorten body to take ribbing into account
  if (options.ribbing) {
    //Just redefining ribbing height again until I figure out how to make it work with the store
    //let rh = options.ribbingHeight * (measurements.hpsToWaistBack + measurements.waistToHips)
    let rh = store.get('ribbingHeight')

    for (let p of ['wristLeft', 'centerWrist', 'wristRight']) points[p] = points[p].shift(90, rh)

    paths.seam = new Path()
      .move(points.bicepsLeft)
      .move(points.wristLeft)
      .move(points.wristRight)
      .line(points.bicepsRight)
      .join(paths.sleevecap)
      .close()
      .attr('class', 'fabric')

    if (sa) paths.sa = paths.seam.offset(sa).attr('class', 'fabric sa')
  }
  return part
}

export const sleeve = {
  name: 'jett.sleeve',
  from: briansleeve,
  after: front,
  hide: hidePresets.HIDE_TREE,
  options: { cuffEase: { pct: 60, min: -8, max: 100, menu: 'fit' } },
  draft: draftsleeve,
}
