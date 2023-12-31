import auto from '@sveltejs/adapter-auto'
import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		scss: {
			prependData: '@use "src/variables.scss" as *;'
		}
	}),
	kit: {
		adapter: auto()
	}
}

export default config
