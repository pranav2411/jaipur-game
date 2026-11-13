// Authentic Indian & Jaipur 3D Vehicle Factory (Optimized for 60 FPS)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const VEHICLE_ORDER = [
  'auto',
  'scooter',
  'xpulse',
  'bike',
  'car',
  'bus',
  'erickshaw'
];

export const VEHICLE_CATALOG = {
  auto: {
    id: 'auto',
    name: 'BAJAJ RE JAIPUR AUTO',
    hindiName: 'जयपुर ऑटो रिक्शा',
    plate: 'RJ 14 PA 4207',
    category: 'BAJAJ RE 4S • CNG',
    speedStat: 68,
    accelStat: 78,
    gripStat: 86,
    topSpeed: 31,
    accel: 22,
    handling: 2.5,
    mass: 1.0,
    bodyColor: 0x085c30,
    canopyColor: 0xdba412
  },
  scooter: {
    id: 'scooter',
    name: 'HONDA ACTIVA 6G 125',
    hindiName: 'होंडा एक्टिवा 6G',
    plate: 'RJ 14 SC 7711',
    category: 'ACTIVA 6G • 125CC',
    speedStat: 72,
    accelStat: 84,
    gripStat: 88,
    topSpeed: 33,
    accel: 24,
    handling: 2.75,
    mass: 0.7,
    bodyColor: 0xf1efe9,
    canopyColor: 0x5c2c16
  },
  xpulse: {
    id: 'xpulse',
    name: 'HERO XPULSE 200 4V',
    hindiName: 'हीरो एक्सपल्स 200 रैली',
    plate: 'RJ 14 XP 2004',
    category: 'RALLY EDITION • 200CC',
    speedStat: 85,
    accelStat: 90,
    gripStat: 89,
    topSpeed: 38,
    accel: 28,
    handling: 2.7,
    mass: 0.8,
    bodyColor: 0xf8fafc,
    canopyColor: 0xd90429
  },
  bike: {
    id: 'bike',
    name: 'ROYAL ENFIELD CLASSIC 350',
    hindiName: 'रॉयल एनफील्ड क्लासिक 350',
    plate: 'RJ 14 RE 0350',
    category: 'BULLET • 350CC J-SERIES',
    speedStat: 88,
    accelStat: 86,
    gripStat: 82,
    topSpeed: 39,
    accel: 27,
    handling: 2.5,
    mass: 0.9,
    bodyColor: 0x590d18,
    canopyColor: 0xd4af37
  },
  car: {
    id: 'car',
    name: 'MARUTI SUZUKI SWIFT',
    hindiName: 'मारुति सुजुकी स्विफ्ट',
    plate: 'RJ 14 CA 0001',
    category: 'SWIFT ZXI+ • DUAL TONE',
    speedStat: 94,
    accelStat: 88,
    gripStat: 88,
    topSpeed: 42,
    accel: 28,
    handling: 2.45,
    mass: 1.5,
    bodyColor: 0xc1121f,
    canopyColor: 0x0f1319
  },
  bus: {
    id: 'bus',
    name: 'JCTSL JAIPUR LOW-FLOOR BUS',
    hindiName: 'जयपुर लो-फ्लोर सिटी बस',
    plate: 'RJ 14 PB 5500',
    category: 'JCTSL MARCOPOLO • AC',
    speedStat: 82,
    accelStat: 70,
    gripStat: 78,
    topSpeed: 36,
    accel: 19,
    handling: 2.0,
    mass: 3.4,
    bodyColor: 0x9b111e,
    canopyColor: 0xf5f0e6
  },
  erickshaw: {
    id: 'erickshaw',
    name: 'JAIPUR TIRRI E-RICKSHAW',
    hindiName: 'जयपुर ई-रिक्शा टिर्री',
    plate: 'RJ 14 ER 1088',
    category: 'ELECTRIC TOTO • EV',
    speedStat: 62,
    accelStat: 84,
    gripStat: 90,
    topSpeed: 29,
    accel: 23,
    handling: 2.65,
    mass: 0.95,
    bodyColor: 0x0353a4,
    canopyColor: 0xb51737
  }
};

let SHARED_TEXTURES = null;
function getVehicleTextures() {
  if (SHARED_TEXTURES) return SHARED_TEXTURES;

  const can = document.createElement('canvas');
  can.width = 128;
  can.height = 128;
  const ctx = can.getContext('2d');
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = '#404040';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(6, 6, 116, 116);
  const fabricBump = new THREE.CanvasTexture(can);
  fabricBump.wrapS = THREE.RepeatWrapping;
  fabricBump.wrapT = THREE.RepeatWrapping;

  const tCan = document.createElement('canvas');
  tCan.width = 128;
  tCan.height = 32;
  const tCtx = tCan.getContext('2d');
  tCtx.fillStyle = '#303030';
  tCtx.fillRect(0, 0, 128, 32);
  tCtx.fillStyle = '#e0e0e0';
  for (let x = 0; x < 128; x += 8) {
    tCtx.fillRect(x, 2, 4, 12);
    tCtx.fillRect(x + 2, 18, 4, 12);
  }
  const tireBump = new THREE.CanvasTexture(tCan);
  tireBump.wrapS = THREE.RepeatWrapping;
  tireBump.wrapT = THREE.RepeatWrapping;
  tireBump.repeat.set(5, 1);

  const sCan = document.createElement('canvas');
  sCan.width = 128;
  sCan.height = 128;
  const sCtx = sCan.getContext('2d');
  const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0,0,0,0.82)');
  grad.addColorStop(0.65, 'rgba(0,0,0,0.42)');
  grad.addColorStop(1, 'rgba(0,0,0,0.0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 128, 128);
  const shadowTex = new THREE.CanvasTexture(sCan);

  SHARED_TEXTURES = { fabricBump, tireBump, shadowTex };
  return SHARED_TEXTURES;
}

function makeTextCanvasTexture(text, opts = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = opts.width || 512;
  canvas.height = opts.height || 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = opts.bg || '#f7c61b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (opts.border) {
    ctx.strokeStyle = opts.border;
    ctx.lineWidth = opts.borderWidth || 8;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  }

  ctx.fillStyle = opts.color || '#111111';
  ctx.font = opts.font || '900 50px "Chakra Petch", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createCarPaintMaterial(hexColor, roughness = 0.16, metalness = 0.55) {
  if (THREE.MeshPhysicalMaterial) {
    return new THREE.MeshPhysicalMaterial({
      color: hexColor,
      roughness,
      metalness,
      clearcoat: 0.92,
      clearcoatRoughness: 0.08,
      side: THREE.DoubleSide
    });
  }
  return new THREE.MeshStandardMaterial({
    color: hexColor,
    roughness,
    metalness,
    side: THREE.DoubleSide
  });
}

function createChromeMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.95,
    roughness: 0.08,
    side: THREE.DoubleSide
  });
}

function createGlassMaterial(tint = 0x101c28, opacity = 0.78) {
  return new THREE.MeshStandardMaterial({
    color: tint,
    metalness: 0.88,
    roughness: 0.08,
    transparent: true,
    opacity,
    side: THREE.DoubleSide
  });
}

function createFabricCanopyMaterial(hexColor) {
  const { fabricBump } = getVehicleTextures();
  return new THREE.MeshStandardMaterial({
    color: hexColor,
    roughness: 0.68,
    metalness: 0.04,
    bumpMap: fabricBump,
    bumpScale: 0.02,
    side: THREE.DoubleSide
  });
}

