import * as THREE from 'three'
import GUI from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new GUI()

const parameters = {
    materialColor: '#ffeded'
}


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')
const particleTexture = textureLoader.load('/textures/particles/4.png')
gradientTexture.magFilter = THREE.NearestFilter


/**
 * Mesh
 */
const objectDistance = 4

const material =  new THREE.MeshToonMaterial()
material.color = new THREE.Color(parameters.materialColor)
material.gradientMap = gradientTexture

gui
    .addColor(parameters, 'materialColor')
    .onChange( () =>{
        material.color.set(parameters.materialColor)
        particleMaterial.color.set( parameters.materialColor)
    } )
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
)

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2 ,32),
    material
)

const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.32, 100, 16),
    material
)

mesh1.position.y = - objectDistance * 0
mesh2.position.y = - objectDistance * 1
mesh3.position.y = - objectDistance * 2

mesh1.position.x = 2
mesh2.position.x = - 2
mesh3.position.x = 2


scene.add(mesh1, mesh2, mesh3)
const sectionMeshes = [mesh1, mesh2, mesh3]

// particles
const count = 500
const particlesGeometry = new THREE.BufferGeometry()
const position  = new Float32Array(count * 3 )

for (let i = 0 ; i < count * 3; i++){

    const i3 = i * 3
    position[i3] = (Math.random() - 0.5 ) * 10
    position[i3 + 1] = (Math.random() - 0.5 ) * objectDistance * sectionMeshes.length * 1.8
    position[i3 + 2 ] = (Math.random() - 0.5 ) * 10
    
}

particlesGeometry.setAttribute( 'position', new THREE.BufferAttribute( position,  3))
const particleMaterial = new THREE.PointsMaterial()
particleMaterial.map = particleTexture
particleMaterial.size = 0.1
particleMaterial.sizeAttenuation = true
particleMaterial.color = new THREE.Color(parameters.materialColor)
particleMaterial.depthWrite = false
particleMaterial.blending = THREE.AdditiveBlending
const particle = new THREE.Points( particlesGeometry, particleMaterial)

scene.add(particle)

// light

// const ambientLight = new THREE.AmbientLight()
// scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


/**
 * Camera
 */

// camera group

const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * scroll
 */

let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', ()=> {

    scrollY = window.scrollY
    const newSection = Math.round( scrollY / sizes.height )
    if ( currentSection !==  newSection){
        currentSection = newSection

        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration: 1.5,
                ease: 'power1.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5',

            }

        )
    }
})

let cursor = {
    x:0,
    y:0
}

window.addEventListener('mousemove', event => {
    cursor.x = (event.clientX / sizes.width) - 0.5
    cursor.y = ((event.clientY / sizes.height) - 0.5) * -1

})


/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // animate camera

    const paralaxX = cursor.x
    const paralaxY = cursor.y

    cameraGroup.position.x += ( paralaxX - cameraGroup.position.x ) * deltaTime
    cameraGroup.position.y +=  ( paralaxY - cameraGroup.position.y ) * deltaTime

    camera.position.y = - scrollY / sizes.height * objectDistance

    for (const mesh of sectionMeshes){
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()