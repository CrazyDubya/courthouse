import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export class CourtroomScene {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new THREE.Clock();
        
        // Scene objects
        this.courtroom = null;
        this.characters = new Map();
        this.evidence = new Map();
        this.lights = [];
        
        // Camera views
        this.cameraViews = {
            judge: { position: new THREE.Vector3(0, 8, 15), target: new THREE.Vector3(0, 0, 0) },
            jury: { position: new THREE.Vector3(-15, 6, 0), target: new THREE.Vector3(0, 0, 0) },
            counsel: { position: new THREE.Vector3(0, 2, -15), target: new THREE.Vector3(0, 0, 0) },
            witness: { position: new THREE.Vector3(15, 4, 0), target: new THREE.Vector3(0, 0, 0) },
            overview: { position: new THREE.Vector3(0, 12, 20), target: new THREE.Vector3(0, 0, 0) }
        };
        
        // Current camera view
        this.currentView = 'overview';
        
        // Animation mixers
        this.mixers = [];
        
        // Loaders
        this.gltfLoader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        this.gltfLoader.setDRACOLoader(this.dracoLoader);
    }
    
    async init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createControls();
        this.createLights();
        this.createCourtroom();
        this.createCharacters();
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);
        this.scene.fog = new THREE.Fog(0xf0f0f0, 50, 200);
    }
    
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Set initial camera position
        const view = this.cameraViews.overview;
        this.camera.position.copy(view.position);
        this.camera.lookAt(view.target);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Add to DOM
        const container = document.getElementById('canvas-container');
        container.appendChild(this.renderer.domElement);
    }
    
    createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI / 2;
    }
    
    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // Main directional light (sunlight through windows)
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(10, 20, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -25;
        mainLight.shadow.camera.right = 25;
        mainLight.shadow.camera.top = 25;
        mainLight.shadow.camera.bottom = -25;
        this.scene.add(mainLight);
        this.lights.push(mainLight);
        
        // Fill lights
        const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight1.position.set(-10, 15, -10);
        this.scene.add(fillLight1);
        this.lights.push(fillLight1);
        
        const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight2.position.set(10, 15, -10);
        this.scene.add(fillLight2);
        this.lights.push(fillLight2);
        
        // Point lights for dramatic effect
        const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 30);
        pointLight1.position.set(0, 8, 0);
        this.scene.add(pointLight1);
        this.lights.push(pointLight1);
    }
    
    createCourtroom() {
        // Create courtroom geometry
        this.createFloor();
        this.createWalls();
        this.createCeiling();
        this.createJudgeBench();
        this.createJuryBox();
        this.createCounselTables();
        this.createWitnessStand();
        this.createGallery();
        this.createDoors();
        this.createWindows();
        this.createFurniture();
    }
    
    createFloor() {
        const floorGeometry = new THREE.PlaneGeometry(40, 30);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x8B4513,
            map: this.createWoodTexture()
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
    }
    
    createWalls() {
        const wallMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xF5F5DC,
            map: this.createWallTexture()
        });
        
        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 12),
            wallMaterial
        );
        backWall.position.set(0, 6, -15);
        backWall.receiveShadow = true;
        this.scene.add(backWall);
        
        // Side walls
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 12),
            wallMaterial
        );
        leftWall.position.set(-20, 6, 0);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);
        
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 12),
            wallMaterial
        );
        rightWall.position.set(20, 6, 0);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);
    }
    
    createCeiling() {
        const ceilingGeometry = new THREE.PlaneGeometry(40, 30);
        const ceilingMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFFFFF,
            map: this.createCeilingTexture()
        });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.set(0, 12, 0);
        ceiling.rotation.x = Math.PI / 2;
        this.scene.add(ceiling);
    }
    
    createJudgeBench() {
        const benchGroup = new THREE.Group();
        
        // Main bench
        const benchGeometry = new THREE.BoxGeometry(8, 1, 3);
        const benchMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const bench = new THREE.Mesh(benchGeometry, benchMaterial);
        bench.position.set(0, 3, -10);
        bench.castShadow = true;
        bench.receiveShadow = true;
        benchGroup.add(bench);
        
        // Back panel
        const backPanelGeometry = new THREE.BoxGeometry(8, 4, 0.2);
        const backPanelMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const backPanel = new THREE.Mesh(backPanelGeometry, backPanelMaterial);
        backPanel.position.set(0, 5, -11.5);
        backPanel.castShadow = true;
        benchGroup.add(backPanel);
        
        // Judge's chair
        const chairGeometry = new THREE.BoxGeometry(1.5, 2, 1.5);
        const chairMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const chair = new THREE.Mesh(chairGeometry, chairMaterial);
        chair.position.set(0, 2, -9);
        chair.castShadow = true;
        benchGroup.add(chair);
        
        this.scene.add(benchGroup);
        this.courtroom = benchGroup;
    }
    
    createJuryBox() {
        const juryGroup = new THREE.Group();
        
        // Jury box structure
        const boxGeometry = new THREE.BoxGeometry(6, 4, 4);
        const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.set(-12, 2, -8);
        box.castShadow = true;
        box.receiveShadow = true;
        juryGroup.add(box);
        
        // Jury seats (6 default)
        this.createJurySeats(juryGroup, 6);
        
        this.scene.add(juryGroup);
    }
    
    createJurySeats(count) {
        const seatGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.8);
        const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        
        const rows = Math.ceil(count / 3);
        const cols = Math.min(count, 3);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (row * 3 + col >= count) break;
                
                const seat = new THREE.Mesh(seatGeometry, seatMaterial);
                seat.position.set(
                    -12 + (col - 1) * 1.2,
                    0.25,
                    -8 + row * 1.2
                );
                seat.castShadow = true;
                this.scene.add(seat);
            }
        }
    }
    
    createCounselTables() {
        // Plaintiff/Prosecution table
        const plaintiffTable = this.createTable(0x8B4513, -6, 0.5, -5);
        this.scene.add(plaintiffTable);
        
        // Defense table
        const defenseTable = this.createTable(0x8B4513, 6, 0.5, -5);
        this.scene.add(defenseTable);
    }
    
    createTable(color, x, y, z) {
        const tableGroup = new THREE.Group();
        
        // Table top
        const topGeometry = new THREE.BoxGeometry(3, 0.1, 2);
        const topMaterial = new THREE.MeshLambertMaterial({ color });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.set(0, 0, 0);
        top.castShadow = true;
        top.receiveShadow = true;
        tableGroup.add(top);
        
        // Table legs
        const legGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
        const legMaterial = new THREE.MeshLambertMaterial({ color });
        
        const positions = [
            [-1.2, -0.5, -0.8],
            [1.2, -0.5, -0.8],
            [-1.2, -0.5, 0.8],
            [1.2, -0.5, 0.8]
        ];
        
        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            tableGroup.add(leg);
        });
        
        tableGroup.position.set(x, y, z);
        return tableGroup;
    }
    
    createWitnessStand() {
        const standGroup = new THREE.Group();
        
        // Witness stand platform
        const platformGeometry = new THREE.BoxGeometry(2, 0.5, 2);
        const platformMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(0, 0, 0);
        platform.castShadow = true;
        platform.receiveShadow = true;
        standGroup.add(platform);
        
        // Railing
        const railingGeometry = new THREE.BoxGeometry(2.2, 1, 0.1);
        const railingMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const railing = new THREE.Mesh(railingGeometry, railingMaterial);
        railing.position.set(0, 0.75, -0.9);
        railing.castShadow = true;
        standGroup.add(railing);
        
        standGroup.position.set(0, 0.25, 5);
        this.scene.add(standGroup);
    }
    
    createGallery() {
        // Gallery seating area
        const galleryGeometry = new THREE.BoxGeometry(30, 0.5, 8);
        const galleryMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const gallery = new THREE.Mesh(galleryGeometry, galleryMaterial);
        gallery.position.set(0, 0.25, 12);
        gallery.receiveShadow = true;
        this.scene.add(gallery);
        
        // Gallery seats
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 10; col++) {
                const seatGeometry = new THREE.BoxGeometry(0.8, 0.5, 0.8);
                const seatMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
                const seat = new THREE.Mesh(seatGeometry, seatMaterial);
                seat.position.set(
                    -14.5 + col * 3,
                    0.75,
                    13 + row * 2
                );
                seat.castShadow = true;
                this.scene.add(seat);
            }
        }
    }
    
    createDoors() {
        // Main entrance doors
        const doorGeometry = new THREE.BoxGeometry(1.5, 8, 0.2);
        const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        const leftDoor = new THREE.Mesh(doorGeometry, doorMaterial);
        leftDoor.position.set(-1, 4, 15);
        leftDoor.castShadow = true;
        this.scene.add(leftDoor);
        
        const rightDoor = new THREE.Mesh(doorGeometry, doorMaterial);
        rightDoor.position.set(1, 4, 15);
        rightDoor.castShadow = true;
        this.scene.add(rightDoor);
    }
    
    createWindows() {
        // Windows on side walls
        const windowGeometry = new THREE.PlaneGeometry(3, 2);
        const windowMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.7
        });
        
        // Left wall windows
        for (let i = 0; i < 3; i++) {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(-20, 7, -10 + i * 8);
            window.rotation.y = Math.PI / 2;
            this.scene.add(window);
        }
        
        // Right wall windows
        for (let i = 0; i < 3; i++) {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(20, 7, -10 + i * 8);
            window.rotation.y = -Math.PI / 2;
            this.scene.add(window);
        }
    }
    
    createFurniture() {
        // Court reporter desk
        const reporterDesk = this.createTable(0x8B4513, 0, 0.5, 0);
        this.scene.add(reporterDesk);
        
        // Clerk desk
        const clerkDesk = this.createTable(0x8B4513, -3, 0.5, -10);
        this.scene.add(clerkDesk);
        
        // Bailiff station
        const bailiffStation = this.createTable(0x8B4513, 3, 0.5, -10);
        this.scene.add(bailiffStation);
    }
    
    createCharacters() {
        // Create placeholder characters (will be replaced with AI-generated ones)
        this.createCharacter('judge', 'judge', new THREE.Vector3(0, 4, -9));
        this.createCharacter('plaintiff', 'counsel', new THREE.Vector3(-6, 1, -4));
        this.createCharacter('defendant', 'counsel', new THREE.Vector3(6, 1, -4));
        this.createCharacter('witness', 'witness', new THREE.Vector3(0, 1, 5));
        
        // Create jury members
        this.createJuryMembers(6);
    }
    
    createCharacter(role, type, position) {
        // Simple character representation using basic geometry
        const characterGroup = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: this.getCharacterColor(role)
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0.75, 0);
        body.castShadow = true;
        characterGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 8, 6);
        const headMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFFE4C4
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.75, 0);
        head.castShadow = true;
        characterGroup.add(head);
        
        // Position character
        characterGroup.position.copy(position);
        this.scene.add(characterGroup);
        
        // Store reference
        this.characters.set(role, characterGroup);
    }
    
    createJuryMembers(count) {
        const juryPositions = this.calculateJuryPositions(count);
        
        for (let i = 0; i < count; i++) {
            const position = juryPositions[i];
            this.createCharacter(`juror_${i}`, 'juror', position);
        }
    }
    
    calculateJuryPositions(count) {
        const positions = [];
        const rows = Math.ceil(count / 3);
        const cols = Math.min(count, 3);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (row * 3 + col >= count) break;
                
                positions.push(new THREE.Vector3(
                    -12 + (col - 1) * 1.2,
                    1,
                    -8 + row * 1.2
                ));
            }
        }
        
        return positions;
    }
    
    getCharacterColor(role) {
        const colors = {
            judge: 0x8B0000,      // Dark red
            counsel: 0x000080,    // Navy blue
            witness: 0x006400,    // Dark green
            juror: 0x4B0082,     // Indigo
            defendant: 0x8B0000,  // Dark red
            plaintiff: 0x000080   // Navy blue
        };
        return colors[role] || 0x808080;
    }
    
    createWoodTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Create wood grain effect
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, 256, 256);
        
        for (let i = 0; i < 50; i++) {
            ctx.strokeStyle = `rgba(139, 69, 19, ${Math.random() * 0.5})`;
            ctx.lineWidth = Math.random() * 3 + 1;
            ctx.beginPath();
            ctx.moveTo(0, Math.random() * 256);
            ctx.lineTo(256, Math.random() * 256);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        
        return texture;
    }
    
    createWallTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Create wall texture
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add some variation
        for (let i = 0; i < 100; i++) {
            ctx.fillStyle = `rgba(245, 245, 220, ${Math.random() * 0.3})`;
            ctx.fillRect(
                Math.random() * 256,
                Math.random() * 256,
                Math.random() * 10 + 5,
                Math.random() * 10 + 5
            );
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        
        return texture;
    }
    
    createCeilingTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Create ceiling texture
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add subtle pattern
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(240, 240, 240, ${Math.random() * 0.2})`;
            ctx.fillRect(
                Math.random() * 256,
                Math.random() * 256,
                Math.random() * 20 + 10,
                Math.random() * 20 + 10
            );
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 3);
        
        return texture;
    }
    
    setCameraView(viewName) {
        if (this.cameraViews[viewName]) {
            const view = this.cameraViews[viewName];
            this.camera.position.copy(view.position);
            this.camera.lookAt(view.target);
            this.currentView = viewName;
        }
    }
    
    updateJurySize(size) {
        // Remove existing jury members
        this.characters.forEach((character, role) => {
            if (role.startsWith('juror_')) {
                this.scene.remove(character);
                this.characters.delete(role);
            }
        });
        
        // Create new jury members
        if (size > 0) {
            this.createJuryMembers(size);
        }
    }
    
    updateCaseInfo(caseData) {
        // Update scene based on case information
        // This could include updating character positions, evidence display, etc.
        console.log('Updating scene with case info:', caseData);
    }
    
    reset() {
        // Reset scene to initial state
        this.setCameraView('overview');
        
        // Reset character positions
        this.characters.forEach((character, role) => {
            // Reset to original positions
            const originalPositions = {
                judge: new THREE.Vector3(0, 4, -9),
                plaintiff: new THREE.Vector3(-6, 1, -4),
                defendant: new THREE.Vector3(6, 1, -4),
                witness: new THREE.Vector3(0, 1, 5)
            };
            
            if (originalPositions[role]) {
                character.position.copy(originalPositions[role]);
            }
        });
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Update controls
        this.controls.update();
        
        // Update animation mixers
        this.mixers.forEach(mixer => mixer.update(delta));
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}