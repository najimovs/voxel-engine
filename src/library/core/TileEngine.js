class TileEngine {

	constructor( mapSize = 16, tileSize = 4 ) {

		this.mapSize = mapSize // Total size of the map
		this.tileSize = tileSize // Size of each tile
		this.totalTiles = mapSize / tileSize // Number of tiles per row/column

		if ( !Number.isInteger( this.totalTiles ) ) {

			throw new Error( "mapSize must be divisible by tileSize." )
		}
	}

	/**
	 * Converts (x, z) world coordinates to (u, v) tile indices.
	 * @param {number} x - X coordinate in world space
	 * @param {number} z - Z coordinate in world space
	 * @returns {[number, number]} - Tile indices (u, v)
	 */
	pointToTile( x, z ) {

		const u = Math.floor( ( x + this.mapSize / 2 ) / this.tileSize )
		const v = Math.floor( ( - z + this.mapSize / 2 ) / this.tileSize ) // Z is inverted

		return [ u, v ]
	}

	/**
	 * Converts (u, v) tile indices to the center point (x, z) in world coordinates.
	 * @param {number} u - Tile index along the u-axis
	 * @param {number} v - Tile index along the v-axis
	 * @returns {[number, number]} - Center coordinates (x, z) of the tile
	 */
	tileToPoint( u, v ) {

		const x = u * this.tileSize - this.mapSize / 2 + this.tileSize / 2
		const z = - ( v * this.tileSize - this.mapSize / 2 + this.tileSize / 2 ) // Z is inverted

		return [ x, z ]
	}

	/**
	 * Converts (u, v) tile indices to tile hash.
	 * @param {number} u - Tile index along the u-axis
	 * @param {number} v - Tile index along the v-axis
	 * @returns {string} - Tile hash
	 */
	tileToKey( u, v ) {

		return `${ u }_${ v }`
	}

	/**
	 * Clamps (u, v) tile indices to be within the valid range of [0, totalTiles - 1].
	 * @param {number} u - Tile index along the u-axis
	 * @param {number} v - Tile index along the v-axis
	 * @returns {[number, number]} - Clamped (u, v) indices
	 */
	clamp( u, v ) {

		const clampedU = Math.min( Math.max( u, 0 ), this.totalTiles - 1 )
		const clampedV = Math.min( Math.max( v, 0 ), this.totalTiles - 1 )

		return [ clampedU, clampedV ]
	}

	/**
	 * Calculates the bounding box of a tile given its indices.
	 * The bounding box is represented as [minX, minZ, maxX, maxZ].
	 * Note: minZ is larger than maxZ in Y-up.
	 * @param {number} u - Tile index along the u-axis
	 * @param {number} v - Tile index along the v-axis
	 * @returns {[number, number, number, number]} - Bounding box [minX, minZ, maxX, maxZ]
	 */
	tileToBBox( u, v ) {

		// Top-left corner of the tile (minX, minZ)
		const minX = u * this.tileSize - this.mapSize / 2
		const minZ = - ( v * this.tileSize - this.mapSize / 2 ) // Larger Z value

		// Bottom-right corner of the tile (maxX, maxZ)
		const maxX = minX + this.tileSize
		const maxZ = minZ - this.tileSize // Smaller Z value

		return [ minX, minZ, maxX, maxZ ]
	}

	// Get the grid of tiles within the map size
	getTileGrid() {

		const numTiles = this.mapSize / this.tileSize // Number of tiles in each dimension
		const tiles = []

		// Loop through each tile position and calculate the UV coordinates
		for ( let u = 0; u < numTiles; u++ ) {

			for ( let v = 0; v < numTiles; v++ ) {

				tiles.push( [ u, v ] )
			}
		}

		return tiles
	}
}

export { TileEngine }