// True 10-point closed automotive body cross-section loft (flat roof across wTop, sculpted beltline wMid, solid underbody wBot)
function buildLoftedShellGeometry(slices) {
  const positions = [];
  const uvs = [];
  const indices = [];

  const numSlices = slices.length;
  const ringVerts = 11; // 10 segments around closed perimeter

  for (let s = 0; s < numSlices; s++) {
    const sl = slices[s];
    const v = s / Math.max(1, numSlices - 1);
    const yB = sl.yBot;
    const yT = sl.yTop;
    const h = yT - yB;
    const arch = sl.arch !== undefined ? sl.arch : 0.04;

    const wb = sl.wBot * 0.5;
    const wm = sl.wMid * 0.5;
    const wt = sl.wTop * 0.5;

    // Counter-clockwise perimeter when viewed from +Z (front)
    const pts = [
      [0, yB],                           // 0: Bottom center
      [-wb, yB],                         // 1: Bottom-left underbody
      [-wm, yB + h * 0.22],              // 2: Lower-left sill
      [-wm, yB + h * 0.68],              // 3: Mid-left beltline / fender
      [-wt, yT],                         // 4: Top-left roof rail
      [-wt * 0.45, yT + arch * 0.85],    // 5: Roof crown left
      [wt * 0.45, yT + arch * 0.85],     // 6: Roof crown right
      [wt, yT],                          // 7: Top-right roof rail
      [wm, yB + h * 0.68],               // 8: Mid-right beltline / fender
      [wm, yB + h * 0.22],               // 9: Lower-right sill
      [0, yB]                            // 10: Back to bottom center
    ];

    for (let r = 0; r < ringVerts; r++) {
      const u = r / (ringVerts - 1);
      positions.push(pts[r][0], pts[r][1], sl.z);
      uvs.push(u, v);
    }
  }

  for (let s = 0; s < numSlices - 1; s++) {
    for (let r = 0; r < ringVerts - 1; r++) {
      const a = s * ringVerts + r;
      const b = a + 1;
      const c = (s + 1) * ringVerts + r;
      const d = c + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  // Rear endcap (s = 0)
  const rearCenterIdx = positions.length / 3;
  const s0 = slices[0];
  positions.push(0, (s0.yBot + s0.yTop) * 0.5, s0.z);
  uvs.push(0.5, 0);
  for (let r = 0; r < ringVerts - 1; r++) {
    indices.push(rearCenterIdx, r, r + 1);
  }

  // Front endcap (s = numSlices - 1)
  const frontCenterIdx = positions.length / 3;
  const sLast = slices[numSlices - 1];
  const lastBase = (numSlices - 1) * ringVerts;
  positions.push(0, (sLast.yBot + sLast.yTop) * 0.5, sLast.z);
  uvs.push(0.5, 1);
  for (let r = 0; r < ringVerts - 1; r++) {
    indices.push(frontCenterIdx, lastBase + r + 1, lastBase + r);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function addContactShadow(root, width = 1.8, length = 3.2) {
  const { shadowTex } = getVehicleTextures();
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(width, length),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false
    })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0.03;
  root.add(plane);
}

function createDetailedWheel(radius = 0.34, width = 0.24, isAlloy = true) {
  const group = new THREE.Group();
  const { tireBump } = getVehicleTextures();

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x141518,
    roughness: 0.82,
    metalness: 0.06,
    bumpMap: tireBump,
    bumpScale: 0.02
  });

  const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 20);
  tireGeo.rotateZ(Math.PI / 2);
  const tire = new THREE.Mesh(tireGeo, tireMat);
  group.add(tire);

  const rimRadius = radius * 0.64;
  const rimGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, width + 0.015, 16);
  rimGeo.rotateZ(Math.PI / 2);
  const rimMat = new THREE.MeshStandardMaterial({
    color: isAlloy ? 0xe2e8f0 : 0x94a3b8,
    metalness: 0.88,
    roughness: 0.18
  });
  group.add(new THREE.Mesh(rimGeo, rimMat));

  if (isAlloy) {
    const spokeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    for (let i = 0; i < 5; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(width + 0.025, rimRadius * 1.76, 0.048), spokeMat);
      spoke.rotation.x = (i / 5) * Math.PI * 2;
      group.add(spoke);
    }
  }

  return group;
}

function createRealisticDriver(shirtColor = 0xe9c46a, pantsColor = 0x264653, hasHelmet = false, helmetColor = 0xd90429) {
  const driver = new THREE.Group();
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.72 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xb57c4e, roughness: 0.65 });

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.19, 0.56, 12), shirtMat);
  torso.scale.set(1.18, 1, 0.78);
  torso.position.set(0, 0.36, 0);
  driver.add(torso);

  const shoulders = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), shirtMat);
  shoulders.scale.set(1.25, 0.45, 0.75);
  shoulders.position.set(0, 0.62, 0);
  driver.add(shoulders);

  [-0.25, 0.25].forEach((x) => {
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.34, 8), shirtMat);
    upperArm.position.set(x, 0.52, 0.14);
    upperArm.rotation.x = Math.PI / 3;
    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.042, 0.3, 8), skinMat);
    forearm.position.set(x * 0.9, 0.42, 0.36);
    forearm.rotation.x = Math.PI / 2.2;
    driver.add(upperArm, forearm);
  });

  if (hasHelmet) {
    const helmetMat = createCarPaintMaterial(helmetColor, 0.1, 0.4);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), helmetMat);
    helmet.scale.set(0.95, 1.02, 1.12);
    helmet.position.set(0, 0.88, 0.04);
    driver.add(helmet);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.18), createGlassMaterial(0x0b0f19, 0.92));
    visor.position.set(0, 0.89, 0.16);
    driver.add(visor);
  } else {
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), skinMat);
    head.position.set(0, 0.86, 0.03);
    const pagdi = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.07, 8, 14),
      new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.55 })
    );
    pagdi.rotation.x = Math.PI / 2;
    pagdi.position.set(0, 0.96, 0.02);
    driver.add(head, pagdi);
  }

  return driver;
}

