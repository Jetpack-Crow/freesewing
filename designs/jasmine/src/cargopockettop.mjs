import { coat } from './coat.mjs'

function draftcargopockettop({
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

    points.topCenter = new Point(0, 0)
    points.topEdgeRight = new Point(pocketWidth, 0)
    points.bottomEdgeRight = new Point(pocketWidth, pocketDepth / 6)
    points.pocketCenterBottom = new Point(0, pocketDepth / 3)

    points.topEdgeLeft = points.topEdgeRight.flipX()
    points.bottomEdgeLeft = points.bottomEdgeRight.flipX()

    paths.pocketTop = new Path()
      .move(points.topCenter)
      .line(points.topEdgeRight)
      .line(points.bottomEdgeRight)
      .line(points.pocketCenterBottom)
      .line(points.bottomEdgeLeft)
      .line(points.topEdgeLeft)
      .line(points.topCenter)

      .close()
      .reverse()
      .setClass('fabric')

    if (sa) {
      paths.sa = paths.pocketTop.offset(sa).setClass('fabric sa')
    }

    points.buttonPosition = points.topCenter.shift(270, pocketDepth * 0.3 * 0.6)

    snippets.pocketTopNotch = new Snippet('buttonhole', points.buttonPosition)

    let titlescale = options.chestCircum * options.pocketWidth

    points.titleAnchor = points.buttonPosition.shiftFractionTowards(points.bottomEdgeRight, 0.3)

    macro('title', {
      at: points.titleAnchor,
      nr: 4,
      title: 'cargopockettop',
      scale: titlescale,
    })

    macro('hd', {
      id: 'hWidth',
      from: points.topEdgeLeft,
      to: points.topEdgeRight,
      y: points.topEdgeRight.y - sa - 15,
    })

    macro('vd', {
      id: 'vHeight',
      from: points.topCenter,
      to: points.pocketCenterBottom,
      x: points.topCenter.x,
    })
  }

  return part
}

export const cargopockettop = {
  name: 'jasmine.cargopockettop',
  after: coat,
  options: {
    cargo_pocket_fold: { pct: 15, min: 0, max: 50, menu: 'style.pocket.cargo' },
  },
  draft: draftcargopockettop,
}
