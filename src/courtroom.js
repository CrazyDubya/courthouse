import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Floor
const floor = new THREE.Mesh(
  new THREE.BoxGeometry(20, 0.5, 20),
  new THREE.MeshPhongMaterial({ color: 0x8b4513 })
);
floor.position.y = -0.25;
scene.add(floor);

// Judge bench
const bench = new THREE.Mesh(
  new THREE.BoxGeometry(6, 2, 2),
  new THREE.MeshPhongMaterial({ color: 0x654321 })
);
bench.position.set(0, 1, -6);
scene.add(bench);

// Defense table
const defenseTable = new THREE.Mesh(
  new THREE.BoxGeometry(4, 1, 2),
  new THREE.MeshPhongMaterial({ color: 0xb5651d })
);
defenseTable.position.set(-3, 0.5, -1);
scene.add(defenseTable);

// Prosecution table
const prosecutionTable = defenseTable.clone();
prosecutionTable.position.set(3, 0.5, -1);
scene.add(prosecutionTable);

// Jury box
const juryBox = new THREE.Mesh(
  new THREE.BoxGeometry(6, 2, 2),
  new THREE.MeshPhongMaterial({ color: 0x705438 })
);
juryBox.position.set(8, 1, -4);
scene.add(juryBox);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 10, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
