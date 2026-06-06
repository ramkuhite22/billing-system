// State Management
let dbData = window.dbData || null;
let currentUser = null;

// DOM Elements
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const payBillView = document.getElementById('pay-bill-view');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const errorMsg = document.getElementById('login-error');
const storyView = document.getElementById('story-view');
const storyEntranceBox = document.getElementById('story-entrance-box');
const storyDialogBox = document.getElementById('story-dialog-box');

// Tabs
const navLinks = document.querySelectorAll('.nav-links a');
const tabContents = document.querySelectorAll('.tab-content');

// Fetch Data (Now Synchronous via data.js & LocalStorage)
function saveData() {
    if (dbData) {
        localStorage.setItem('mjp_billing_db', JSON.stringify(dbData));
    }
}

async function loadData() {
    const localData = localStorage.getItem('mjp_billing_db');
    if (localData) {
        try {
            dbData = JSON.parse(localData);
        } catch (e) {
            console.error("Error parsing local storage data, resetting to default.", e);
            dbData = window.dbData;
            saveData();
        }
    } else {
        dbData = window.dbData;
        saveData();
    }
}

// ThreeJS Background Animation
function initThreeJS() {
    const canvas = document.getElementById('webgl-canvas');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue
    scene.fog = new THREE.Fog(0x87ceeb, 60, 150);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 25); // Eye level at the entrance

    // Initialize global camera state
    window.cameraState = {
        basePos: new THREE.Vector3(0, 5.5, 25),
        baseLook: new THREE.Vector3(0, 4, -20),
        mouseInfluence: 1.0
    };

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff0dd, 0.8);
    dirLight.position.set(20, 50, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    const d = 40;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    const officeGroup = new THREE.Group();
    scene.add(officeGroup);

    // Materials
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.8 }); 
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfffdd0 }); // Cream color walls
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.3, roughness: 0.1 });
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x1e90ff }); // Blue plastic waiting chairs
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c });
    const adminShirt = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const pantMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const clientShirt = new THREE.MeshStandardMaterial({ color: 0xff6347 });

    // 1. Office Layout
    const floor = new THREE.Mesh(new THREE.BoxGeometry(70, 1, 50), floorMat);
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    officeGroup.add(floor);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(70, 20, 1), wallMat);
    backWall.position.set(0, 10, -24.5);
    backWall.receiveShadow = true;
    backWall.castShadow = true;
    officeGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(1, 20, 50), wallMat);
    leftWall.position.set(-34.5, 10, 0);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    officeGroup.add(leftWall);
    
    // Counter partition wall
    const counterWall = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 20), wallMat);
    counterWall.position.set(5, 5, -15);
    counterWall.receiveShadow = true;
    counterWall.castShadow = true;
    officeGroup.add(counterWall);

    // Front Gate
    const pillar1 = new THREE.Mesh(new THREE.BoxGeometry(3, 22, 3), wallMat);
    pillar1.position.set(-15, 11, 24);
    pillar1.castShadow = true;
    officeGroup.add(pillar1);

    const pillar2 = new THREE.Mesh(new THREE.BoxGeometry(3, 22, 3), wallMat);
    pillar2.position.set(15, 11, 24);
    pillar2.castShadow = true;
    officeGroup.add(pillar2);

    const arch = new THREE.Mesh(new THREE.BoxGeometry(33, 5, 3), new THREE.MeshStandardMaterial({color: 0xff9933})); // Saffron arch
    arch.position.set(0, 21.5, 24);
    arch.castShadow = true;
    officeGroup.add(arch);

    // Front Gate Name Board
    const nameCanvas = document.createElement('canvas');
    nameCanvas.width = 1024;
    nameCanvas.height = 256;
    const nctx = nameCanvas.getContext('2d');
    nctx.fillStyle = '#ff9933'; // Saffron
    nctx.fillRect(0, 0, 1024, 256);
    nctx.fillStyle = 'white';
    nctx.font = 'bold 65px Arial';
    nctx.textAlign = 'center';
    nctx.fillText('महाराष्ट्र जीवन प्राधिकरण', 512, 80);
    nctx.font = 'bold 50px Arial';
    nctx.fillText('WATER BILLING OFFICE - UMRED', 512, 160);
    nctx.font = '35px Arial';
    nctx.fillText('Govt. of Maharashtra', 512, 220);
    
    const nameBoard = new THREE.Mesh(new THREE.PlaneGeometry(30, 7.5), new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(nameCanvas)}));
    nameBoard.position.set(0, 21.5, 25.6);
    officeGroup.add(nameBoard);

    // 2. Hanging Data Board
    const dashCanvas = document.createElement('canvas');
    dashCanvas.width = 512;
    dashCanvas.height = 256;
    const dashCtx = dashCanvas.getContext('2d');
    const dashTex = new THREE.CanvasTexture(dashCanvas);
    
    window.update3DDashboard = function(clients, bills, revenue) {
        dashCtx.fillStyle = '#1e3a8a'; // Blue background
        dashCtx.fillRect(0, 0, 512, 256);
        dashCtx.fillStyle = '#ffffff';
        dashCtx.font = 'bold 40px sans-serif';
        dashCtx.textAlign = 'center';
        dashCtx.fillText('LIVE STATISTICS', 256, 50);
        dashCtx.textAlign = 'left';
        dashCtx.font = '30px sans-serif';
        dashCtx.fillText('Clients: ' + clients, 40, 120);
        dashCtx.fillText('Total Bills: ' + bills, 40, 170);
        dashCtx.fillText('Revenue: ' + revenue, 40, 220);
        dashTex.needsUpdate = true;
    }
    window.update3DDashboard(0, 0, '₹0');

    const dataBoard = new THREE.Mesh(new THREE.BoxGeometry(16, 8, 0.5), [woodMat, woodMat, woodMat, woodMat, new THREE.MeshBasicMaterial({map: dashTex}), woodMat]);
    dataBoard.position.set(-15, 12, -23.5);
    dataBoard.castShadow = true;
    officeGroup.add(dataBoard);

    // 3. Payment Counter
    const desk = new THREE.Mesh(new THREE.BoxGeometry(12, 4, 5), woodMat);
    desk.position.set(15, 2, -15);
    desk.castShadow = true;
    desk.receiveShadow = true;
    officeGroup.add(desk);

    const glassPart = new THREE.Mesh(new THREE.BoxGeometry(12, 5, 0.2), glassMat);
    glassPart.position.set(15, 6.5, -12.4);
    officeGroup.add(glassPart);

    // 4. Character Builder
    function createPerson(skin, shirt, pant) {
        const group = new THREE.Group();
        const head = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), skin);
        head.position.y = 4;
        head.castShadow = true;
        group.add(head);

        const body = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 1), shirt);
        body.position.y = 2;
        body.castShadow = true;
        group.add(body);

        const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2, 0.8), pant);
        lLeg.position.set(-0.5, -0.25, 0);
        lLeg.castShadow = true;
        group.add(lLeg);

        const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2, 0.8), pant);
        rLeg.position.set(0.5, -0.25, 0);
        rLeg.castShadow = true;
        group.add(rLeg);

        group.userData = { lLeg, rLeg };
        return group;
    }

    // Admin
    const admin = createPerson(skinMat, adminShirt, pantMat);
    admin.position.set(15, 2.5, -19);
    admin.userData.lLeg.rotation.x = -Math.PI/2;
    admin.userData.lLeg.position.set(-0.5, 1, 1);
    admin.userData.rLeg.rotation.x = -Math.PI/2;
    admin.userData.rLeg.position.set(0.5, 1, 1);
    admin.rotation.y = Math.PI; // Face forward
    officeGroup.add(admin);

    const adminChair = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, 2.5), pantMat);
    adminChair.position.set(15, 2, -19);
    adminChair.castShadow = true;
    officeGroup.add(adminChair);

    // 5. Waiting Clients
    for(let i=0; i<4; i++) {
        // Chairs
        const waitChair = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, 2.5), chairMat);
        waitChair.position.set(-25 + i*5, 1.5, -5);
        waitChair.castShadow = true;
        officeGroup.add(waitChair);

        if (i !== 2) { // Leave one empty
            const client = createPerson(skinMat, (i%2===0)?clientShirt:new THREE.MeshStandardMaterial({color: 0x3cb371}), pantMat);
            client.position.set(-25 + i*5, 2, -5);
            client.userData.lLeg.rotation.x = -Math.PI/2;
            client.userData.lLeg.position.set(-0.5, 1, 1);
            client.userData.rLeg.rotation.x = -Math.PI/2;
            client.userData.rLeg.position.set(0.5, 1, 1);
            officeGroup.add(client);
        }
    }

    // Interaction (Raycaster)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('mousemove', (e) => {
        // Normalize mouse coordinates
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('click', () => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([admin, dataBoard, nameBoard], true);
        if(intersects.length > 0) {
            let obj = intersects[0].object;
            // Pop effect
            gsap.to(obj.scale, {x: 1.2, y: 1.2, z: 1.2, duration: 0.1, yoyo: true, repeat: 1});
        }
    });

    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        
        // Calculate target positions based on base state and mouse offset
        const targetX = window.cameraState.basePos.x + (mouse.x * 20 * window.cameraState.mouseInfluence);
        const targetZ = window.cameraState.basePos.z - (mouse.y * 20 * window.cameraState.mouseInfluence);
        const targetY = window.cameraState.basePos.y;
        
        // Interpolate camera position
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.z += (targetZ - camera.position.z) * 0.05;
        camera.position.y += (targetY - camera.position.y) * 0.05;
        
        // Add subtle head bobbing effect while moving
        const speed = Math.abs(targetX - camera.position.x) + Math.abs(targetZ - camera.position.z);
        if (speed > 0.1 && window.cameraState.mouseInfluence > 0.5) {
            camera.position.y += Math.sin(clock.getElapsedTime() * 10) * 0.05;
        }

        // Calculate gaze direction
        const lookX = window.cameraState.baseLook.x + (mouse.x * 15 * window.cameraState.mouseInfluence);
        const lookY = window.cameraState.baseLook.y - (mouse.y * 5 * window.cameraState.mouseInfluence);
        const lookZ = window.cameraState.baseLook.z;
        
        if (!camera.userData.currentLook) camera.userData.currentLook = new THREE.Vector3(0, 4, -20);
        camera.userData.currentLook.x += (lookX - camera.userData.currentLook.x) * 0.05;
        camera.userData.currentLook.y += (lookY - camera.userData.currentLook.y) * 0.05;
        camera.userData.currentLook.z += (lookZ - camera.userData.currentLook.z) * 0.05;

        camera.lookAt(camera.userData.currentLook);

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Authentication
loginBtn.addEventListener('click', () => {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    if(!dbData) return;
    
    // Check user
    const foundUser = dbData.users.find(u => u.username === user && u.password === pass);
    if(foundUser) {
        currentUser = foundUser;
        errorMsg.style.display = 'none';
        
        // Animate Out
        gsap.to(loginView, {opacity: 0, duration: 0.5, onComplete: () => {
            loginView.classList.remove('active');
            dashboardView.classList.add('active');
            gsap.to(dashboardView, {opacity: 1, duration: 0.5});
            initDashboard();
            
            if(window.cameraState) {
                gsap.to(window.cameraState.basePos, {x: -15, y: 12, z: -10, duration: 2, ease: "power2.inOut"});
                gsap.to(window.cameraState.baseLook, {x: -15, y: 12, z: -23.5, duration: 2, ease: "power2.inOut"});
                gsap.to(window.cameraState, {mouseInfluence: 0.1, duration: 2});
            }
        }});
    } else {
        errorMsg.style.display = 'block';
        // Shake animation
        gsap.fromTo(".login-box", {x: -10}, {x: 10, duration: 0.1, yoyo: true, repeat: 3, onComplete: () => gsap.set(".login-box", {x: 0})});
    }
});

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    gsap.to(dashboardView, {opacity: 0, duration: 0.5, onComplete: () => {
        dashboardView.classList.remove('active');
        storyView.classList.add('active');
        
        // Reset story state
        storyEntranceBox.style.display = 'block';
        storyEntranceBox.style.opacity = '1';
        storyDialogBox.style.display = 'none';
        
        gsap.to(storyView, {opacity: 1, duration: 0.5});
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        if(window.cameraState) {
            gsap.to(window.cameraState.basePos, {x: 0, y: 5.5, z: 25, duration: 2, ease: "power2.inOut"});
            gsap.to(window.cameraState.baseLook, {x: 0, y: 4, z: -20, duration: 2, ease: "power2.inOut"});
            gsap.to(window.cameraState, {mouseInfluence: 1.0, duration: 2});
        }
    }});
});

