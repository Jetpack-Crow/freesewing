import { coat } from './coat.mjs'

function pocketpath({
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
  const pocketWidth = store.get('pocketWidth')
  const pocketDepth = store.get('pocketDepth')

  points.pocket_bottom_center = new Point(0, 0)
  points.pocket_bottom_outer_edge = new Point(0.8 * pocketWidth, 0)
  points.pocket_outer_point = new Point(pocketWidth, pocketDepth * 0.7)
  points.pocketTop_outer_edge = new Point(0.9 * pocketWidth, pocketDepth)
  points.pocketTop_center = new Point(0, pocketDepth)

  let pocket = new Path()
    .move(points.pocketTop_center)
    .line(points.pocketTop_outer_edge)
    .line(points.pocket_outer_point)
    .line(points.pocket_bottom_outer_edge)
    .line(points.pocket_bottom_center)

    .close()
    .addClass('fabric')

  return pocket
}

function draftkangaroopocket({
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
  if (options.pocketType == 'kangaroo') {
    paths.kangaroopocketseam = pocketpath({
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
    })
    macro('hd', {
      id: 'pocketWidth',
      from: points.pocket_bottom_center,
      to: points.pocket_outer_point,
      y: points.pocket_outer_point.y,
    })
    macro('vd', {
      id: 'pocket_height',
      from: points.pocket_bottom_center,
      to: points.pocketTop_center,
      x: points.pocket_bottom_outer_edge.x,
    })
    macro('cutonfold', {
      from: points.pocket_bottom_center,
      to: points.pocketTop_center,
      grainline: true,
    })

    let titlescale = options.chestCircum * options.pocketWidth * 2

    points.titleAnchor = points.pocketTop_center
      .shiftFractionTowards(points.pocket_bottom_center, 0.5)
      .shiftFractionTowards(points.pocket_outer_point, 0.3)

    macro('title', {
      at: points.titleAnchor,
      nr: 2,
      title: 'kangaroopocket',
      scale: titlescale,
    })

    if (sa) {
      paths.sa = paths.kangaroopocketseam.offset(sa).addClass('fabric sa')
    }
  }

  return part
}

export const kangaroopocket = {
  name: 'jasmine.kangaroopocket',
  after: coat,
  options: {},
  draft: draftkangaroopocket,
}
