import { Design } from '@freesewing/core'
import { i18n } from '../i18n/index.mjs'
import { data } from '../data.mjs'

import { i18n as brianI18n } from '@freesewing/brian'
import { cuff } from '@freesewing/huey'

// Parts
import { front } from './front.mjs'
import { back } from './back.mjs'

import { yoke } from './yoke.mjs'
import { sleeve } from './sleeve.mjs'
import { waistband } from './waistband.mjs'
import { waistband_ends } from './waistband_ends.mjs'
import { collar_ribbing } from './collar_ribbing.mjs'
import { pocket_bag_front } from './pocket_bag_front.mjs'




// Create new design
const Genie = new Design({
  data,
  parts: [ front, back, yoke, sleeve, waistband, waistband_ends, collar_ribbing, pocket_bag_front, cuff],
})

// Named exports
export { front,  back, yoke, sleeve, waistband, waistband_ends, cuff, collar_ribbing, pocket_bag_front, i18n, Genie }
