import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('courtroom'),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

// lighting
const light = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(light);

// floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshPhongMaterial({ color: 0x8b4513 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// judge bench
const bench = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2, 1),
  new THREE.MeshPhongMaterial({ color: 0x654321 })
);
bench.position.set(0, 1, -5);
scene.add(bench);

// witness stand
const witness = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 1.5, 1),
  new THREE.MeshPhongMaterial({ color: 0x8b4513 })
);
witness.position.set(3, 0.75, -2);
scene.add(witness);

function createTable(x) {
  const table = new THREE.Mesh(
    new THREE.BoxGeometry(3, 1, 1.5),
    new THREE.MeshPhongMaterial({ color: 0xa0522d })
  );
  table.position.set(x, 0.5, 0);
  return table;
}

scene.add(createTable(-3)); // defense
scene.add(createTable(3)); // prosecution

camera.position.set(0, 5, 10);
camera.lookAt(0, 0, -5);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
