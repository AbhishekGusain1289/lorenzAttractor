import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { GUI } from 'lil-gui'


// GUI
const gui = new GUI()

const options = {
    range: 1
}

let lines = []

// Lorentz Attractor
function lorentzAttractor(initialConditions, sigma, rho, beta, dt, iterations) {
    // Destructure the initial conditions array
    let [x, y, z] = initialConditions;

    // Function to compute the next point
    function computeLorentz(x, y, z, dt) {
        const dx = sigma * (y - x);
        const dy = x * (rho - z) - y;
        const dz = x * y - beta * z;

        x += dx * dt;
        y += dy * dt;
        z += dz * dt;

        return [x, y, z]; // Return as array
    }

    // Array to store the points
    const points = [];

    // Loop to update points
    for (let i = 0; i < iterations; i++) {
        const point = computeLorentz(x, y, z, dt);
        x = point[0];
        y = point[1];
        z = point[2];
        points.push(point); // Push array
    }

    return points;
}
function normalizePoints(points, upperLimit) {
    // Initialize min and max values
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    // Find min and max for each coordinate
    points.forEach(point => {
        const [x, y, z] = point;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (z < minZ) minZ = z;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        if (z > maxZ) maxZ = z;
    });

    // Normalize points
    const normalizedPoints = points.map(point => {
        const [x, y, z] = point;
        const normX = ((x - minX) / (maxX - minX)) * upperLimit;
        const normY = ((y - minY) / (maxY - minY)) * upperLimit;
        const normZ = ((z - minZ) / (maxZ - minZ)) * upperLimit;
        return [normX, normY, normZ];
    });

    return normalizedPoints;
}





// Base Scene
const scene = new THREE.Scene()

// GUI


// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Canvas
const canvas = document.querySelector('.webgl')


// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.set(23, 0, 23)
scene.add(camera)



// Controls
const controls = new OrbitControls(camera, canvas)
controls.enabled = true
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    preserveDrawingBuffer: true,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)

// Resizing
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    
    renderer.setSize(sizes.width, sizes.height)
    // renderer.setPixelRatio(Math.max(window.devicePixelRatio, 2))
    renderer.render(scene, camera)
})


// Points

const createPoints = (lorentzPoints, color, lineIndex) => {

    // const pointsGeometry = new THREE.BufferGeometry()
    
    // const positions = new Float32Array(lorentzPoints.flat())
    
    
    // const positionAttribute = new THREE.BufferAttribute(positions, 3)
    
    // pointsGeometry.setAttribute('position', positionAttribute)
    
    // const pointsMaterial = new THREE.PointsMaterial({
    //     size: 0.01,
    //     color: color
    // })
    
    
    
    // const particles = new THREE.Points(pointsGeometry, pointsMaterial)
    // particles.position.y = -25
    // particles.rotation.x = 4.71238898038469
    // // scene.add(particles)


    const newPoints = []
    
    for(let i = 0; i < lorentzPoints.length; i++)
    {
        newPoints.push(new THREE.Vector3(lorentzPoints[i][0], lorentzPoints[i][1], lorentzPoints[i][2]))
    }
    // console.log(newPoints)

    const lineMaterial = new THREE.LineBasicMaterial({
        color: color
    });


    
    // console.log(positions)
    if (lines[lineIndex]) {
        // Dispose of the existing geometry
        lines[lineIndex].geometry.dispose();
        // Remove the existing line from the scene
        scene.remove(lines[lineIndex]);
    }


    const geometry = new THREE.BufferGeometry().setFromPoints( newPoints )
    geometry.setDrawRange(0, options.range);
    

    const line = new THREE.Line( geometry, lineMaterial );
    line.position.y = -25
    line.rotation.x = 4.71238898038469
    scene.add(line);

    lines[lineIndex] = line
}

// Example usage:
const config = (initialConditions, color, line) => {

    
    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;
    const dt = 0.001;
    const iterations = 30000;
    const lorentzPoints = lorentzAttractor(initialConditions, sigma, rho, beta, dt, iterations);
    createPoints(lorentzPoints, color, line)
}

const createCurve = () => {
    config([2, 4, 7], 'yellow', 1)
    config([1, 1, 1], 'green',2)
    config([1, 3, 4], 'teal',3)
    config([6, 0, 1], 'cyan',4)
    // config([4, 3, 1], 'lightblue',5)
    config([4, 3, 1], 'blue',5)
}


// gui.add(options, 'range').min(1).max(30000).step(1).onChange(() => {createCurve()})


window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if (!fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen()
        }
        else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen()
        }
    }
    else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        }
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        }
    }
})





// Axes Helper
// const axesHelper = new THREE.AxesHelper(5)
// scene.add(axesHelper)

// Time
let time = new THREE.Clock()
let elapsedTime = 0

window.addEventListener('keypress', (event) => {

    if(event.key == 'm'){

        // Ensure the scene is rendered before capturing
        const width = 3840;
        const height = 2160;

        renderer.setSize(width, height);
        renderer.render(scene, camera);
        
        // Capture the image data
        const dataURL = renderer.domElement.toDataURL('image/png');
        
        // Create an anchor element and set its href attribute to the data URL
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'rendered_image.png';
        
        // Programmatically click the anchor to trigger the download
        link.click();
    }

    else if(event.key == 'q'){
        const width = 3840;
        const height = 2160;
        // const width = 7680;
        // const height = 4320;
        renderer.setSize(width, height);
    }

    else if(event.key == ' '){
        time = new THREE.Clock()
        elapsedTime = 0
    }
})

const tick = () => {
    elapsedTime = time.getElapsedTime()

    
    // camera.position.x = Math.sin(elapsedTime * 0.5) * 40
    // camera.position.z = Math.cos(elapsedTime * 0.5) * 40

    // camera.lookAt(new THREE.Vector3(0, 0, 0))

    options.range = elapsedTime * 500
    createCurve()

    // console.log(options.range)

    // Controls Update
    controls.update()


    // Renderer Update
    renderer.render(scene, camera)


    // Next frame request
    requestAnimationFrame(tick)
}

tick()