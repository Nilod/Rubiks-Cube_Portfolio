import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { CSG } from 'three-csg-ts';
// import { Water } from 'three/addons/objects/Water.js';

const button = document.querySelector("#hud #button");
const formulaInput = document.querySelector("#hud #formulaInput");
const playFormulaButton = document.querySelector("#hud #playButton");
const speedInput = document.querySelector("#speedInput");
const speedRange = document.querySelector("#speedRange");

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
var turnSpeed = 1;
const MOVES = {
    "R": {
        axis: new THREE.Vector3(1, 0, 0),
        rotation: -Math.PI / 2
    },
    "R'": {
        axis: new THREE.Vector3(1, 0, 0),
        rotation: Math.PI / 2
    },

    "L": {
        axis: new THREE.Vector3(-1, 0, 0),
        rotation: -Math.PI / 2
    },
    "L'": {
        axis: new THREE.Vector3(-1, 0, 0),
        rotation: Math.PI / 2
    },

    "U": {
        axis: new THREE.Vector3(0, 1, 0),
        rotation: -Math.PI / 2
    },
    "U'": {
        axis: new THREE.Vector3(0, 1, 0),
        rotation: Math.PI / 2
    },

    "D": {
        axis: new THREE.Vector3(0, -1, 0),
        rotation: -Math.PI / 2
    },
    "D'": {
        axis: new THREE.Vector3(0, -1, 0),
        rotation: Math.PI / 2
    },

    "F": {
        axis: new THREE.Vector3(0, 0, 1),
        rotation: -Math.PI / 2
    },
    "F'": {
        axis: new THREE.Vector3(0, 0, 1),
        rotation: Math.PI / 2
    },

    "B": {
        axis: new THREE.Vector3(0, 0, -1),
        rotation: -Math.PI / 2
    },
    "B'": {
        axis: new THREE.Vector3(0, 0, -1),
        rotation: Math.PI / 2
    }
};

// EVENTS
speedInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        speedRange.value = speedInput.value;
        turnSpeed = speedInput.value;
    }
});

speedRange.addEventListener("input", () => {
    speedInput.value = speedRange.value;
    turnSpeed = speedRange.value;
});

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

    const myAmbientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(myAmbientLight);

    // const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    // sunLight.position.set(-100, 1000, -200);
    // sunLight.castShadow = true;
    // scene.add(sunLight);

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

    function startTurn(move) {
        pivot.rotation.set(0, 0, 0);
        rubiksCube.children.slice().forEach(cube => {
            var isAlignedWithAxis = move.axis.dot(cube.position) > 0.9;
            if (isAlignedWithAxis) pivot.add(cube);
        });
    }

    function updateTurn(move, currentRotation, delta, isTurning) {
        const direction = Math.sign(move.rotation);
        var appliedRotation = Math.min( Math.abs(move.rotation) * turnSpeed * delta,
                                     Math.abs(move.rotation - currentRotation));
        currentRotation += appliedRotation * direction;
        pivot.setRotationFromAxisAngle(move.axis, currentRotation);
        
        
        if ( Math.abs(currentRotation) >=  Math.abs(move.rotation)) {
            while (pivot.children.length > 0) {
                rubiksCube.attach(pivot.children[0]);
            }
            isTurning = false;
            currentRotation = 0
        }
        return [currentRotation, isTurning];
    }

    function notationToMove(notation) {
        if (!(notation in MOVES)) {
            throw new Error(`Notation inconnue : ${notation}`);
        }

        return MOVES[notation];
    }

    function formulaToMoves(formula) {
        const notations = formula.trim().split(/\s+/);
        const moves = notations.map(notation => notationToMove(notation));
        return moves;
    }

    createrubiksCube();

    function startAnimate() {
        var isTurning = false;
        var currentMove;
        var currentRotation = 0;
        var moveQueue = [notationToMove("R"), 
            notationToMove("U"),
            notationToMove("R'"), 
            notationToMove("U'")];

        button.addEventListener("click", () => {
            moveQueue.push(notationToMove('R'));
        });
        playFormulaButton.addEventListener("click", () => {
            const formula = formulaInput.value;
            var moves = formulaToMoves(formula);
            moveQueue.push(...moves)
        });

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            controls.update();

            if (isTurning) {
                [currentRotation, isTurning] = updateTurn(currentMove, currentRotation, delta, isTurning);
            }
            else if (moveQueue.length !== 0) {
                currentMove = moveQueue[0];
                isTurning = true;
                startTurn(currentMove);
                moveQueue.shift(); // remove first element
            }

            renderer.render(scene, camera);
        }

        animate();
    }

    startAnimate();
}

start();