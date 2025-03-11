import { Design } from '@freesewing/core'
import { i18n } from '../i18n/index.mjs'
import { data } from '../data.mjs'

import { sleeve, i18n as brianI18n } from '@freesewing/brian'

// Parts
import { back } from './back.mjs'
import { front } from './front.mjs'
import { yoke } from './yoke.mjs'

// Create new design
const Genie = new Design({
  data,
  parts: [back, front, yoke, sleeve],
})

// Named exports
export { back, front, yoke, sleeve, i18n, Genie }
