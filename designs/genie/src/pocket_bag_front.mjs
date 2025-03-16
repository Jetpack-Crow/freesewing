function draft_pocket_bag_front({
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
  if (!options.frontWeltPockets) {
    part.hide()
    return part
  }
  let body_width = (measurements.hips * (1 + options.hipsEase)) / 4
  let body_length = measurements.hpsToWaistBack + measurements.waistToHips

  points.pocketBottom = new Point(
    body_width * options.pocketBottomX,
    -1 * body_length * options.pocketBottomY
  )
  points.pocketTop = new Point(
    body_width * options.pocketTopX,
    -1 * body_length * options.pocketTopY
  )

  //points.pocketBottom = new Point(100,200)
  //points.pocketTop = new Point(0,0)

  let pocketslope =
    -(points.pocketBottom.y - points.pocketTop.y) / (points.pocketBottom.x - points.pocketTop.x)
  let pocketangle = (Math.atan(pocketslope) * 180) / 3.14159

  let pocketWeltOffset = (options.pocketWeltWidth * measurements.hips) / 10

  points.pocketTopInner = points.pocketTop.shift(pocketangle - 90, pocketWeltOffset)
  points.pocketTopOuter = points.pocketTop.shift(pocketangle + 90, pocketWeltOffset)

  points.pocketBottomInner = points.pocketBottom.shift(pocketangle - 90, pocketWeltOffset)
  points.pocketBottomOuter = points.pocketBottom.shift(pocketangle + 90, pocketWeltOffset)

  let cornerOffset = pocketWeltOffset + measurements.hips * options.pocketCornerOffset

  points.bagTopLeft = new Point(0, points.pocketTop.y - cornerOffset)
  points.bagBottomLeft = new Point(0, 0)
  points.bagBottomRight = new Point(points.pocketBottom.x + cornerOffset, 0)
  points.bagTopCorner = new Point(
    points.pocketTop.x + cornerOffset,
    points.pocketTop.y - cornerOffset
  )
  points.bagBottomCorner = new Point(
    points.pocketBottom.x + cornerOffset,
    points.pocketBottom.y - cornerOffset
  )

  paths.pocketBag = new Path()
    .move(points.bagTopLeft)
    .line(points.bagTopCorner)
    .line(points.bagBottomCorner)
    .line(points.bagBottomRight)
    .line(points.bagBottomLeft)
    .close()

  paths.pocketOutline = new Path()
    .move(points.pocketTopInner)
    .line(points.pocketTopOuter)
    .line(points.pocketBottomOuter)
    .line(points.pocketBottomInner)
    .close()
    .attr('sa')

  return part
}

export const pocket_bag_front = {
  name: 'Jett.pocket_bag_front',

  options: {
    pocketCornerOffset: { pct: 1, min: 0, max: 3, menu: 'advanced' },
  },

  draft: draft_pocket_bag_front,
}
