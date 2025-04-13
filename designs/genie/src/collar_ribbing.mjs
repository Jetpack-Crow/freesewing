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
}) {
  let length = measurements.neck * (1 + options.neckEase)
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
    .hide()
  paths.seam = paths.saBase.unhide().close()

  return part
}

export const collar_ribbing = {
  name: 'Jett.collar_ribbing',
  measurements: ['neck'],
  options: {
    collarEase: { pct: 2, min: -10, max: 50, menu: 'fit' },
    ribbedCollarWidth: { pct: 10, min: 2, max: 40, menu: 'style.collar' },
    ribbedCollarCurve: { pct: 40, min: 0, max: 50, menu: 'style.collar' },
  },
  draft: draftJettCollarRibbing,
}