// ============================================================================
// 1. BAJAJ RE JAIPUR AUTO RICKSHAW
// ============================================================================
function buildAutoMesh(bodyColor = 0x085c30, canopyColor = 0xdba412, plateText = 'RJ 14 PA 4207') {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);
  addContactShadow(root, 1.7, 2.7);

  const greenPaint = createCarPaintMaterial(bodyColor, 0.2, 0.45);
  const yellowCanopy = createFabricCanopyMaterial(canopyColor);
  const blackRubber = new THREE.MeshStandardMaterial({ color: 0x16181d, roughness: 0.88 });
  const chrome = createChromeMaterial();
  const glass = createGlassMaterial(0x8ecae6, 0.45);

  const rearShellGeo = buildLoftedShellGeometry([
    { z: -1.22, wBot: 1.44, wMid: 1.54, wTop: 1.42, yBot: 0.36, yTop: 1.06, arch: 0.04 },
    { z: -0.95, wBot: 1.56, wMid: 1.66, wTop: 1.48, yBot: 0.34, yTop: 1.08, arch: 0.05 },
    { z: -0.45, wBot: 1.56, wMid: 1.66, wTop: 1.48, yBot: 0.34, yTop: 1.04, arch: 0.04 },
    { z: -0.15, wBot: 1.44, wMid: 1.50, wTop: 1.42, yBot: 0.34, yTop: 0.82, arch: 0.02 },
    { z: 0.35,  wBot: 1.36, wMid: 1.40, wTop: 1.34, yBot: 0.34, yTop: 0.48, arch: 0.01 }
  ]);
  const rearShell = new THREE.Mesh(rearShellGeo, greenPaint);
  rearShell.castShadow = true;
  bodyGroup.add(rearShell);

  const frontNoseGeo = buildLoftedShellGeometry([
    { z: 0.35, wBot: 1.32, wMid: 1.36, wTop: 1.28, yBot: 0.34, yTop: 0.48, arch: 0.02 },
    { z: 0.68, wBot: 1.28, wMid: 1.36, wTop: 1.26, yBot: 0.36, yTop: 1.12, arch: 0.06 },
    { z: 0.96, wBot: 0.98, wMid: 1.12, wTop: 0.98, yBot: 0.40, yTop: 1.08, arch: 0.08 },
    { z: 1.18, wBot: 0.56, wMid: 0.68, wTop: 0.52, yBot: 0.44, yTop: 0.92, arch: 0.06 }
  ]);
  bodyGroup.add(new THREE.Mesh(frontNoseGeo, greenPaint));

  const canopyRoofGeo = buildLoftedShellGeometry([
    { z: -1.18, wBot: 1.42, wMid: 1.46, wTop: 1.28, yBot: 1.80, yTop: 1.98, arch: 0.14 },
    { z: -0.55, wBot: 1.46, wMid: 1.50, wTop: 1.34, yBot: 1.84, yTop: 2.02, arch: 0.15 },
    { z: 0.25,  wBot: 1.42, wMid: 1.46, wTop: 1.32, yBot: 1.82, yTop: 1.98, arch: 0.14 },
    { z: 0.82,  wBot: 1.30, wMid: 1.34, wTop: 1.18, yBot: 1.70, yTop: 1.85, arch: 0.10 }
  ]);
  const canopyRoof = new THREE.Mesh(canopyRoofGeo, yellowCanopy);
  canopyRoof.castShadow = true;
  bodyGroup.add(canopyRoof);

  [-0.54, 0.54].forEach((x) => {
    const cornerPillar = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.78, 0.18), yellowCanopy);
    cornerPillar.position.set(x, 1.44, -1.12);
    cornerPillar.rotation.z = x > 0 ? 0.08 : -0.08;
    bodyGroup.add(cornerPillar);
  });

  const lowerValance = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.22, 0.12), yellowCanopy);
  lowerValance.position.set(0, 1.15, -1.16);
  bodyGroup.add(lowerValance);

  [[-0.66, -0.45], [0.66, -0.45], [-0.66, 0.22], [0.66, 0.22], [-0.60, 0.78], [0.60, 0.78]].forEach(([x, z]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.96, 8), blackRubber);
    post.position.set(x, 1.42, z);
    bodyGroup.add(post);
  });

  const wsGlass = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.62, 0.06), glass);
  wsGlass.position.set(0, 1.42, 0.85);
  wsGlass.rotation.x = -0.22;
  bodyGroup.add(wsGlass);

  const rearWinGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 0.52), glass);
  rearWinGlass.position.set(0, 1.52, -1.16);
  rearWinGlass.rotation.y = Math.PI;
  bodyGroup.add(rearWinGlass);

  const sloganTex = makeTextCanvasTexture('KEEP DISTANCE • पधारो म्हारे देश', {
    width: 512,
    height: 76,
    bg: '#dba412',
    color: '#141414',
    border: '#085c30',
    font: '900 26px "Noto Sans Devanagari", "Chakra Petch", sans-serif'
  });
  const slogan = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.14), new THREE.MeshBasicMaterial({ map: sloganTex }));
  slogan.position.set(0, 1.15, -1.23);
  slogan.rotation.y = Math.PI;
  bodyGroup.add(slogan);

  const plateTex = makeTextCanvasTexture(plateText, { bg: '#ffcf24', color: '#111', border: '#111' });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.12), new THREE.MeshBasicMaterial({ map: plateTex }));
  plate.position.set(0, 0.52, -1.26);
  plate.rotation.y = Math.PI;
  bodyGroup.add(plate);

  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1423 });
  [-0.56, 0.56].forEach((x) => {
    const redLens = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.07), tailMat);
    redLens.position.set(x, 0.72, -1.24);
    bodyGroup.add(redLens);
  });

  const seatMat = new THREE.MeshStandardMaterial({ color: 0x4a151b, roughness: 0.55 });
  const bench = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.22, 0.46), seatMat);
  bench.position.set(0, 0.74, -0.52);
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.36, 0.12), seatMat);
  backrest.position.set(0, 1.02, -0.74);
  bodyGroup.add(bench, backrest);

  const driver = createRealisticDriver(0xd4a373, 0x1d3557, false);
  driver.position.set(0, 0.76, 0.18);
  bodyGroup.add(driver);

  const wFront = createDetailedWheel(0.28, 0.18, false);
  wFront.position.set(0, 0.28, 1.15);
  const wRL = createDetailedWheel(0.31, 0.21, false);
  wRL.position.set(-0.74, 0.31, -0.68);
  const wRR = createDetailedWheel(0.31, 0.21, false);
  wRR.position.set(0.74, 0.31, -0.68);
  root.add(wFront, wRL, wRR);

  root.userData = { bodyGroup, wheels: [wFront, wRL, wRR], leanGroup: bodyGroup, tailMat };
  return root;
}

