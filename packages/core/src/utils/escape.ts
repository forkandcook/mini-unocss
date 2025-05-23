// https://drafts.csswg.org/cssom/#serialize-an-identifier
// https://github.com/mathiasbynens/CSS.escape
// 遵循 CSS OM 规范中的 "序列化标识符" 规则，
// 将字符串中的特殊字符转义，使其能安全地用作CSS选择器中的标识符（如类名、ID等）
// 或自定义属性名使用，避免因为字符串包含特殊字符而导致的 CSS 引擎解析错误或安全问题。

export function cssEscape(str: string): string {
	const length = str.length
	let index = -1
	let codeUnit: number
	let result = ''
	const firstCodeUnit = str.charCodeAt(0)
	while (++index < length) {
		codeUnit = str.charCodeAt(index)
		// Note: there’s no need to special-case astral symbols, surrogate
		// pairs, or lone surrogates.

		// If the character is NULL (U+0000), then the REPLACEMENT CHARACTER
		// (U+FFFD).
		if (codeUnit === 0x0000) {
			result += '\uFFFD'
			continue
		}

		// Comma
		if (codeUnit === 44) {
			result += '\\2c '
			continue
		}

		if (
			// If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
			// U+007F, […]
			(codeUnit >= 0x0001 && codeUnit <= 0x001f) ||
			codeUnit === 0x007f ||
			// If the character is the first character and is in the range [0-9]
			// (U+0030 to U+0039), […]
			(index === 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
			// If the character is the second character and is in the range [0-9]
			// (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
			(index === 1 &&
				codeUnit >= 0x0030 &&
				codeUnit <= 0x0039 &&
				firstCodeUnit === 0x002d)
		) {
			// https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
			result += `\\${codeUnit.toString(16)} `
			continue
		}

		if (
			// If the character is the first character and is a `-` (U+002D), and
			// there is no second character, […]
			index === 0 &&
			length === 1 &&
			codeUnit === 0x002d
		) {
			result += `\\${str.charAt(index)}`
			continue
		}

		// If the character is not handled by one of the above rules and is
		// greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
		// is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
		// U+005A), or [a-z] (U+0061 to U+007A), […]
		if (
			codeUnit >= 0x0080 ||
			codeUnit === 0x002d ||
			codeUnit === 0x005f ||
			(codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
			(codeUnit >= 0x0041 && codeUnit <= 0x005a) ||
			(codeUnit >= 0x0061 && codeUnit <= 0x007a)
		) {
			// the character itself
			result += str.charAt(index)
			continue
		}

		// Otherwise, the escaped character.
		// https://drafts.csswg.org/cssom/#escape-a-character
		result += `\\${str.charAt(index)}`
	}
	return result
}
