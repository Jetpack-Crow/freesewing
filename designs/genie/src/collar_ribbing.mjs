function draftJettCollarRibbing({
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
  log,
  measurements,
  store,
}) {
  let length = measurements.neck * (1 + options.collarEase)
  let width = length * options.ribbedCollarWidth

  points.centerTop = new Point(0, 0)
  points.centerBottom = new Point(0, width)

  points.outerCenter = new Point(length / 2, width / 2)
  points.outerControlTop = new Point(length / 2, width / 4)
  points.outerControlBottom = new Point(length / 2, (3 * width) / 4)

  points.halfTop = new Point(options.ribbedCollarCurve * length * 0.5, 0)
  points.halfControlTop = new Point(options.ribbedCollarCurve * length, 0)
  points.halfBottom = new Point(options.ribbedCollarCurve * length * 0.5, width)
  points.halfControlBottom = new Point(options.ribbedCollarCurve * length, width)

  paths.saBase = new Path()
    .move(points.centerTop)
    .line(points.halfTop)
    .curve(points.halfControlTop, points.outerControlTop, points.outerCenter)
    .curve(points.outerControlBottom, points.halfControlBottom, points.halfBottom)
    .line(points.centerBottom)
    .reverse()
    .hide()
  paths.seam = paths.saBase.unhide().close()

  if (sa) {
    paths.sa = paths.saBase.offset(sa).attr('class', 'fabric sa')
    paths.sa.line(paths.sa.start())
  }

  macro('hd', {
    id: 'wTotal',
    from: points.centerTop,
    to: points.outerCenter,
    y: points.centerTop.y - sa - 30,
  })
  macro('hd', {
    id: 'wCurve',
    from: points.centerTop,
    to: points.halfTop,
    y: points.centerTop.y - sa - 15,
  })
  macro('vd', {
    id: 'hTotal',
    from: points.centerTop,
    to: points.centerBottom,
    x: points.centerTop.x - sa - 15,
  })
  macro('cutonfold', {
    from: points.centerTop,
    to: points.centerBottom,
    grainline: true,
  })

  store.cutlist.setCut({ cut: 1, from: 'ribbing', onFold: 'true' })

  points.title = points.centerTop.shiftFractionTowards(points.outerCenter, 0.3)
  macro('title', { at: points.title, nr: 5, title: 'collar_ribbing' })

  return part
}

export const collar_ribbing = {
  name: 'Jett.collar_ribbing',
  measurements: ['neck'],
  options: {
    collarEase: { pct: 2, min: -10, max: 50, menu: 'fit' },
    ribbedCollarWidth: { pct: 20, min: 1, max: 80, menu: 'style.collar' },
    ribbedCollarCurve: { pct: 40, min: 0, max: 50, menu: 'style.collar' },
  },
  draft: draftJettCollarRibbing,
}