// Story Flow Logic
document.getElementById('walk-to-counter-btn').addEventListener('click', () => {
    // Hide entrance box
    gsap.to(storyEntranceBox, {opacity: 0, duration: 0.5, onComplete: () => {
        storyEntranceBox.style.display = 'none';
        
        // Move camera to counter
        if(window.cameraState) {
            gsap.to(window.cameraState.basePos, {x: 10, y: 5.5, z: -8, duration: 3, ease: "power2.inOut"});
            gsap.to(window.cameraState.baseLook, {x: 15, y: 2.5, z: -19, duration: 3, ease: "power2.inOut"});
            gsap.to(window.cameraState, {mouseInfluence: 0.2, duration: 3, onComplete: () => {
                // Show dialog box when arrived
                storyDialogBox.style.display = 'block';
                gsap.fromTo(storyDialogBox, {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.5});
            }});
        }
    }});
});

document.getElementById('story-admin-btn').addEventListener('click', () => {
    gsap.to(storyView, {opacity: 0, duration: 0.5, onComplete: () => {
        storyView.classList.remove('active');
        loginView.classList.add('active');
        gsap.to(loginView, {opacity: 1, duration: 0.5});
    }});
});

document.getElementById('story-customer-btn').addEventListener('click', () => {
    gsap.to(storyView, {opacity: 0, duration: 0.5, onComplete: () => {
        storyView.classList.remove('active');
        payBillView.classList.add('active');
        gsap.to(payBillView, {opacity: 1, duration: 0.5});
    }});
});