// ============================================================================
// 2. HONDA ACTIVA 6G 125 SCOOTER
// ============================================================================
function buildScooterMesh(bodyColor = 0xf1efe9, seatColor = 0x5c2c16) {
  const root = new THREE.Group();
  const leanGroup = new THREE.Group();
  root.add(leanGroup);
  addContactShadow(root, 1.0, 2.2);

  const paintMat = createCarPaintMaterial(bodyColor, 0.15, 0.55);
  const chrome = createChromeMaterial();
  const seatMat = new THREE.MeshStandardMaterial({ color: seatColor, roughness: 0.48 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x161920, roughness: 0.8 });

  // Sculpted Rear Under-Seat Side Panels of Activa 6G
  const rearBody = new THREE.Mesh(
    buildLoftedShellGeometry([
      { z: -0.96, wBot: 0.36, wMid: 0.48, wTop: 0.38, yBot: 0.42, yTop: 0.84, arch: 0.04 },
      { z: -0.45, wBot: 0.54, wMid: 0.68, wTop: 0.56, yBot: 0.34, yTop: 0.86, arch: 0.05 },
      { z: 0.02,  wBot: 0.48, wMid: 0.54, wTop: 0.46, yBot: 0.28, yTop: 0.52, arch: 0.02 }
    ]),
    paintMat
  );
  rearBody.castShadow = true;
  leanGroup.add(rearBody);

  // Activa 6G Chrome Side Garnish Strips
  [-0.31, 0.31].forEach((x) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.58), chrome);
    strip.position.set(x, 0.62, -0.52);
    leanGroup.add(strip);
  });

  // Flat Floorboard
  const floorboard = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.62), blackMat);
  floorboard.position.set(0, 0.28, 0.25);
  leanGroup.add(floorboard);

  // Curved Front Legshield Apron + Chrome Signature V-Grille
  const frontApron = new THREE.Mesh(
    buildLoftedShellGeometry([
      { z: 0.44, wBot: 0.52, wMid: 0.62, wTop: 0.50, yBot: 0.30, yTop: 1.08, arch: 0.04 },
      { z: 0.72, wBot: 0.42, wMid: 0.52, wTop: 0.38, yBot: 0.42, yTop: 1.12, arch: 0.06 }
    ]),
    paintMat
  );
  frontApron.castShadow = true;
  leanGroup.add(frontApron);

  // Handlebar Cowl, LED Headlamp Lens & Dual Chrome Mirrors (Activa 6G)
  const cowl = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), paintMat);
  cowl.scale.set(1.3, 0.75, 1.0);
  cowl.position.set(0, 1.18, 0.56);
  leanGroup.add(cowl);

  const ledLens = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.10, 0.06),
    new THREE.MeshBasicMaterial({ color: 0xe0f2fe })
  );
  ledLens.position.set(0, 1.19, 0.68);
  leanGroup.add(ledLens);

  const chromeV = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.05), chrome);
  chromeV.position.set(0, 0.92, 0.72);
  leanGroup.add(chromeV);

  [-0.36, 0.36].forEach((x) => {
    const mirrorStem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.16, 6), blackMat);
    mirrorStem.position.set(x, 1.28, 0.52);
    const mirrorPod = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.04), blackMat);
    mirrorPod.position.set(x * 1.12, 1.36, 0.52);
    leanGroup.add(mirrorStem, mirrorPod);
  });

  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.76, 8), chrome);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 1.18, 0.52);
  leanGroup.add(bar);

  // Contoured Dual Seat + Chrome Pillion Grab Rail
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.82), seatMat);
  seat.position.set(0, 0.88, -0.42);
  leanGroup.add(seat);

  const grabRail = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.022, 8, 14, Math.PI), chrome);
  grabRail.rotation.x = Math.PI / 2;
  grabRail.position.set(0, 0.89, -0.82);
  leanGroup.add(grabRail);

  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1423 });
  const tailLamp = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.06), tailMat);
  tailLamp.position.set(0, 0.74, -0.97);
  leanGroup.add(tailLamp);

  const plateTex = makeTextCanvasTexture('RJ 14 SC 7711', { bg: '#ffffff', color: '#111', border: '#111' });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.10), new THREE.MeshBasicMaterial({ map: plateTex }));
  plate.position.set(0, 0.54, -0.98);
  plate.rotation.y = Math.PI;
  leanGroup.add(plate);

  const rider = createRealisticDriver(0x0284c7, 0x1e293b, true, 0xfacc15);
  rider.position.set(0, 0.82, -0.18);
  leanGroup.add(rider);

  const wF = createDetailedWheel(0.25, 0.14, true);
  wF.position.set(0, 0.25, 0.72);
  const wR = createDetailedWheel(0.25, 0.15, true);
  wR.position.set(0, 0.25, -0.68);
  leanGroup.add(wF, wR);

  root.userData = { bodyGroup: leanGroup, wheels: [wF, wR], leanGroup, isTwoWheeler: true, tailMat };
  return root;
}

// ============================================================================
// 3. HERO XPULSE 200 4V RALLY EDITION (Adventure Dual-Sport Motorcycle)
// ============================================================================
function buildXPulseMesh() {
  const root = new THREE.Group();
  const leanGroup = new THREE.Group();
  root.add(leanGroup);
  addContactShadow(root, 1.05, 2.45);

  const whitePaint = createCarPaintMaterial(0xf8fafc, 0.15, 0.4);
  const rallyRed = createCarPaintMaterial(0xe11d48, 0.18, 0.45);
  const rallyBlue = createCarPaintMaterial(0x0284c7, 0.18, 0.45);
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x14161c, roughness: 0.75 });
  const chrome = createChromeMaterial();

  // Tall Long-Travel Front Telescopic Forks with Rubber Gaiters
  [-0.12, 0.12].forEach((x) => {
    const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.022, 0.98, 10), chrome);
    fork.position.set(x, 0.72, 0.68);
    fork.rotation.x = -0.36;
    leanGroup.add(fork);
  });

  // Signature High-Mounted XPulse Front Rally Beak Fender!
  const rallyBeak = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.52), whitePaint);
  rallyBeak.position.set(0, 0.94, 0.86);
  rallyBeak.rotation.x = 0.22;
  leanGroup.add(rallyBeak);

  // Round LED Headlamp + Tall Transparent Rally Windscreen Visor
  const headlamp = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.12, 16), chrome);
  headlamp.rotation.x = Math.PI / 2;
  headlamp.position.set(0, 1.12, 0.72);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 0.03), createGlassMaterial(0x1e293b, 0.65));
  visor.position.set(0, 1.32, 0.68);
  visor.rotation.x = -0.28;
  leanGroup.add(headlamp, visor);

  // Wide Dirt-Bike Handlebars + Red/White Barkbuster Knuckle Guards!
  const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.86, 8), chrome);
  handlebar.rotation.z = Math.PI / 2;
  handlebar.position.set(0, 1.26, 0.48);
  leanGroup.add(handlebar);
  [-0.38, 0.38].forEach((x) => {
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.08), rallyRed);
    guard.position.set(x, 1.26, 0.54);
    leanGroup.add(guard);
  });

  // Sculpted White & Red/Blue Rally Fuel Tank with Tank Shrouds
  const tank = new THREE.Mesh(
    buildLoftedShellGeometry([
      { z: -0.05, wBot: 0.32, wMid: 0.44, wTop: 0.30, yBot: 0.82, yTop: 1.16, arch: 0.06 },
      { z: 0.25,  wBot: 0.40, wMid: 0.54, wTop: 0.38, yBot: 0.82, yTop: 1.22, arch: 0.08 },
      { z: 0.52,  wBot: 0.30, wMid: 0.40, wTop: 0.26, yBot: 0.86, yTop: 1.14, arch: 0.05 }
    ]),
    whitePaint
  );
  leanGroup.add(tank);

  [-0.24, 0.24].forEach((x) => {
    const shroud = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.26, 0.42), rallyRed);
    shroud.position.set(x, 0.98, 0.28);
    const blueStripe = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.08, 0.38), rallyBlue);
    blueStripe.position.set(x, 0.90, 0.28);
    leanGroup.add(shroud, blueStripe);
  });

  // High-clearance Dual-Sport Rally Bench Seat & Upswept Tail Section
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.78), rallyRed);
  seat.position.set(0, 0.94, -0.38);
  seat.rotation.x = 0.08;
  leanGroup.add(seat);

  // High-Mounted Upswept Rally Exhaust Muffler on Right Side
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.048, 0.68, 12), chrome);
  exhaust.rotation.x = Math.PI / 2 - 0.26;
  exhaust.position.set(0.22, 0.84, -0.58);
  leanGroup.add(exhaust);

  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1423 });
  const tailLight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.06), tailMat);
  tailLight.position.set(0, 0.98, -0.88);
  leanGroup.add(tailLight);

  const plateTex = makeTextCanvasTexture('RJ 14 XP 2004', { bg: '#ffffff', color: '#111', border: '#111' });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.10), new THREE.MeshBasicMaterial({ map: plateTex }));
  plate.position.set(0, 0.84, -0.92);
  plate.rotation.y = Math.PI;
  leanGroup.add(plate);

  const rider = createRealisticDriver(0xe11d48, 0x0f172a, true, 0xf8fafc);
  rider.position.set(0, 0.92, -0.14);
  rider.rotation.x = 0.14;
  leanGroup.add(rider);

  // 21-inch Large Front Rally Wheel & 18-inch Rear Knobby Wheel
  const wF = createDetailedWheel(0.36, 0.14, true);
  wF.position.set(0, 0.36, 0.88);
  const wR = createDetailedWheel(0.33, 0.18, true);
  wR.position.set(0, 0.33, -0.74);
  leanGroup.add(wF, wR);

  root.userData = { bodyGroup: leanGroup, wheels: [wF, wR], leanGroup, isTwoWheeler: true, tailMat };
  return root;
}

