import { front } from './front.mjs'

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
  let body_length =
    measurements.hpsToWaistBack + measurements.waistToHips - store.get('ribbingHeight')

  let placketwidth = measurements.chest * (1 + options.chestEase) * options.placketwidth
  let placketoffset = placketwidth / 2

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

  points.bagTopLeft = new Point(-placketoffset, points.pocketTop.y - cornerOffset)
  points.bagBottomLeft = new Point(-placketoffset, 0)
  points.bagBottomRight = new Point(points.pocketBottom.x + cornerOffset, 0)
  points.bagTopCorner = new Point(
    points.pocketTop.x + cornerOffset,
    points.pocketTop.y - cornerOffset
  )
  points.bagBottomCorner = new Point(
    points.pocketBottom.x + cornerOffset,
    points.pocketBottom.y - cornerOffset
  )

  paths.saBase = new Path()
    .move(points.bagTopLeft)
    .line(points.bagTopCorner)
    .line(points.bagBottomCorner)
    .line(points.bagBottomRight)
    .line(points.bagBottomLeft)
    .reverse()
    .close()

  //This isn't working. fix later
  if (sa) {
    paths.sa = paths.saBase.offset(sa).attr('class', 'fabric sa')
    paths.sa.line(paths.sa.start())
  }

  paths.pocketOutline = new Path()
    .move(points.pocketTopInner)
    .line(points.pocketTopOuter)
    .line(points.pocketBottomOuter)
    .line(points.pocketBottomInner)
    .close()
    .attr('class', 'sa')

  points.placketMarkTop = points.bagTopLeft.shift(0, placketoffset * 2)
  points.placketMarkBottom = points.bagBottomLeft.shift(0, placketoffset * 2)
  paths.placketMark = new Path()
    .move(points.placketMarkTop)
    .line(points.placketMarkBottom)
    .attr('class', 'sa')

  store.cutlist.addCut({ cut: 2, from: 'fabric', identical: false })
  store.cutlist.addCut({ cut: 2, from: 'lining', identical: false })

  points.title = points.bagBottomLeft.shiftFractionTowards(points.bagTopCorner, 0.4)
  macro('title', { at: points.title, nr: 9, title: 'pocket_bag_front' })

  macro('vd', {
    id: 'hTotal',
    from: points.bagTopLeft,
    to: points.bagBottomLeft,
    x: points.bagTopLeft.x - 15,
  })
  macro('hd', {
    id: 'wBottom',
    from: points.bagBottomLeft,
    to: points.bagBottomRight,
    y: points.bagBottomLeft.y + sa + 15,
  })

  macro('hd', {
    id: 'wTop',
    from: points.bagTopLeft,
    to: points.bagTopCorner,
    y: points.bagTopLeft.y - sa - 15,
  })
  macro('vd', {
    id: 'hLower',
    from: points.bagBottomCorner,
    to: points.bagBottomRight,
    x: points.bagBottomRight.x + sa + 15,
  })
  macro('hd', {
    id: 'placketMark',
    from: points.bagTopLeft,
    to: points.placketMarkTop,
    y: points.bagTopLeft.y + 15,
  })

  macro('ld', {
    id: 'pocketDiagonal',
    to: points.bagTopCorner,
    from: points.pocketTopOuter,
  })

  macro('ld', {
    id: 'pocketLength',
    to: points.pocketBottomOuter,
    from: points.pocketTopOuter,
  })
  macro('ld', {
    id: 'pocketWidth',
    from: points.pocketTopInner,
    to: points.pocketTopOuter,
  })

  return part
}

export const pocket_bag_front = {
  name: 'Jett.pocket_bag_front',
  after: front,

  options: {
    pocketCornerOffset: { pct: 2, min: 0, max: 4, menu: 'advanced' },
  },

  draft: draft_pocket_bag_front,
}
