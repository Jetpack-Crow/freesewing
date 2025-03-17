import { front } from './front.mjs'

function draftJettWaistbandEnds({
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
  if (!options.ribbing) return part.hide()

  //Just redefining ribbing height again until I figure out how to make it work with the store
  let rh = options.ribbingHeight * (measurements.hpsToWaistBack + measurements.waistToHips)
  rh = rh * 2
  //let rh = store.get('ribbingHeight')

  //When the store works and the full belly adjustment is in place,
  // define this as a percentage of the total hip circumference
  //for now, it's just relative to hip
  let width = measurements.hips * (1 + options.hipsEase) * options.ribbingEndsPercentage

  points.topLeft = new Point(0, 0)
  points.topRight = new Point(width, 0)
  points.bottomRight = new Point(width, rh)
  points.bottomLeft = new Point(0, rh)

  paths.seam = new Path()
    .move(points.topLeft)
    .line(points.topRight)
    .line(points.bottomRight)
    .line(points.bottomLeft)
    .close()

  return part
}

export const waistband_ends = {
  name: 'Jett.waistband_ends',

  after: front,
  options: {
    ribbingEndsPercentage: { pct: 5, min: 0, max: 20, menu: 'construction' },
  },
  draft: draftJettWaistbandEnds,
}