// ============================================================================
// 4. ROYAL ENFIELD CLASSIC 350 REBORN (Cruiser Thumper)
// ============================================================================
function buildBikeMesh(bodyColor = 0x590d18, trimColor = 0xd4af37) {
  const root = new THREE.Group();
  const leanGroup = new THREE.Group();
  root.add(leanGroup);
  addContactShadow(root, 1.05, 2.4);

  const maroonPaint = createCarPaintMaterial(bodyColor, 0.12, 0.65);
  const goldMat = new THREE.MeshStandardMaterial({ color: trimColor, metalness: 0.85, roughness: 0.2 });
  const chrome = createChromeMaterial();
  const leatherMat = new THREE.MeshStandardMaterial({ color: 0x4a2511, roughness: 0.5 });

  // Classic Teardrop Fuel Tank with Gold Pinstripe & Chrome Knee Pads
  const tank = new THREE.Mesh(
    buildLoftedShellGeometry([
      { z: -0.05, wBot: 0.32, wMid: 0.44, wTop: 0.32, yBot: 0.76, yTop: 1.06, arch: 0.06 },
      { z: 0.24,  wBot: 0.42, wMid: 0.56, wTop: 0.40, yBot: 0.76, yTop: 1.12, arch: 0.08 },
      { z: 0.50,  wBot: 0.30, wMid: 0.38, wTop: 0.26, yBot: 0.80, yTop: 1.04, arch: 0.05 }
    ]),
    maroonPaint
  );
  leanGroup.add(tank);

  // 350cc J-Series Finned Chrome Engine Block & Long Chrome Pea-Shooter Exhaust!
  const engineBlock = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.40), chrome);
  engineBlock.position.set(0, 0.52, 0.16);
  leanGroup.add(engineBlock);

  const exhaustPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.038, 1.38, 12), chrome);
  exhaustPipe.rotation.x = Math.PI / 2;
  exhaustPipe.position.set(0.24, 0.34, -0.28);
  leanGroup.add(exhaustPipe);

  // Curved Vintage Valanced Front & Rear Mudguards
  const rearFender = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.36, 0.24, 16, 1, false, 0, Math.PI),
    maroonPaint
  );
  rearFender.rotation.z = Math.PI / 2;
  rearFender.position.set(0, 0.34, -0.72);
  leanGroup.add(rearFender);

  // Sprung Brown Leather Rider Saddle + Pillion Pad
  const riderSeat = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.11, 0.42), leatherMat);
  riderSeat.position.set(0, 0.84, -0.24);
  const pillionSeat = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.10, 0.36), leatherMat);
  pillionSeat.position.set(0, 0.86, -0.64);
  leanGroup.add(riderSeat, pillionSeat);

  // Classic Round Headlamp Nacelle with Chrome HoodCasquette, Crash Guard & Mirrors
  const headlamp = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.16, 16), chrome);
  headlamp.rotation.x = Math.PI / 2;
  headlamp.position.set(0, 1.04, 0.68);
  const headLens = new THREE.Mesh(
    new THREE.CircleGeometry(0.13, 14),
    new THREE.MeshBasicMaterial({ color: 0xfef3c7 })
  );
  headLens.position.set(0, 1.04, 0.77);
  leanGroup.add(headlamp, headLens);

  // Iconic Chrome Leg / Crash Guard & Gold Tank Pinstripes
  const crashGuard = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.02, 8, 16), chrome);
  crashGuard.position.set(0, 0.62, 0.44);
  leanGroup.add(crashGuard);

  [-0.22, 0.22].forEach((x) => {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.44), goldMat);
    stripe.position.set(x, 0.96, 0.24);
    leanGroup.add(stripe);
  });

  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.82, 8), chrome);
  bar.rotation.z = Math.PI / 2;
  bar.position.set(0, 1.12, 0.46);
  leanGroup.add(bar);

  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1423 });
  const tailLamp = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 12), tailMat);
  tailLamp.rotation.x = Math.PI / 2;
  tailLamp.position.set(0, 0.68, -1.04);
  leanGroup.add(tailLamp);

  const plateTex = makeTextCanvasTexture('RJ 14 RE 0350', { bg: '#ffffff', color: '#111', border: '#111' });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.10), new THREE.MeshBasicMaterial({ map: plateTex }));
  plate.position.set(0, 0.54, -1.06);
  plate.rotation.y = Math.PI;
  leanGroup.add(plate);

  const rider = createRealisticDriver(0x1c1917, 0x1e3a8a, true, 0x590d18);
  rider.position.set(0, 0.84, -0.22);
  leanGroup.add(rider);

  const wF = createDetailedWheel(0.34, 0.15, true);
  wF.position.set(0, 0.34, 0.78);
  const wR = createDetailedWheel(0.34, 0.17, true);
  wR.position.set(0, 0.34, -0.72);
  leanGroup.add(wF, wR);

  root.userData = { bodyGroup: leanGroup, wheels: [wF, wR], leanGroup, isTwoWheeler: true, tailMat };
  return root;
}

