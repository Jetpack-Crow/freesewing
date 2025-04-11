import { front } from './front.mjs'

function draftJettPocketWelt({
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
  log.info('Pocket length is ' + store.get('pocketLength'))

  let length = store.get('pocketLength')
  let width = store.get('pocketWidth') * 2

  points.topLeft = new Point(0, 0)
  points.topRight = new Point(width, 0)
  points.bottomRight = new Point(width, length)
  points.bottomLeft = new Point(0, length)

  paths.seam = new Path()
    .move(points.topLeft)
    .line(points.topRight)
    .line(points.bottomRight)
    .line(points.bottomLeft)
    .line(points.topLeft)
    .reverse()

  if (sa) {
    paths.sa = paths.seam.offset(sa).attr('class', 'fabric sa')
    paths.sa.line(paths.sa.start())
  }

  store.cutlist.setCut({ cut: 2, from: 'fabric' })
  points.title = points.topLeft.shiftFractionTowards(points.bottomRight, 0.5)

  macro('title', {
    at: points.bottomLeft,
    nr: 10,
    title: 'pocket_welt',
  })

  macro('hd', {
    id: 'wTotal',
    from: points.topLeft,
    to: points.topRight,
    y: points.bottomLeft.y + sa + 15,
  })

  macro('vd', {
    id: 'hTotal',
    from: points.topLeft,
    to: points.bottomLeft,
    x: points.bottomLeft.x - sa - 15,
  })

  return part
}

export const pocket_welt = {
  name: 'Jett.pocket_welt',
  after: front,
  options: {},
  draft: draftJettPocketWelt,
}
