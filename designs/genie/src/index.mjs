//

import { Design } from '@freesewing/core'
import { i18n } from '../i18n/index.mjs'
import { data } from '../data.mjs'

import { i18n as brianI18n } from '@freesewing/brian'
import { i18n as bentI18n } from '@freesewing/bent'
import { i18n as simonI18n } from '@freesewing/simon'

// Parts
import { back } from './back.mjs'
import { yoke } from './yoke.mjs'

// Create new design
const Genie = new Design({
  data,
  parts: [back, yoke],
})

// Named exports
export { back, yoke, i18n, Genie }
