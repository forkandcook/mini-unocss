// export type MiniwindCssObject = Record<string, string | undefined>
// export type MiniwindCssRule = [string, MiniwindCssObject]
export type MiniUnoCssRule = [RegExp, (match: string[]) => string | undefined]

export interface MiniUnoCssConfig {
	rules: MiniUnoCssRule[]
}
