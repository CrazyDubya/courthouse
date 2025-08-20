import * as THREE from 'three';
import { Role } from '../shared/types/index.js';

export class CourtroomScene {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;
  private characters: Map<Role, THREE.Object3D> = new Map();
  private isAnimating: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.initScene();
    this.createCourtroom();
    this.setupLighting();
    this.setupControls();
    this.animate();
  }

  private initScene(): void {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 8, 15);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      antialias: true 
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private createCourtroom(): void {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(30, 25);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x8B4513,
      map: this.createWoodTexture()
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Walls
    this.createWalls();

    // Judge's bench
    this.createJudgesBench();

    // Witness stand
    this.createWitnessStand();

    // Jury box
    this.createJuryBox();

    // Lawyer tables
    this.createLawyerTables();

    // Gallery
    this.createGallery();

    // Court reporter desk
    this.createCourtReporterDesk();

    // Bailiff station
    this.createBailiffStation();
  }

  private createWoodTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const context = canvas.getContext('2d')!;
    
    // Create wood-like pattern
    context.fillStyle = '#8B4513';
    context.fillRect(0, 0, 64, 64);
    
    context.fillStyle = '#A0522D';
    for (let i = 0; i < 64; i += 8) {
      context.fillRect(0, i, 64, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    
    return texture;
  }

  private createWalls(): void {
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
    
    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(30, 12);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 6, -12.5);
    this.scene.add(backWall);

    // Side walls
    const sideWallGeometry = new THREE.PlaneGeometry(25, 12);
    
    const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-15, 6, 0);
    leftWall.rotation.y = Math.PI / 2;
    this.scene.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(15, 6, 0);
    rightWall.rotation.y = -Math.PI / 2;
    this.scene.add(rightWall);
  }

  private createJudgesBench(): void {
    const benchGroup = new THREE.Group();
    
    // Main bench
    const benchGeometry = new THREE.BoxGeometry(8, 1.5, 3);
    const benchMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const bench = new THREE.Mesh(benchGeometry, benchMaterial);
    bench.position.set(0, 2.75, -8);
    bench.castShadow = true;
    benchGroup.add(bench);

    // Platform
    const platformGeometry = new THREE.BoxGeometry(10, 0.5, 4);
    const platform = new THREE.Mesh(platformGeometry, benchMaterial);
    platform.position.set(0, 1.25, -8);
    benchGroup.add(platform);

    // Judge's chair
    this.createChair(0, 2.5, -6.5, 0x8B0000, benchGroup);

    this.scene.add(benchGroup);
    this.addRoleLabel(benchGroup, Role.JUDGE, 0, 4, -8);
  }

  private createWitnessStand(): void {
    const standGroup = new THREE.Group();
    
    const standGeometry = new THREE.BoxGeometry(2, 1, 2);
    const standMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.set(6, 1.5, -5);
    stand.castShadow = true;
    standGroup.add(stand);

    // Witness chair
    this.createChair(6, 1, -5, 0x4B0082, standGroup);

    this.scene.add(standGroup);
    this.addRoleLabel(standGroup, Role.WITNESS, 6, 3, -5);
  }

  private createJuryBox(): void {
    const juryGroup = new THREE.Group();
    
    // Jury box platform
    const boxGeometry = new THREE.BoxGeometry(8, 0.5, 3);
    const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const juryBox = new THREE.Mesh(boxGeometry, boxMaterial);
    juryBox.position.set(-8, 0.75, -5);
    juryGroup.add(juryBox);

    // Jury chairs (2 rows of 6)
    for (let row = 0; row < 2; row++) {
      for (let seat = 0; seat < 6; seat++) {
        const x = -11 + seat * 1.2;
        const z = -6 + row * 1.5;
        this.createChair(x, 0.5, z, 0x006400, juryGroup);
      }
    }

    this.scene.add(juryGroup);
    this.addRoleLabel(juryGroup, Role.JURY_MEMBER, -8, 2.5, -5);
  }

  private createLawyerTables(): void {
    // Prosecution table
    const prosGroup = new THREE.Group();
    const prosTableGeometry = new THREE.BoxGeometry(4, 0.2, 2);
    const tableMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const prosTable = new THREE.Mesh(prosTableGeometry, tableMaterial);
    prosTable.position.set(-3, 1.1, 2);
    prosTable.castShadow = true;
    prosGroup.add(prosTable);

    // Prosecution chairs
    this.createChair(-4, 0, 2, 0x8B0000, prosGroup);
    this.createChair(-2, 0, 2, 0x8B0000, prosGroup);

    this.scene.add(prosGroup);
    this.addRoleLabel(prosGroup, Role.PROSECUTOR, -3, 2, 2);

    // Defense table
    const defGroup = new THREE.Group();
    const defTable = new THREE.Mesh(prosTableGeometry, tableMaterial);
    defTable.position.set(3, 1.1, 2);
    defTable.castShadow = true;
    defGroup.add(defTable);

    // Defense chairs
    this.createChair(2, 0, 2, 0x000080, defGroup);
    this.createChair(4, 0, 2, 0x000080, defGroup);

    this.scene.add(defGroup);
    this.addRoleLabel(defGroup, Role.DEFENSE_LAWYER, 3, 2, 2);
  }

  private createGallery(): void {
    const galleryGroup = new THREE.Group();
    
    // Gallery seating (simplified)
    for (let row = 0; row < 4; row++) {
      for (let seat = 0; seat < 10; seat++) {
        const x = -12 + seat * 2.5;
        const z = 6 + row * 1.5;
        this.createChair(x, 0, z, 0x8B4513, galleryGroup);
      }
    }

    this.scene.add(galleryGroup);
  }

  private createCourtReporterDesk(): void {
    const reporterGroup = new THREE.Group();
    
    const deskGeometry = new THREE.BoxGeometry(2, 0.2, 1.5);
    const deskMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const desk = new THREE.Mesh(deskGeometry, deskMaterial);
    desk.position.set(0, 1.1, 0);
    desk.castShadow = true;
    reporterGroup.add(desk);

    // Court reporter chair
    this.createChair(0, 0, 0, 0x4B0082, reporterGroup);

    this.scene.add(reporterGroup);
    this.addRoleLabel(reporterGroup, Role.COURT_REPORTER, 0, 2, 0);
  }

  private createBailiffStation(): void {
    const bailiffGroup = new THREE.Group();
    
    // Simple standing position
    const positionMarker = new THREE.RingGeometry(0.3, 0.5, 8);
    const markerMaterial = new THREE.MeshLambertMaterial({ color: 0x4B0082 });
    const marker = new THREE.Mesh(positionMarker, markerMaterial);
    marker.rotation.x = -Math.PI / 2;
    marker.position.set(8, 0.01, 0);
    bailiffGroup.add(marker);

    this.scene.add(bailiffGroup);
    this.addRoleLabel(bailiffGroup, Role.BAILIFF, 8, 2, 0);
  }

  private createChair(x: number, y: number, z: number, color: number, parent?: THREE.Group): THREE.Group {
    const chairGroup = new THREE.Group();
    
    // Seat
    const seatGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.8);
    const chairMaterial = new THREE.MeshLambertMaterial({ color });
    const seat = new THREE.Mesh(seatGeometry, chairMaterial);
    seat.position.set(0, 0.55, 0);
    seat.castShadow = true;
    chairGroup.add(seat);

    // Backrest
    const backGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
    const back = new THREE.Mesh(backGeometry, chairMaterial);
    back.position.set(0, 0.9, -0.35);
    back.castShadow = true;
    chairGroup.add(back);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.1);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    
    const positions = [
      [-0.3, 0.25, -0.3],
      [0.3, 0.25, -0.3],
      [-0.3, 0.25, 0.3],
      [0.3, 0.25, 0.3]
    ];

    positions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      chairGroup.add(leg);
    });

    chairGroup.position.set(x, y, z);
    
    if (parent) {
      parent.add(chairGroup);
    } else {
      this.scene.add(chairGroup);
    }

    return chairGroup;
  }

  private addRoleLabel(parent: THREE.Group, role: Role, x: number, y: number, z: number): void {
    // Create text sprite for role labels
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = '#000000';
    context.fillRect(0, 0, 256, 64);
    context.fillStyle = '#FFFFFF';
    context.font = 'Bold 16px Arial';
    context.textAlign = 'center';
    context.fillText(role.toUpperCase().replace('_', ' '), 128, 40);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x, y, z);
    sprite.scale.set(2, 0.5, 1);
    
    parent.add(sprite);
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    this.scene.add(directionalLight);

    // Point lights for atmosphere
    const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 20);
    pointLight1.position.set(0, 8, -8);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 15);
    pointLight2.position.set(-8, 5, -5);
    this.scene.add(pointLight2);
  }

  private setupControls(): void {
    let isMouseDown = false;
    let previousMousePosition = { x: 0, y: 0 };

    this.canvas.addEventListener('mousedown', (event) => {
      isMouseDown = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    this.canvas.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    this.canvas.addEventListener('mousemove', (event) => {
      if (!isMouseDown) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      const deltaRotationQuaternion = new THREE.Quaternion()
        .setFromEuler(new THREE.Euler(
          deltaMove.y * 0.01,
          deltaMove.x * 0.01,
          0,
          'XYZ'
        ));

      this.camera.quaternion.multiplyQuaternions(deltaRotationQuaternion, this.camera.quaternion);
      previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    this.canvas.addEventListener('wheel', (event) => {
      const delta = event.deltaY * 0.01;
      this.camera.position.multiplyScalar(1 + delta);
    });
  }

  private animate(): void {
    this.isAnimating = true;
    const animateLoop = () => {
      if (!this.isAnimating) return;
      
      requestAnimationFrame(animateLoop);
      this.renderer.render(this.scene, this.camera);
    };
    animateLoop();
  }

  private onWindowResize(): void {
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  // Public methods for external control
  highlightRole(role: Role): void {
    const character = this.characters.get(role);
    if (character) {
      // Add highlight effect
      character.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color(0x444444);
        }
      });
    }
  }

  removeHighlight(role: Role): void {
    const character = this.characters.get(role);
    if (character) {
      // Remove highlight effect
      character.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.emissive = new THREE.Color(0x000000);
        }
      });
    }
  }

  focusOnRole(role: Role): void {
    // Simple camera animation to focus on a role's position
    const positions: Record<Role, [number, number, number]> = {
      [Role.JUDGE]: [0, 8, -5],
      [Role.PROSECUTOR]: [-3, 5, 5],
      [Role.DEFENSE_LAWYER]: [3, 5, 5],
      [Role.WITNESS]: [6, 5, -2],
      [Role.JURY_MEMBER]: [-8, 5, -2],
      [Role.COURT_REPORTER]: [0, 5, 3],
      [Role.BAILIFF]: [8, 5, 3],
      [Role.DEFENDANT]: [3, 5, 5],
      [Role.PLAINTIFF]: [-3, 5, 5],
      [Role.PLAINTIFF_LAWYER]: [-3, 5, 5]
    };

    const targetPosition = positions[role];
    if (targetPosition) {
      // Smooth camera transition
      const startPosition = this.camera.position.clone();
      const endPosition = new THREE.Vector3(...targetPosition);
      
      let progress = 0;
      const animateCamera = () => {
        progress += 0.05;
        if (progress >= 1) {
          this.camera.position.copy(endPosition);
          return;
        }
        
        this.camera.position.lerpVectors(startPosition, endPosition, progress);
        requestAnimationFrame(animateCamera);
      };
      
      animateCamera();
    }
  }

  destroy(): void {
    this.isAnimating = false;
    this.renderer.dispose();
    this.scene.clear();
  }
}