document.getElementById('back-to-story-from-login-btn').addEventListener('click', () => {
    gsap.to(loginView, {opacity: 0, duration: 0.5, onComplete: () => {
        loginView.classList.remove('active');
        storyView.classList.add('active');
        gsap.to(storyView, {opacity: 1, duration: 0.5});
    }});
});

document.getElementById('back-to-story-from-pay-btn').addEventListener('click', () => {
    gsap.to(payBillView, {opacity: 0, duration: 0.5, onComplete: () => {
        payBillView.classList.remove('active');
        storyView.classList.add('active');
        gsap.to(storyView, {opacity: 1, duration: 0.5});
    }});
});

document.getElementById('search-bill-btn').addEventListener('click', () => {
    const searchVal = document.getElementById('search-bill-id').value.trim();
    const resultDiv = document.getElementById('pay-bill-result');
    if(!searchVal) return;
    
    // Search by bill ID or Owner ID
    const bills = dbData.bills.filter(b => b.id == searchVal || b.owners_id == searchVal);
    
    if(bills.length > 0) {
        // Just show the latest bill for simplicity
        const bill = bills[bills.length - 1];
        const client = dbData.owners.find(o => o.id == bill.owners_id);
        const amount = parseFloat(bill.price).toFixed(2);
        
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <p><strong>Name:</strong> ${client ? client.fname + ' ' + client.lname : 'Unknown'}</p>
            <p><strong>Bill Date:</strong> ${bill.date}</p>
            <p><strong>Amount Due:</strong> <span style="color:var(--primary); font-weight:bold;">₹${amount}</span></p>
            <button class="btn primary-btn" style="margin-top:15px; background:linear-gradient(135deg, #10b981, #059669);" onclick="processFakePayment(${bill.id})">Pay Securely via Credit Card/UPI</button>
        `;
    } else {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<p style="color:var(--error);">No pending bills found for ID: ${searchVal}</p>`;
    }
});