// ============================================================================
// 5. MARUTI SUZUKI SWIFT DUAL-TONE (Fire Red & Midnight Black Roof)
// ============================================================================
function buildCarMesh(bodyColor = 0xc1121f, roofColor = 0x0f1319, plateText = 'RJ 14 CA 0001') {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);
  addContactShadow(root, 2.1, 3.85);

  const carPaint = createCarPaintMaterial(bodyColor, 0.12, 0.6);
  const blackRoofPaint = createCarPaintMaterial(roofColor, 0.14, 0.5);
  const glass = createGlassMaterial(0x0b131e, 0.82);
  const darkTrim = new THREE.MeshStandardMaterial({ color: 0x14171d, roughness: 0.7 });
  const chrome = createChromeMaterial();

  // Sculpted Maruti Swift Lower Body with Wide Rear Shoulder Haunches
  const lowerBodyGeo = buildLoftedShellGeometry([
    { z: -1.78, wBot: 1.72, wMid: 1.88, wTop: 1.72, yBot: 0.34, yTop: 1.02, arch: 0.06 },
    { z: -1.15, wBot: 1.88, wMid: 1.98, wTop: 1.80, yBot: 0.30, yTop: 1.06, arch: 0.06 },
    { z: 0.0,   wBot: 1.82, wMid: 1.94, wTop: 1.78, yBot: 0.30, yTop: 1.02, arch: 0.04 },
    { z: 1.12,  wBot: 1.86, wMid: 1.96, wTop: 1.78, yBot: 0.30, yTop: 0.96, arch: 0.06 },
    { z: 1.76,  wBot: 1.62, wMid: 1.74, wTop: 1.56, yBot: 0.32, yTop: 0.78, arch: 0.08 }
  ]);
  const lowerBody = new THREE.Mesh(lowerBodyGeo, carPaint);
  lowerBody.castShadow = true;
  bodyGroup.add(lowerBody);

  // Wrap-Around Blacked-Out A/B/C Pillar Cabin Greenhouse
  const cabinGeo = buildLoftedShellGeometry([
    { z: -1.56, wBot: 1.66, wMid: 1.58, wTop: 1.32, yBot: 0.98, yTop: 1.18, arch: 0.04 },
    { z: -1.12, wBot: 1.72, wMid: 1.62, wTop: 1.38, yBot: 1.02, yTop: 1.52, arch: 0.10 },
    { z: 0.18,  wBot: 1.72, wMid: 1.62, wTop: 1.38, yBot: 0.98, yTop: 1.52, arch: 0.10 },
    { z: 0.84,  wBot: 1.66, wMid: 1.56, wTop: 1.34, yBot: 0.94, yTop: 1.08, arch: 0.04 }
  ]);
  bodyGroup.add(new THREE.Mesh(cabinGeo, glass));

  // Floating Contrast Midnight Black Roof + Integrated Rear Roof Spoiler
  const roofGeo = buildLoftedShellGeometry([
    { z: -1.38, wBot: 1.42, wMid: 1.44, wTop: 1.36, yBot: 1.46, yTop: 1.58, arch: 0.08 },
    { z: 0.22,  wBot: 1.42, wMid: 1.44, wTop: 1.36, yBot: 1.46, yTop: 1.56, arch: 0.08 }
  ]);
  bodyGroup.add(new THREE.Mesh(roofGeo, blackRoofPaint));

  // Front Honeycomb Grille + Chrome Suzuki 'S' Emblem + Swept LED Projector Headlamps + Side Mirrors
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.28, 0.06), darkTrim);
  grille.position.set(0, 0.62, 1.76);
  bodyGroup.add(grille);

  const ledHeadMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
  [-0.68, 0.68].forEach((x) => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.08), ledHeadMat);
    hl.position.set(x, 0.72, 1.72);
    const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.12), blackRoofPaint);
    mirror.position.set(x * 1.48, 1.04, 0.62);
    bodyGroup.add(hl, mirror);
  });

  // Suzuki 'S' Badge on Rear Hatch & Front Grille
  const sBadgeTex = makeTextCanvasTexture('S • SWIFT', {
    width: 256,
    height: 64,
    bg: '#111827',
    color: '#f8fafc',
    border: '#94a3b8'
  });
  const rearBadge = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.10), new THREE.MeshBasicMaterial({ map: sBadgeTex }));
  rearBadge.position.set(0, 0.92, -1.79);
  rearBadge.rotation.y = Math.PI;
  bodyGroup.add(rearBadge);

  // Rear Diffuser + Twin Exhausts + C-Shaped Swift LED Tail Lamps
  const diffuser = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.22, 0.08), darkTrim);
  diffuser.position.set(0, 0.40, -1.78);
  bodyGroup.add(diffuser);

  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1423 });
  [-0.68, 0.68].forEach((x) => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.24, 0.1), tailMat);
    tl.position.set(x, 0.88, -1.76);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.18, 10), chrome);
    tip.rotation.x = Math.PI / 2;
    tip.position.set(x * 0.78, 0.36, -1.8);
    bodyGroup.add(tl, tip);
  });

  const plateTex = makeTextCanvasTexture(plateText, { bg: '#ffffff', color: '#111111', border: '#111111' });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.14), new THREE.MeshBasicMaterial({ map: plateTex }));
  plate.position.set(0, 0.62, -1.8);
  plate.rotation.y = Math.PI;
  bodyGroup.add(plate);

  const wheels = [];
  [[-0.93, 1.12], [0.93, 1.12], [-0.93, -1.12], [0.93, -1.12]].forEach(([x, z]) => {
    const w = createDetailedWheel(0.38, 0.26, true);
    w.position.set(x, 0.38, z);
    root.add(w);
    wheels.push(w);
  });

  root.userData = { bodyGroup, wheels, leanGroup: bodyGroup, tailMat };
  return root;
}

// ============================================================================
// 6. JCTSL JAIPUR LOW-FLOOR AC CITY BUS (Tata Marcopolo Red & Ivory Livery)
// ============================================================================
function buildBusMesh(bodyColor = 0x9b111e, creamColor = 0xf5f0e6, plateText = 'RJ 14 PB 5500') {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);
  addContactShadow(root, 2.8, 6.2);

  const redLivery = createCarPaintMaterial(bodyColor, 0.18, 0.45);
  const ivoryLivery = createCarPaintMaterial(creamColor, 0.22, 0.3);
  const greenBandMat = createCarPaintMaterial(0x15803d, 0.25, 0.3);
  const glass = createGlassMaterial(0x0b1929, 0.76);
  const blackTrim = new THREE.MeshStandardMaterial({ color: 0x14171f, roughness: 0.7 });

  const lowerCoach = new THREE.Mesh(
    buildLoftedShellGeometry([
      { z: -2.95, wBot: 2.42, wMid: 2.50, wTop: 2.46, yBot: 0.36, yTop: 1.34, arch: 0.04 },
      { z: 0.0,   wBot: 2.44, wMid: 2.52, wTop: 2.48, yBot: 0.36, yTop: 1.34, arch: 0.04 },
      { z: 2.95,  wBot: 2.38, wMid: 2.46, wTop: 2.42, yBot: 0.36, yTop: 1.32, arch: 0.06 }
    ]),
    redLivery
  );
  lowerCoach.castShadow = true;
  bodyGroup.add(lowerCoach);

  const upperCoach = new THREE.Mesh(
    buildLoftedShellGeometry([
      { z: -2.94, wBot: 2.46, wMid: 2.48, wTop: 2.28, yBot: 1.30, yTop: 2.74, arch: 0.14 },
      { z: 0.0,   wBot: 2.48, wMid: 2.50, wTop: 2.30, yBot: 1.30, yTop: 2.76, arch: 0.15 },
      { z: 2.92,  wBot: 2.42, wMid: 2.44, wTop: 2.24, yBot: 1.30, yTop: 2.72, arch: 0.14 }
    ]),
    ivoryLivery
  );
  upperCoach.castShadow = true;
  bodyGroup.add(upperCoach);

  // JCTSL Signature Green & Gold Waistline Belt Stripe
  const beltStripe = new THREE.Mesh(new THREE.BoxGeometry(2.53, 0.14, 5.82), greenBandMat);
  beltStripe.position.set(0, 1.32, 0);
  bodyGroup.add(beltStripe);

  const sideWin = new THREE.Mesh(new THREE.BoxGeometry(2.51, 0.94, 5.2), glass);
  sideWin.position.set(0, 1.98, 0);
  const rearWin = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.72, 0.12), glass);
  rearWin.position.set(0, 2.02, -2.93);
  const frontWin = new THREE.Mesh(new THREE.BoxGeometry(2.26, 1.08, 0.12), glass);
  frontWin.position.set(0, 1.92, 2.93);
  bodyGroup.add(sideWin, rearWin, frontWin);

  // Rooftop Tata Marcopolo AC Pod + Window Pillars
  const acPod = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.28, 3.2), ivoryLivery);
  acPod.position.set(0, 2.94, -0.2);
  bodyGroup.add(acPod);

  for (let wz = -2.2; wz <= 2.2; wz += 1.1) {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(2.53, 0.94, 0.08), blackTrim);
    mullion.position.set(0, 1.98, wz);
    bodyGroup.add(mullion);
  }

  const engineGrille = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.48, 0.06), blackTrim);
  engineGrille.position.set(0, 0.96, -2.96);
  bodyGroup.add(engineGrille);

  const routeTex = makeTextCanvasTexture('रूट 3A: बड़ी चौपड़ • हवा महल • WTP • मानसरोवर • आमेर', {
    width: 768,
    height: 84,
    bg: '#0d1117',
    color: '#ffaa00',
    border: '#30363d',
    font: '900 30px "Noto Sans Devanagari", "Chakra Petch", sans-serif'
  });
  const routeBack = new THREE.Mesh(new THREE.PlaneGeometry(1.92, 0.26), new THREE.MeshBasicMaterial({ map: routeTex }));
  routeBack.position.set(0, 2.52, -2.96);
  routeBack.rotation.y = Math.PI;
  const routeFront = routeBack.clone();
  routeFront.position.set(0, 2.52, 2.96);
  routeFront.rotation.y = 0;
  bodyGroup.add(routeBack, routeFront);

  const jctslTex = makeTextCanvasTexture('JCTSL JAIPUR CITY TRANSPORT • लो-फ्लोर बस', {
    width: 640,
    height: 72,
    bg: '#9b111e',
    color: '#ffd84d',
    border: '#f5f0e6',
    font: '900 28px "Noto Sans Devanagari", "Chakra Petch", sans-serif'
  });
  const rearSign = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 0.22), new THREE.MeshBasicMaterial({ map: jctslTex }));
  rearSign.position.set(0, 1.46, -2.96);
  rearSign.rotation.y = Math.PI;
  bodyGroup.add(rearSign);

  const plateTex = makeTextCanvasTexture(plateText, { bg: '#ffcf24', color: '#111', border: '#111' });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.17), new THREE.MeshBasicMaterial({ map: plateTex }));
  plate.position.set(0, 0.62, -2.96);
  plate.rotation.y = Math.PI;
  bodyGroup.add(plate);

  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1423 });
  [-1.02, 1.02].forEach((x) => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.52, 0.08), tailMat);
    tl.position.set(x, 0.88, -2.95);
    bodyGroup.add(tl);
  });

  const wheels = [];
  [[-1.2, 1.85], [1.2, 1.85], [-1.2, -1.2], [1.2, -1.2], [-1.2, -2.05], [1.2, -2.05]].forEach(([x, z]) => {
    const w = createDetailedWheel(0.46, 0.32, false);
    w.position.set(x, 0.46, z);
    root.add(w);
    wheels.push(w);
  });

  root.userData = { bodyGroup, wheels, leanGroup: bodyGroup, tailMat };
  return root;
}

