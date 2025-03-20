import { Design, mergeI18n } from '@freesewing/core'
import { data } from '../data.mjs'

//import { i18n as brianI18n } from '@freesewing/brian'

import { i18n as brianI18n } from '@freesewing/brian'
import { i18n as jetti18n } from '../i18n/index.mjs'
const i18n = mergeI18n([brianI18n, jetti18n])

// Parts
import { front } from './front.mjs'
import { back } from './back.mjs'

import { yoke } from './yoke.mjs'
import { sleeve } from './sleeve.mjs'
import { waistband } from './waistband.mjs'
import { waistband_ends } from './waistband_ends.mjs'
import { pocket_welt } from './pocket_welt.mjs'
import { collar_ribbing } from './collar_ribbing.mjs'
import { pocket_bag_front } from './pocket_bag_front.mjs'
import { cuff } from './cuff.mjs'

// Create new design
const Jett = new Design({
  data,
  parts: [
    front,
    back,
    yoke,
    sleeve,
    waistband,
    waistband_ends,
    pocket_welt,
    collar_ribbing,
    pocket_bag_front,
    cuff,
  ],
})

// Named exports
export {
  front,
  back,
  yoke,
  sleeve,
  waistband,
  waistband_ends,
  pocket_welt,
  cuff,
  collar_ribbing,
  pocket_bag_front,
  i18n,
  Jett,
}
