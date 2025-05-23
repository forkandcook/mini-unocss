import { objToCss } from '..'
import type { MiniUnoCssConfig } from '../types'

export function createGenerator(config: MiniUnoCssConfig) {
	// 用来缓存生成的类名
	const cache = new Map<string, string | null>()

	return (code: string) => {
		const tokens = new Set(code.split(/[\s'"`;]/g))

		const css: string[] = []

		for (const token of tokens) {
			// 如果已经缓存过了，就直接使用缓存
			if (cache.has(token)) {
				const cached = cache.get(token)
				if (cached) {
					css.push(cached)
				}
				// 剩下的 token 就用下面 👇 的规则来处理
				tokens.delete(token)
			}
		}

		for (const [matcher, handler] of config.rules) {
			for (const token of tokens) {
				const match = token.match(matcher)
				if (match) {
					let result = handler(Array.from(match))
					if (!result) return

					if (Array.isArray(result)) result = result[0] + objToCss(result[1])

					css.push(result)
					cache.set(token, result)
					tokens.delete(token)
				}
			}
		}

		// 处理最后剩下的 token
		for (const token of tokens) {
			cache.set(token, null)
		}

		return css.join('\n')
	}
}
