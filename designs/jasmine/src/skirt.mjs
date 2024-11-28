function draftskirt({options,Point,Path,points,paths,Snippet,snippets,sa,macro,part,store}) {

    if (options.skirt) {



        points.topcenter = new Point(0,0)
        points.topouter = new Point(100,0)
        points.bottomcenter = new Point(0,40)
        points.bottomouter = new Point(100,40)

        paths.skirtpath = new Path()
            .move(points.topcenter)
            .line(points.bottomcetner)
            .line(points.bottomouter)
            .line(points.topouter)
            .line(points.topcenter)
            .close()
            .attr('class', 'fabric')
    }

    return part
}

export const skirt = {
    name: 'skirt',
    options: {
        skirt: {
            bool: false,
            menu: 'style' 
        }
    },
    draft: draftskirt,
  }
  