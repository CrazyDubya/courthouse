// --- UI Elements ---
const roleProsecutorBtn = document.getElementById('role-prosecutor');
const roleDefenseBtn = document.getElementById('role-defense');
const roleSpectatorBtn = document.getElementById('role-spectator');
const inputContainer = document.getElementById('input-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const dialogueContainer = document.getElementById('dialogue');

let userRole = 'spectator';

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set background color
scene.background = new THREE.Color(0xf0f0f0);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// --- Courtroom elements ---
const courtroom = new THREE.Group();
scene.add(courtroom);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0x808080 }));
floor.rotation.x = -Math.PI / 2;
courtroom.add(floor);

const bench = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 1), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
bench.position.set(0, 0.5, -8);
bench.name = "Judge Reynolds";
courtroom.add(bench);

const prosecutorTable = new THREE.Mesh(new THREE.BoxGeometry(3, 0.8, 1.5), new THREE.MeshStandardMaterial({ color: 0x996633 }));
prosecutorTable.position.set(4, 0.4, -2);
prosecutorTable.name = "Ms. Adler";
courtroom.add(prosecutorTable);

const defenseTable = new THREE.Mesh(new THREE.BoxGeometry(3, 0.8, 1.5), new THREE.MeshStandardMaterial({ color: 0x996633 }));
defenseTable.position.set(-4, 0.4, -2);
defenseTable.name = "Mr. Faye";
courtroom.add(defenseTable);

const originalColors = {};
courtroom.children.forEach(child => {
    if (child.material) originalColors[child.name] = child.material.color.clone();
});

// --- WebSocket Communication ---
const socket = new WebSocket("ws://localhost:8765");
let activeSpeaker = null;

socket.onopen = () => console.log("[open] Connection established");
socket.onclose = event => console.log(event.wasClean ? `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}` : '[close] Connection died');
socket.onerror = error => console.log(`[error] ${error.message}`);

socket.onmessage = event => {
    const data = JSON.parse(event.data);
    console.log(`[message] Data received from server:`, data);

    if (data.event === "agent_speaks") {
        handleAgentSpeaks(data.agent_name, data.message);
    } else if (data.event === "request_user_input") {
        if (userRole === data.role) {
            inputContainer.style.display = 'block';
        }
    }
};

function handleAgentSpeaks(agentName, message) {
    if (activeSpeaker) {
        const oldSpeakerObject = scene.getObjectByName(activeSpeaker);
        if (oldSpeakerObject) oldSpeakerObject.material.color.set(originalColors[activeSpeaker]);
    }

    const speakerObject = scene.getObjectByName(agentName);
    if (speakerObject) {
        activeSpeaker = agentName;
        speakerObject.material.color.set(0xff0000);
    }

    addDialogueMessage(`${agentName}: ${message}`);
}

function addDialogueMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'dialogue-message';
    messageElement.textContent = message;
    dialogueContainer.appendChild(messageElement);
    dialogueContainer.scrollTop = dialogueContainer.scrollHeight;
}

// --- Event Listeners ---
roleProsecutorBtn.addEventListener('click', () => setRole('prosecutor'));
roleDefenseBtn.addEventListener('click', () => setRole('defense'));
roleSpectatorBtn.addEventListener('click', () => setRole('spectator'));

function setRole(role) {
    userRole = role;
    addDialogueMessage(`You are now playing as: ${role}`);
    socket.send(JSON.stringify({ event: 'set_role', role: role }));
    // Disable role selection buttons
    roleProsecutorBtn.disabled = true;
    roleDefenseBtn.disabled = true;
    roleSpectatorBtn.disabled = true;
}

sendButton.addEventListener('click', () => {
    const message = userInput.value;
    if (message) {
        socket.send(JSON.stringify({ event: 'user_input', role: userRole, message: message }));
        userInput.value = '';
        inputContainer.style.display = 'none';
    }
});


// --- Animation and Rendering ---
camera.position.set(0, 6, 12);
camera.lookAt(0, 0, 0);

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);
