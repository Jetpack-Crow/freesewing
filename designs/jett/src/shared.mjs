import { capitalize } from '@freesewing/core'

export function draftRibbing(part, length) {
  const { store, measurements, options, points, paths, Path, Point, expand, sa, macro, units } =
    part.shorthand()
  // Don't run this every time, except when sampling
  if (typeof store.get('ribbingHeight') === 'undefined' || part.context.settings.sample) {
    store.set(
      'ribbingHeight',
      (measurements.hpsToWaistBack + measurements.waistToHips) * options.ribbingHeight
    )
  }
  const height = store.get('ribbingHeight')

  if (expand) {
    store.flag.preset('expandIsOn')
  } else {
    // Expand is off, do not draw the part but flag this to the user
    const extraSa = sa ? 2 * sa : 0
    store.flag.note({
      msg: `huey:cut${capitalize(part.name.split('.')[1])}`,
      notes: [sa ? 'flag:saIncluded' : 'flag:saExcluded', 'flag:partHiddenByExpand'],
      replace: {
        w: units(2 * height + extraSa),
        l: units(length + extraSa),
      },
      suggest: {
        text: 'flag:show',
        icon: 'expand',
        update: {
          settings: ['expand', 1],
        },
      },
    })
    // Also hint about expand
    store.flag.preset('expandIsOff')

    return part.hide()
  }

  points.topLeft = new Point(0, 0)
  points.topRight = new Point(height * 2, 0)
  points.bottomLeft = new Point(0, length)
  points.bottomRight = new Point(points.topRight.x, length)

  paths.seam = new Path()
    .move(points.bottomRight)
    .line(points.topRight)
    .line(points.topLeft)
    .line(points.bottomLeft)
    .line(points.bottomRight)
    .close()
    .addClass('various')

  if (sa) paths.sa = paths.seam.offset(sa).addClass('various sa')

  /*
   * Annotations
   */
  // Title
  points.title = new Point(points.bottomRight.x / 3, points.bottomRight.y / 3)

  // Dimensions
  macro('vd', {
    id: 'hFull',
    from: points.bottomRight,
    to: points.topRight,
    x: points.topRight.x + sa + 15,
  })
  macro('hd', {
    id: 'wFull',
    from: points.topLeft,
    to: points.topRight,
    y: points.topRight.y - sa - 15,
  })
}
