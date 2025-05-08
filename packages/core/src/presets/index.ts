import type { MiniUnoCssRule } from '../types'
import { directionMap, escape } from '../utils'

export const defaultRules: MiniUnoCssRule[] = [
  [/^p-(\d+)([a-z]*)$/, ([f, s, unit]) => `.${escape(f)} { padding: ${unit ? s + unit : `${(+s) / 4}rem`}; }`],
  [/^p([trlb])-(\d+)([a-z]*)$/, ([f, d, s, unit]) => `.${escape(f)} { padding${directionMap[d] || ''}: ${unit ? s + unit : `${(+s) / 4}rem`}; }`],
]


