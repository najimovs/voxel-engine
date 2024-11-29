import * as THREE from "three"
import { MapControls } from "three/addons/controls/MapControls"
import Stats from "three/addons/libs/stats.module.js"

export function setupScene( { canvas } ) {

	const scene = new THREE.Scene()
	scene.fog = new THREE.Fog( 0x000000, 1, 1_024 )
	const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1_024 )
	camera.position.set( 0, 32, 0 )
	camera.lookAt( 0, 0, 0 )
	const controls = new MapControls( camera, canvas )
	controls.enableDamping = true
	controls.zoomToCursor = true
	controls.minDistance = 32
	controls.maxDistance = 512
	controls.maxTargetRadius = 512
	controls.maxPolarAngle = Math.PI / 2 - 0.25
	const renderer = new THREE.WebGLRenderer( { canvas } )
	renderer.shadowMap.enabled = true
	renderer.setPixelRatio( window.devicePixelRatio )
	renderer.setSize( window.innerWidth, window.innerHeight )

	// FPS MONITOR

	const stats = new Stats()
	document.body.insertBefore( stats.dom, document.body.firstElementChild )

	// LIGHTS

	const dirLight = new THREE.DirectionalLight()
	dirLight.position.set( - 128, 128, - 128 )
	dirLight.castShadow = true
	dirLight.shadow.camera.top = 512
	dirLight.shadow.camera.bottom = - 512
	dirLight.shadow.camera.left = - 512
	dirLight.shadow.camera.right = 512
	dirLight.shadow.camera.near = 1
	dirLight.shadow.camera.far = 512
	dirLight.shadow.mapSize.width = 8_192
	dirLight.shadow.mapSize.height = 8_192
	scene.add( dirLight )

	// scene.add( new THREE.DirectionalLightHelper( dirLight ) )

	const hemiLight = new THREE.HemisphereLight()
	hemiLight.position.set( 0, 512, 0 )
	scene.add( hemiLight )

	// ON RESIZE

	window.addEventListener( "resize", () => {

		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
		renderer.setSize( window.innerWidth, window.innerHeight )
	} )

	// RENDER

	renderer.setAnimationLoop( () => {

		controls.update()
		renderer.render( scene, camera )
		stats.update()
	} )

	//

	return {
		canvas,
		scene,
		camera,
		controls,
		renderer,
	}
}
