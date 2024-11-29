import * as THREE from "three"

const textureLoader = new THREE.TextureLoader()

export function buildGrid( tileEngine ) {

	const grid = tileEngine.getTileGrid()
	const size = grid.length

	//

	const texture = textureLoader.load( "/tile.png" )
	texture.colorSpace = THREE.SRGBColorSpace
	texture.minFilter = THREE.NearestFilter
	texture.magFilter = THREE.NearestFilter

	const grid3D = new THREE.Object3D()

	const material = new THREE.MeshBasicMaterial( {
		transparent: true,
		alphaMap: texture,
		alphaTest: 0.5,
		color: 0x404040,
	} )

	const TILE_SIZE = tileEngine.tileSize

	const vertices = [
		- TILE_SIZE / 2, 0, + TILE_SIZE / 2,
		+ TILE_SIZE / 2, 0, + TILE_SIZE / 2,
		+ TILE_SIZE / 2, 0, - TILE_SIZE / 2,
		- TILE_SIZE / 2, 0, - TILE_SIZE / 2,
		- TILE_SIZE / 2, 0, + TILE_SIZE / 2, // Loop
	]

	const matrix4 = new THREE.Matrix4()

	const geometry = new THREE.BufferGeometry()
	geometry.setIndex( [ 0, 1, 2, 2, 3, 0 ] )
	geometry.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) )
	geometry.setAttribute( "uv", new THREE.Float32BufferAttribute( [ 0, 0, 1, 0, 1, 1, 0, 1 ], 2 ) )

	const mesh = new THREE.InstancedMesh( geometry, material, size )
	grid3D.add( mesh )

	for ( let i = 0; i < size; i++ ) {

		const tile = grid[ i ]

		const [ x, z ] = tileEngine.tileToPoint( ...tile )

		matrix4.makeTranslation( x, 0, z )

		mesh.setMatrixAt( i, matrix4 )
	}

	return grid3D
}