window.processFakePayment = function(billId) {
    const resultDiv = document.getElementById('pay-bill-result');
    resultDiv.innerHTML = `<p style="color:var(--primary);">Processing payment securely... Please wait.</p>`;
    
    setTimeout(() => {
        // Remove bill after payment
        dbData.bills = dbData.bills.filter(b => b.id != billId);
        saveData();
        resultDiv.innerHTML = `
            <div style="text-align:center;">
                <h3 style="color:var(--success);">Payment Successful!</h3>
                <p>Thank you for using the MJP WaterFlow Online Payment Portal.</p>
                <p>Transaction ID: ${Math.floor(Math.random()*1000000000)}</p>
            </div>
        `;
    }, 2000);
}

// Dashboard Management
function initDashboard() {
    document.getElementById('current-user-name').innerText = currentUser.name;
    updateStats();
    renderClients();
    renderBills();
    renderUsers();
}

function updateStats() {
    document.getElementById('stat-clients').innerText = dbData.owners.length;
    document.getElementById('stat-bills').innerText = dbData.bills.length;
    
    // Calculate total revenue from price
    let total = 0;
    dbData.bills.forEach(b => total += parseFloat(b.price || 0));
    const revenueStr = '₹' + total.toFixed(2);
    document.getElementById('stat-revenue').innerText = revenueStr;
    
    // Update 3D Dashboard Board
    if(window.update3DDashboard) {
        window.update3DDashboard(dbData.owners.length, dbData.bills.length, revenueStr);
    }
}

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');
        
        const targetId = e.target.getAttribute('data-target');
        tabContents.forEach(content => {
            content.classList.remove('active');
            if(content.id === targetId) {
                content.classList.add('active');
            }
        });
        
        if(window.cameraState) {
            if(targetId === 'dashboard-content') {
                gsap.to(window.cameraState.basePos, {x: -15, y: 12, z: -10, duration: 1.5, ease: "power2.inOut"});
                gsap.to(window.cameraState.baseLook, {x: -15, y: 12, z: -23.5, duration: 1.5, ease: "power2.inOut"});
                gsap.to(window.cameraState, {mouseInfluence: 0.1, duration: 1.5});
            } else if(targetId === 'clients-content') {
                gsap.to(window.cameraState.basePos, {x: -15, y: 5, z: 10, duration: 1.5, ease: "power2.inOut"});
                gsap.to(window.cameraState.baseLook, {x: -20, y: 2, z: -5, duration: 1.5, ease: "power2.inOut"});
                gsap.to(window.cameraState, {mouseInfluence: 0.2, duration: 1.5});
            } else if(targetId === 'bills-content' || targetId === 'users-content') {
                gsap.to(window.cameraState.basePos, {x: 15, y: 6, z: -5, duration: 1.5, ease: "power2.inOut"});
                gsap.to(window.cameraState.baseLook, {x: 15, y: 2.5, z: -19, duration: 1.5, ease: "power2.inOut"});
                gsap.to(window.cameraState, {mouseInfluence: 0.2, duration: 1.5});
            }
        }
    });
});

