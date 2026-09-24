import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { CSG } from 'three-csg-ts';
// import { Water } from 'three/addons/objects/Water.js';

let scene;
let renderer;
let camera;
let controls;
let clock;
var rubiksCube;
var pivot;
const STICKER_THIKNESS = 0.04;
const STICKER_SIZE = 0.9;
const COLORS = {
    RIGHT:  0xff0000, // red
    LEFT:   0xff8800, // orange
    TOP:    0xffffff, // white
    BOTTOM: 0xffff00, // yellow 
    FRONT:  0x00ff00, // green
    BACK:   0x0000ff  // blue
};
const TURN_SPEED = 1;

async function start() {
    // SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);

    // RENDER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // CAMERA
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(5, 5, 5);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);

    // CONTROLS
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    clock = new THREE.Clock();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const myAmbientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(myAmbientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.08);
    sunLight.position.set(-100, 1000, -200);
    sunLight.castShadow = true;
    scene.add(sunLight);

    function createCube() { // Create a 1 radius cube
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshStandardMaterial( {color: 0x000000, metalness: 0, roughness: 1} );
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        return cube;
    }

    function createrubiksCube() {
        rubiksCube = new THREE.Group();
        pivot = new THREE.Group();
        scene.add(pivot);
        for (var x = -1; x <= 1; x++) 
        for (var y = -1; y <= 1; y++)
        for (var z = -1; z <= 1; z++)
        {
            if (x == 0 && y == 0 && z == 0) continue; // skip centre
            const cube = createCube();
            createSticker(cube, new THREE.Vector3(x, y, z));
            
            if (x != 0) createSticker(cube, x, 0, 0);
            if (y != 0) createSticker(cube, 0, y, 0);
            if (z != 0) createSticker(cube, 0, 0, z);
            cube.position.set(x, y, z);
            rubiksCube.add(cube);
        }
        scene.add(rubiksCube)
    }

    function createSticker(cube, x, y, z) {
        const stickerMaterial = new THREE.MeshStandardMaterial( {color: getStickerColor(x, y, z), metalness: 0, roughness: 1}  );
        const stickerGeometry = new THREE.BoxGeometry(STICKER_THIKNESS, STICKER_SIZE, STICKER_SIZE);
        const sticker = new THREE.Mesh(stickerGeometry, stickerMaterial);
        sticker.rotation.set(x * Math.PI / 2, z * Math.PI / 2, y * Math.PI / 2);
        sticker.position.set(x * (1 + STICKER_THIKNESS) / 2, 
            y * (1 + STICKER_THIKNESS) / 2, 
            z * (1 + STICKER_THIKNESS) / 2);
        cube.add(sticker);
    }

    function getStickerColor(x, y, z) {
        if (x === 1)  return COLORS.RIGHT;
        if (x === -1) return COLORS.LEFT;

        if (y === 1)  return COLORS.TOP;
        if (y === -1) return COLORS.BOTTOM;

        if (z === 1)  return COLORS.FRONT;
        if (z === -1) return COLORS.BACK;
    }

    function startTurn(turnAxis, clockwise) {
        var turnList = [];
        rubiksCube.children.slice().forEach(cube => {
            var isAlignedWithAxis = turnAxis.dot(cube.position) > 0.9;
            if (isAlignedWithAxis) pivot.add(cube);
        });

        const rotation = clockwise ? -Math.PI/2 : Math.PI/2; // PI rotation are counter-clockwise
        pivot.setRotationFromAxisAngle(turnAxis, rotation);
        while (pivot.children.length > 0) {
            rubiksCube.attach(pivot.children[0]);
        }
    }

    function updateTurn() {
        

    }

    createrubiksCube();
    startTurn(new THREE.Vector3(1, 0, 0), true);
    startTurn(new THREE.Vector3(0, 1, 0), true);
    startTurn(new THREE.Vector3(1, 0, 0), false);
    startTurn(new THREE.Vector3(0, 1, 0), false);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();



        renderer.render(scene, camera);
    }

    animate();
}

start();