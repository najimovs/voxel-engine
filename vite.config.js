import { defineConfig } from "vite"
import path from "node:path"

export default defineConfig( {
	server: {
		host: true,
	},
	optimizeDeps: {
		esbuildOptions: {
			target: "esnext",
		}
	},
	build: {
		target: "esnext",
	},
	resolve: {
		alias: {
			"@lib": path.resolve( __dirname, "./src/library" ),
			"@app": path.resolve( __dirname, "./src/app" ),
		},
	},
} )