// ============================================================================
// 7. JAIPUR TIRRI E-RICKSHAW
// ============================================================================
function buildERickshawMesh(bodyColor = 0x0353a4, canopyColor = 0xb51737, plateText = 'RJ 14 ER 1088') {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);
  addContactShadow(root, 1.65, 2.75);

  const paintMat = createCarPaintMaterial(bodyColor, 0.18, 0.5);
  const roofMat = createFabricCanopyMaterial(canopyColor);
  const chrome = createChromeMaterial();
  const glass = createGlassMaterial(0x90e0ef, 0.48);

  const rearTub = new THREE.Mesh(
    buildLoftedShellGeometry([
      { z: -1.24, wBot: 1.44, wMid: 1.50, wTop: 1.44, yBot: 0.36, yTop: 0.96, arch: 0.03 },
      { z: -0.92, wBot: 1.48, wMid: 1.54, wTop: 1.46, yBot: 0.36, yTop: 0.96, arch: 0.03 },
      { z: -0.82, wBot: 1.42, wMid: 1.46, wTop: 1.42, yBot: 0.36, yTop: 0.52, arch: 0.02 },
      { z: 0.55,  wBot: 1.38, wMid: 1.42, wTop: 1.38, yBot: 0.36, yTop: 0.50, arch: 0.01 }
    ]),
    paintMat
  );
  bodyGroup.add(rearTub);

  const frontNose = new THREE.Mesh(
    buildLoftedShellGeometry([
      { z: 0.55, wBot: 1.02, wMid: 1.08, wTop: 0.98, yBot: 0.38, yTop: 0.52, arch: 0.04 },
      { z: 0.82, wBot: 0.98, wMid: 1.06, wTop: 0.96, yBot: 0.38, yTop: 1.18, arch: 0.07 },
      { z: 1.14, wBot: 0.62, wMid: 0.72, wTop: 0.58, yBot: 0.42, yTop: 0.94, arch: 0.06 }
    ]),
    paintMat
  );
  bodyGroup.add(frontNose);

  const roofCanopy = new THREE.Mesh(
    buildLoftedShellGeometry([
      { z: -1.24, wBot: 1.48, wMid: 1.52, wTop: 1.38, yBot: 1.88, yTop: 2.02, arch: 0.12 },
      { z: 0.0,   wBot: 1.48, wMid: 1.52, wTop: 1.38, yBot: 1.90, yTop: 2.04, arch: 0.13 },
      { z: 0.86,  wBot: 1.18, wMid: 1.22, wTop: 1.08, yBot: 1.84, yTop: 1.96, arch: 0.09 }
    ]),
    roofMat
  );
  bodyGroup.add(roofCanopy);

  [[-0.68, -1.16], [0.68, -1.16], [-0.68, -0.15], [0.68, -0.15], [-0.52, 0.78], [0.52, 0.78]].forEach(([x, z]) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.08, 8), chrome);
    post.position.set(x, 1.40, z);
    bodyGroup.add(post);
  });

  const wsGlass = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.68, 0.06), glass);
  wsGlass.position.set(0, 1.48, 0.82);
  wsGlass.rotation.x = -0.14;
  bodyGroup.add(wsGlass);

  const spareWheel = createDetailedWheel(0.26, 0.15, false);
  spareWheel.rotation.y = Math.PI / 2;
  spareWheel.position.set(0, 0.84, -1.28);
  bodyGroup.add(spareWheel);

  const plateTex = makeTextCanvasTexture(plateText, { bg: '#ffcf24', color: '#111', border: '#111' });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.50, 0.12), new THREE.MeshBasicMaterial({ map: plateTex }));
  plate.position.set(0, 0.48, -1.26);
  plate.rotation.y = Math.PI;
  bodyGroup.add(plate);

  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1423 });
  [-0.54, 0.54].forEach((x) => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.11, 0.06), tailMat);
    tl.position.set(x, 0.58, -1.25);
    bodyGroup.add(tl);
  });

  const driver = createRealisticDriver(0xfbbf24, 0x1e293b, false);
  driver.position.set(0, 0.76, 0.25);
  bodyGroup.add(driver);

  const wFront = createDetailedWheel(0.28, 0.16, false);
  wFront.position.set(0, 0.28, 1.15);
  const wRL = createDetailedWheel(0.29, 0.18, false);
  wRL.position.set(-0.74, 0.29, -0.78);
  const wRR = createDetailedWheel(0.29, 0.18, false);
  wRR.position.set(0.74, 0.29, -0.78);
  root.add(wFront, wRL, wRR);

  root.userData = { bodyGroup, wheels: [wFront, wRL, wRR], leanGroup: bodyGroup, tailMat };
  return root;
}

