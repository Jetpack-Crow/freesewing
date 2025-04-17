import { coat } from './coat.mjs'

function draftcargopocket({
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
  if (options.pocketType == 'cargo') {
    let pocketWidth = store.get('pocketWidth')
    let pocketDepth = store.get('pocketDepth')

    //Swap the orientation if the flap is on the other side
    if (options.cargo_pocket_orientation == 'horizontal') {
      pocketWidth = store.get('pocketDepth') * 0.5
      pocketDepth = store.get('pocketWidth') * 2
    }

    const folds_width = (pocketWidth + pocketDepth) * options.cargo_pocket_fold

    points.innerTopCenter = new Point(0, 0)
    points.innerBottomCenter = points.innerTopCenter.shift(270, pocketDepth)

    points.innerTopEdgeRight = points.innerTopCenter.shift(0, pocketWidth)
    points.innerBottomEdgeRight = points.innerBottomCenter.shift(0, pocketWidth)

    //Bottom edge offset
    points.bottomEdgeCenter = points.innerBottomCenter.shift(270, folds_width)
    points.bottomEdgeOuter = points.innerBottomEdgeRight.shift(270, folds_width)

    //Right edge offset
    points.rightEdgeTop = points.innerTopEdgeRight.shift(0, folds_width)
    points.rightEdgeBottom = points.innerBottomEdgeRight.shift(0, folds_width)

    paths.cargoPocketSquare = new Path()
      .move(points.innerTopCenter)
      .line(points.innerTopEdgeRight)
      .line(points.innerBottomEdgeRight)
      .line(points.innerBottomCenter)
      .addClass('sa')

    paths.cargoPocketJagged = new Path()
      .move(points.bottomEdgeCenter)
      .line(points.bottomEdgeOuter)
      .line(points.innerBottomEdgeRight)
      .line(points.rightEdgeBottom)
      .line(points.rightEdgeTop)
      .hide()

    paths.cargoPocketTop = new Path().move(points.rightEdgeTop).line(points.innerTopCenter).hide()

    paths.seam = paths.cargoPocketTop.join(paths.cargoPocketJagged).addClass('fabric')

    if (sa) {
      paths.sa = paths.cargoPocketJagged
        .offset(sa)
        .join(paths.cargoPocketTop.offset(sa * 2))
        .close()
        .trim()
        .setClass('fabric sa')
    }

    macro('cutonfold', {
      to: points.bottomEdgeCenter,
      from: points.innerTopCenter,
      grainline: true,
    })

    const titlescale = options.chestCircum * options.pocketWidth

    points.titleAnchor = points.innerTopCenter.shiftFractionTowards(points.bottomEdgeOuter, 0.7)

    macro('title', {
      at: points.titleAnchor,
      nr: 3,
      title: 'cargopocket',
      scale: titlescale,
    })

    macro('vd', {
      id: 'vHeight',
      from: points.innerTopCenter,
      to: points.bottomEdgeCenter,
      x: points.innerTopCenter.x - sa - 15,
    })
    macro('hd', {
      id: 'hWidth',
      from: points.innerTopCenter,
      to: points.rightEdgeTop,
      y: points.innerTopCenter.y - sa - 15,
    })

    macro('hd', {
      id: 'pleatWidth',
      from: points.innerTopEdgeRight,
      to: points.rightEdgeTop,
      y: points.innerTopCenter.y + 15,
    })
    macro('vd', {
      id: 'pleatWidthV',
      from: points.innerBottomCenter,
      to: points.bottomEdgeCenter,
      x: points.innerTopCenter.x + 15,
    })

    snippets.pocketTopNotch = new Snippet('notch', points.innerTopCenter)

    points.buttonPosition = points.innerTopCenter.shift(270, pocketDepth * 0.3 * 0.6)
    snippets.pocketbutton = new Snippet('button', points.buttonPosition)
  }

  return part
}

export const cargopocket = {
  name: 'jasmine.cargopocket',
  after: coat,
  options: {},
  draft: draftcargopocket,
}