// Rendering Tables
function renderClients() {
    const tbody = document.getElementById('clients-table-body');
    tbody.innerHTML = '';
    dbData.owners.forEach(owner => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${owner.id}</td>
            <td>${owner.fname} ${owner.mi ? owner.mi + '.' : ''} ${owner.lname}</td>
            <td>${owner.address}</td>
            <td>${owner.contact}</td>
            <td>
                <button class="action-btn" onclick="editClient(${owner.id})">Edit</button>
                <button class="action-btn delete" onclick="deleteClient(${owner.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderBills() {
    const tbody = document.getElementById('bills-table-body');
    tbody.innerHTML = '';
    dbData.bills.forEach(bill => {
        const client = dbData.owners.find(o => o.id == bill.owners_id);
        const clientName = client ? `${client.fname} ${client.lname}` : 'Unknown';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${bill.id}</td>
            <td>${clientName}</td>
            <td>${bill.prev}</td>
            <td>${bill.pres}</td>
            <td>₹${parseFloat(bill.price).toFixed(2)}</td>
            <td>${bill.date}</td>
            <td>
                <button class="action-btn" onclick="viewInvoice(${bill.id})">View Invoice</button>
                <button class="action-btn delete" onclick="deleteBill(${bill.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    dbData.users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.name}</td>
            <td>
                <button class="action-btn" onclick="editUser(${user.id})">Edit</button>
                ${currentUser && currentUser.id !== user.id ? `<button class="action-btn delete" onclick="deleteUser(${user.id})">Delete</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Modals
const modalOverlay = document.getElementById('modal-overlay');
const clientModal = document.getElementById('client-modal');
const billModal = document.getElementById('bill-modal');
const userModal = document.getElementById('user-modal');
const invoiceModal = document.getElementById('invoice-modal');
const closeBtns = document.querySelectorAll('.close-modal');

document.getElementById('add-client-btn').addEventListener('click', () => {
    document.getElementById('client-modal-title').innerText = 'Add New Client';
    document.getElementById('client-fname').value = '';
    document.getElementById('client-lname').value = '';
    document.getElementById('client-mi').value = '';
    document.getElementById('client-address').value = '';
    document.getElementById('client-contact').value = '';
    
    // Store editing id as data attribute on the save button
    document.getElementById('save-client-btn').dataset.editId = '';
    
    modalOverlay.classList.add('active');
    clientModal.classList.add('active');
});

document.getElementById('add-bill-btn').addEventListener('click', () => {
    // Populate client dropdown
    const select = document.getElementById('bill-client');
    select.innerHTML = '';
    dbData.owners.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.id;
        opt.innerText = `${o.fname} ${o.lname}`;
        select.appendChild(opt);
    });
    
    document.getElementById('bill-prev').value = '';
    document.getElementById('bill-pres').value = '';
    
    modalOverlay.classList.add('active');
    billModal.classList.add('active');
});

document.getElementById('add-user-btn')?.addEventListener('click', () => {
    document.getElementById('user-modal-title').innerText = 'Add New User';
    document.getElementById('user-id').value = '';
    document.getElementById('user-name').value = '';
    document.getElementById('user-username').value = '';
    document.getElementById('user-password').value = '';
    
    modalOverlay.classList.add('active');
    userModal.classList.add('active');
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', closeModal);
});

function closeModal() {
    modalOverlay.classList.remove('active');
    clientModal.classList.remove('active');
    billModal.classList.remove('active');
    if(userModal) userModal.classList.remove('active');
    if(invoiceModal) invoiceModal.classList.remove('active');
}

// Client Actions
document.getElementById('save-client-btn').addEventListener('click', (e) => {
    const editId = e.target.dataset.editId;
    if(editId) {
        // Edit existing
        const owner = dbData.owners.find(o => o.id == editId);
        if(owner) {
            owner.fname = document.getElementById('client-fname').value;
            owner.lname = document.getElementById('client-lname').value;
            owner.mi = document.getElementById('client-mi').value;
            owner.address = document.getElementById('client-address').value;
            owner.contact = document.getElementById('client-contact').value;
        }
    } else {
        // Add new
        const newId = dbData.owners.length > 0 ? Math.max(...dbData.owners.map(o => o.id)) + 1 : 1;
        dbData.owners.push({
            id: newId,
            fname: document.getElementById('client-fname').value,
            lname: document.getElementById('client-lname').value,
            mi: document.getElementById('client-mi').value,
            address: document.getElementById('client-address').value,
            contact: document.getElementById('client-contact').value
        });
    }
    renderClients();
    updateStats();
    saveData();
    closeModal();
});

window.deleteClient = function(id) {
    if(confirm("Are you sure you want to delete this client?")) {
        dbData.owners = dbData.owners.filter(o => o.id !== id);
        renderClients();
        updateStats();
        saveData();
    }
}

window.editClient = function(id) {
    const owner = dbData.owners.find(o => o.id === id);
    if(owner) {
        document.getElementById('client-modal-title').innerText = 'Edit Client';
        document.getElementById('client-fname').value = owner.fname;
        document.getElementById('client-lname').value = owner.lname;
        document.getElementById('client-mi').value = owner.mi;
        document.getElementById('client-address').value = owner.address;
        document.getElementById('client-contact').value = owner.contact;
        
        document.getElementById('save-client-btn').dataset.editId = id;
        
        modalOverlay.classList.add('active');
        clientModal.classList.add('active');
    }
}

// Bill Actions
document.getElementById('save-bill-btn').addEventListener('click', () => {
    const newId = dbData.bills.length > 0 ? Math.max(...dbData.bills.map(b => b.id)) + 1 : 1;
    const prev = parseFloat(document.getElementById('bill-prev').value || 0);
    const pres = parseFloat(document.getElementById('bill-pres').value || 0);
    const consumption = Math.max(0, pres - prev);
    let price = 0;
    
    // Umred, Maharashtra telescopic slab water tariff calculation
    if (consumption <= 20) {
        price = consumption * 8.15;
    } else if (consumption <= 30) {
        price = (20 * 8.15) + ((consumption - 20) * 13.03);
    } else if (consumption <= 80) {
        price = (20 * 8.15) + (10 * 13.03) + ((consumption - 30) * 17.93);
    } else {
        price = (20 * 8.15) + (10 * 13.03) + (50 * 17.93) + ((consumption - 80) * 24.44);
    }
    
    const d = new Date();
    const dateStr = d.toISOString().replace('T', ' ').substring(2, 19);

    dbData.bills.push({
        id: newId,
        owners_id: parseInt(document.getElementById('bill-client').value),
        prev: prev.toString(),
        pres: pres.toString(),
        price: price.toString(),
        date: dateStr
    });
    renderBills();
    updateStats();
    saveData();
    closeModal();
});

window.deleteBill = function(id) {
    if(confirm("Are you sure you want to delete this bill?")) {
        dbData.bills = dbData.bills.filter(b => b.id !== id);
        renderBills();
        updateStats();
        saveData();
    }
}

window.viewInvoice = function(id) {
    const bill = dbData.bills.find(b => b.id === id);
    if(bill) {
        const client = dbData.owners.find(o => o.id == bill.owners_id);
        const clientName = client ? `${client.fname} ${client.mi ? client.mi+'.' : ''} ${client.lname}` : 'Unknown';
        
        const content = `
            <h2>WaterFlow Bill Invoice</h2>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 10px 0;">
            <p><strong>Date:</strong> ${bill.date}</p>
            <p><strong>Client Name:</strong> ${clientName}</p>
            ${client ? `<p><strong>Address:</strong> ${client.address}</p>
            <p><strong>Contact:</strong> ${client.contact}</p>` : ''}
            <hr style="border-color: rgba(255,255,255,0.1); margin: 10px 0;">
            <p><strong>Previous Reading:</strong> ${bill.prev} m³</p>
            <p><strong>Present Reading:</strong> ${bill.pres} m³</p>
            <p><strong>Consumption:</strong> ${parseFloat(bill.pres) - parseFloat(bill.prev)} m³</p>
            <p><strong>Tariff structure (per m³):</strong> 0-20: ₹8.15 | 21-30: ₹13.03 | 31-80: ₹17.93 | >80: ₹24.44</p>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 10px 0;">
            <h3 style="color: var(--primary);">Total Invoice: ₹${parseFloat(bill.price).toFixed(2)}</h3>
        `;
        document.getElementById('invoice-content').innerHTML = content;
        
        modalOverlay.classList.add('active');
        invoiceModal.classList.add('active');
    }
}

// User Actions
document.getElementById('save-user-btn')?.addEventListener('click', () => {
    const editId = document.getElementById('user-id').value;
    const name = document.getElementById('user-name').value;
    const username = document.getElementById('user-username').value;
    const password = document.getElementById('user-password').value;

    if(editId) {
        const user = dbData.users.find(u => u.id == editId);
        if(user) {
            user.name = name;
            user.username = username;
            if(password) user.password = password; // Only update if provided
        }
    } else {
        const newId = dbData.users.length > 0 ? Math.max(...dbData.users.map(u => u.id)) + 1 : 1;
        dbData.users.push({
            id: newId,
            username: username,
            password: password,
            name: name
        });
    }
    renderUsers();
    saveData();
    closeModal();
});

window.editUser = function(id) {
    const user = dbData.users.find(u => u.id === id);
    if(user) {
        document.getElementById('user-modal-title').innerText = 'Edit User';
        document.getElementById('user-id').value = user.id;
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-username').value = user.username;
        document.getElementById('user-password').value = ''; // Don't prefill password
        
        modalOverlay.classList.add('active');
        userModal.classList.add('active');
    }
}

window.deleteUser = function(id) {
    if(currentUser.id === id) {
        alert("Cannot delete yourself.");
        return;
    }
    if(confirm("Are you sure you want to delete this user?")) {
        dbData.users = dbData.users.filter(u => u.id !== id);
        renderUsers();
        saveData();
    }
}

// Init
window.onload = async () => {
    initThreeJS();
    await loadData();
};