// ============================================================================
// 8. RAJASTHAN POLICE BOLERO INTERCEPTOR (RJ 14 PC 112)
// ============================================================================
function buildPoliceSuvMesh() {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);
  addContactShadow(root, 2.2, 3.9);

  const whitePaint = createCarPaintMaterial(0xf4f6f9, 0.16, 0.4);
  const redStripeMat = createCarPaintMaterial(0xd90429, 0.22, 0.3);
  const blueStripeMat = createCarPaintMaterial(0x1d4ed8, 0.22, 0.3);
  const glass = createGlassMaterial(0x0f1b2d, 0.78);

  const lowerSuv = new THREE.Mesh(
    buildLoftedShellGeometry([
      { z: -1.86, wBot: 1.88, wMid: 1.96, wTop: 1.88, yBot: 0.42, yTop: 1.08, arch: 0.04 },
      { z: 0.85,  wBot: 1.90, wMid: 1.98, wTop: 1.90, yBot: 0.42, yTop: 1.08, arch: 0.04 },
      { z: 1.86,  wBot: 1.82, wMid: 1.90, wTop: 1.82, yBot: 0.42, yTop: 1.02, arch: 0.05 }
    ]),
    whitePaint
  );
  bodyGroup.add(lowerSuv);

  const upperSuv = new THREE.Mesh(
    buildLoftedShellGeometry([
      { z: -1.82, wBot: 1.86, wMid: 1.84, wTop: 1.72, yBot: 1.04, yTop: 1.88, arch: 0.06 },
      { z: 0.62,  wBot: 1.86, wMid: 1.84, wTop: 1.72, yBot: 1.04, yTop: 1.88, arch: 0.06 }
    ]),
    whitePaint
  );
  bodyGroup.add(upperSuv);

  const rearWin = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.54, 0.1), glass);
  rearWin.position.set(0, 1.52, -1.81);
  bodyGroup.add(rearWin);

  const stripeRed = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.13, 3.68), redStripeMat);
  stripeRed.position.set(0, 0.92, 0);
  const stripeBlue = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.11, 3.68), blueStripeMat);
  stripeBlue.position.set(0, 0.79, 0);
  bodyGroup.add(stripeRed, stripeBlue);

  const plateTex = makeTextCanvasTexture('RJ 14 PC 112 • POLICE', { bg: '#ffcf24', color: '#111', border: '#111' });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.16), new THREE.MeshBasicMaterial({ map: plateTex }));
  plate.position.set(0, 0.54, -1.88);
  plate.rotation.y = Math.PI;
  bodyGroup.add(plate);

  const sirenLeftMat = new THREE.MeshBasicMaterial({ color: 0xff1e38 });
  const sirenRightMat = new THREE.MeshBasicMaterial({ color: 0x00b4ff });
  const sirenL = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.14, 0.24), sirenLeftMat);
  sirenL.position.set(-0.34, 1.98, -0.1);
  const sirenR = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.14, 0.24), sirenRightMat);
  sirenR.position.set(0.34, 1.98, -0.1);
  bodyGroup.add(sirenL, sirenR);

  const wheels = [];
  [[-0.95, 1.18], [0.95, 1.18], [-0.95, -1.18], [0.95, -1.18]].forEach(([x, z]) => {
    const w = createDetailedWheel(0.41, 0.28, true);
    w.position.set(x, 0.41, z);
    root.add(w);
    wheels.push(w);
  });

  root.userData = { bodyGroup, wheels, sirenLeftMat, sirenRightMat };
  return root;
}

function createGroundSpeedRing() {
  const group = new THREE.Group();
  const totalSegments = 20;
  const innerR = 1.48;
  const outerR = 1.92;
  const segments = [];

  for (let i = 0; i < totalSegments; i++) {
    const startAngle = (i / totalSegments) * Math.PI * 2 + 0.03;
    const endAngle = ((i + 1) / totalSegments) * Math.PI * 2 - 0.03;
    const geo = new THREE.RingGeometry(innerR, outerR, 4, 1, startAngle, endAngle - startAngle);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xdfff4f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const seg = new THREE.Mesh(geo, mat);
    seg.position.y = 0.05;
    group.add(seg);
    segments.push(seg);
  }

  const haloGeo = new THREE.RingGeometry(1.15, 2.3, 24);
  haloGeo.rotateX(-Math.PI / 2);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xc8ff3d,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.22
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.position.y = 0.03;
  group.add(halo);

  group.userData = { segments, haloMat };
  return group;
}

// Custom .GLB Loader for user-uploaded .glb files
const REAL_GLB_CACHE = {};
let gltfLoaderInstance = null;
function getGLBLoader() {
  if (gltfLoaderInstance) return gltfLoaderInstance;
  gltfLoaderInstance = new GLTFLoader();
  return gltfLoaderInstance;
}

export async function loadCustomGLBFile(file, vehicleKey = 'car') {
  if (!file) return false;
  const loader = getGLBLoader();
  const objectUrl = URL.createObjectURL(file);
  return new Promise((resolve) => {
    loader.load(
      objectUrl,
      (gltf) => {
        REAL_GLB_CACHE[vehicleKey] = gltf.scene;
        resolve(true);
      },
      undefined,
      () => resolve(false)
    );
  });
}

function attachNormalizedGLBToVehicle(root, gltfScene, targetLength = 3.9, rotY = Math.PI) {
  if (!root || !gltfScene) return;
  const clone = gltfScene.clone(true);
  const box = new THREE.Box3().setFromObject(clone);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxHoriz = Math.max(size.x, size.z, 0.001);
  clone.scale.setScalar(targetLength / maxHoriz);

  const scaledBox = new THREE.Box3().setFromObject(clone);
  const scaledCenter = new THREE.Vector3();
  scaledBox.getCenter(scaledCenter);

  const autoRotY = size.x > size.z * 1.15 ? Math.PI / 2 : rotY;
  const wrapper = new THREE.Group();
  clone.position.set(-scaledCenter.x, -scaledBox.min.y + 0.04, -scaledCenter.z);
  clone.rotation.y = autoRotY;
  wrapper.add(clone);

  if (root.userData && root.userData.bodyGroup) {
    root.userData.bodyGroup.clear();
    root.userData.bodyGroup.add(wrapper);
  }
}

export function createVehicleMesh(typeId, tint = null) {
  const customPalette = tint ? { body: tint } : null;
  let root;
  switch (typeId) {
    case 'auto':
      root = buildAutoMesh(
        customPalette?.body || 0x085c30,
        customPalette?.canopy || 0xdba412,
        customPalette?.plate || 'RJ 14 PA 4207'
      );
      break;
    case 'scooter':
      root = buildScooterMesh(customPalette?.body || 0xf1efe9, customPalette?.canopy || 0x5c2c16);
      break;
    case 'xpulse':
      root = buildXPulseMesh();
      break;
    case 'bike':
      root = buildBikeMesh(customPalette?.body || 0x590d18, customPalette?.canopy || 0xd4af37);
      break;
    case 'car':
      root = buildCarMesh(
        customPalette?.body || 0xc1121f,
        customPalette?.canopy || 0x0f1319,
        customPalette?.plate || 'RJ 14 CA 0001'
      );
      break;
    case 'bus':
      root = buildBusMesh(
        customPalette?.body || 0x9b111e,
        customPalette?.canopy || 0xf5f0e6,
        customPalette?.plate || 'RJ 14 PB 5500'
      );
      break;
    case 'erickshaw':
      root = buildERickshawMesh(
        customPalette?.body || 0x0353a4,
        customPalette?.canopy || 0xb51737,
        customPalette?.plate || 'RJ 14 ER 1088'
      );
      break;
    case 'police':
      root = buildPoliceSuvMesh();
      break;
    default:
      root = buildAutoMesh();
      break;
  }

  // Attach 3-puff engine damage smoke group on every vehicle (hidden until crashed!)
  const smokeGroup = new THREE.Group();
  smokeGroup.position.set(0, 1.1, 0.8);
  smokeGroup.visible = false;
  const smokeMat = new THREE.MeshBasicMaterial({
    color: 0x334155,
    transparent: true,
    opacity: 0.72
  });
  for (let i = 0; i < 3; i++) {
    const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), smokeMat);
    puff.position.set((i - 1) * 0.25, i * 0.35, 0);
    smokeGroup.add(puff);
  }
  root.add(smokeGroup);
  root.userData.damageSmoke = smokeGroup;

  if (REAL_GLB_CACHE[typeId]) {
    attachNormalizedGLBToVehicle(root, REAL_GLB_CACHE[typeId], 3.8, Math.PI);
  }
  return root;
}

window.VEHICLE_CATALOG = VEHICLE_CATALOG;
window.createVehicleMesh = createVehicleMesh;
window.createGroundSpeedRing = createGroundSpeedRing;
window.makeTextCanvasTexture = makeTextCanvasTexture;
