import { createHash } from 'node:crypto'
import type { MiniUnoCssConfig } from '@mini-unocss/core'
import { createGenerator, defaultRules } from '@mini-unocss/core'
import type { Plugin, ViteDevServer } from 'vite'

function getHash(input: string, length = 8) {
	return createHash('sha256').update(input).digest('hex').substr(0, length)
}

const VIRTUAL_PREFIX = '/@virtual/miniunocss/'

export default function MiniUnoCssVitePlugin(
	config: MiniUnoCssConfig = { rules: defaultRules },
): Plugin {
	const generate = createGenerator(config)
	const map = new Map<string, [string, string]>()
	let server: ViteDevServer | undefined

	const invalidate = (hash: string) => {
		if (!server) return
		const id = `${VIRTUAL_PREFIX}${hash}.css`
		// resolveId 主要用于首次解析模块标识符，建立模块ID与实际路径的映射
		// Vite 会缓存这些解析结果在其模块图 (module graph) 中
		const mod = server.moduleGraph.getModuleById(id)
		if (!mod) return
		// 通过 invalidateModule 方法使模块失效
		// 告诉 vite 这个模块已经过期
		// 就会触发 load 方法重新加载这个模块
		server.moduleGraph.invalidateModule(mod)
		// 通知浏览器获取更新
		server.ws.send({
			type: 'update',
			updates: [
				{
					acceptedPath: id,
					path: id,
					timestamp: +Date.now(),
					type: 'js-update',
				},
			],
		})
	}

	return {
		name: 'vite-plugin-miniwind',
		enforce: 'post',
		configureServer(_server) {
			server = _server
		},
		transform(code, id) {
			if (!id.endsWith('vue')) return null

			const style = generate(code)

			if (!style) return null

			// id 是当前处理的文件的路径
			const hash = getHash(id)
			map.set(hash, [id, style])
			// 手动让 vite 失效这个模块
			// 因为在文件发生变化的时候，先会跳过 resolveId
			// 直接调用 load 方法
			// 然后 vite 会根据 id 去查找模块
			invalidate(hash)

			return `import "${VIRTUAL_PREFIX}${hash}.css";${code}`
		},
		resolveId(id) {
			// 告诉 vite 由 vite-plugin-miniwind 处理这个 id
			// 如果不写的话就会由 vite 的默认处理器处理，导致找不到这个虚拟模块，然后报错
			// 返回的 id 进一步传递给 load 方法
			return id.startsWith(VIRTUAL_PREFIX) ? id : null
		},
		load(id) {
			// 不是由这个插件处理的 id，就不处理
			if (!id.startsWith(VIRTUAL_PREFIX)) return null

			// 通过 id 获取 hash
			const hash = id.slice(VIRTUAL_PREFIX.length, -'.css'.length)

			// source 就是 transform 方法中传入的 id
			const [source, css] = map.get(hash) || []
			const watchedFiles = this.getWatchFiles()

			if (source) {
				// 修改 source，触发重建
				// 源文件变更 → transform处理新内容 → 更新 map 中的CSS →
				// invalidate使模块失效 → (跳过resolveId) → load 重新加载内容 → 浏览器更新
				if (source && !watchedFiles.includes(source)) {
					this.addWatchFile(source)
				}
			}

			// 因为 id 是以 .css 结尾的，这里 vite 会帮我们处理成一个 css 模块
			// 并注入到页面中
			return `/* ${source} */\n${css}`
		},
	}
}
