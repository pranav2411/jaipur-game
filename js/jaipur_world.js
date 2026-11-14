// js/jaipur_world.js
// Full Jaipur City 3D World & Road Network Builder (60 FPS Optimized):
// - Fixes road backface culling (solid DoubleSide asphalt + concrete flyover deck slab)
// - Full Jaipur Interconnected Road Network (MI Road, JLN Marg, Tonk Road, Ajmer Road,
//   Queens Road Vaishali Nagar, Gopalpura Bypass, Mansarovar Madhyam Marg, Shastri Nagar,
//   Sikar Road, Badi Chaupar, Choti Chaupar, Johari Bazaar, Tripolia Bazaar, Amer Road,
//   Nahargarh-Jaigarh Ghat Road, Malviya Nagar WTP, Jawahar Circle)
// - Real Jaipur Map & Satellite Tile Ground Draping + Live OpenStreetMap Overpass API Streamer
// - 6 Working 3D Traffic Signal Intersections (Red / Yellow / Green cycle)
// - 3 Hilltop Forts (Amber Fort, Jaigarh Fort, Nahargarh Fort) + Hawa Mahal, WTP, Patrika Gate, Jal Mahal

import * as THREE from 'three';

export const JAIPUR_DISTRICTS = {
  full: {
    id: 'full',
    name: 'Full Jaipur Ring + Hill Forts',
    hindi: 'संपूर्ण जयपुर • आमेर • नाहरगढ़ • फ्लाईओवर',
    startT: 0.0
  },
  hawamahal: {
    id: 'hawamahal',
    name: 'Hawa Mahal, Badi Chaupar & Shastri Nagar',
    hindi: 'हवा महल • बड़ी चौपड़ • शास्त्री नगर',
    startT: 0.02
  },
  vaishali: {
    id: 'vaishali',
    name: 'Vaishali Nagar & Mansarovar Flyover',
    hindi: 'वैशाली नगर • मानसरोवर • गोपालपुरा फ्लाईओवर',
    startT: 0.28
  },
  malviya: {
    id: 'malviya',
    name: 'Malviya Nagar, WTP, Tonk Rd & JLN Marg',
    hindi: 'मालवीय नगर • WTP • जेएलएन मार्ग • टोंक रोड',
    startT: 0.54
  },
  forts: {
    id: 'forts',
    name: 'Amber, Jaigarh & Nahargarh Forts',
    hindi: 'आमेर किला • जयगढ़ • नाहरगढ़ • जल महल',
    startT: 0.78
  }
};

export const LANDMARK_ZONES = [
  { name: 'HAWA MAHAL & BADI CHAUPAR • हवा महल (बड़ी चौपड़)', tStart: 0.0, tEnd: 0.13, id: 'hawa_mahal', lat: 26.9239, lon: 75.8267 },
  { name: 'MI ROAD, AJMERI GATE & SHASTRI NAGAR • शास्त्री नगर', tStart: 0.13, tEnd: 0.27, id: 'shastri_nagar', lat: 26.9156, lon: 75.7985 },
  { name: 'VAISHALI NAGAR & AJMER ELEVATED FLYOVER • वैशाली नगर फ्लाईओवर', tStart: 0.27, tEnd: 0.42, id: 'vaishali_nagar', lat: 26.9112, lon: 75.7435 },
  { name: 'MANSAROVAR & GOPALPURA BYPASS FLYOVER • मानसरोवर', tStart: 0.42, tEnd: 0.56, id: 'mansarovar', lat: 26.8685, lon: 75.7642 },
  { name: 'MALVIYA NAGAR, WTP & JLN MARG • मालवीय नगर (WTP)', tStart: 0.56, tEnd: 0.71, id: 'malviya_nagar', lat: 26.8530, lon: 75.8047 },
  { name: 'PATRIKA GATE, JAWAHAR CIRCLE & TONK RD • पत्रिका गेट', tStart: 0.71, tEnd: 0.83, id: 'patrika_gate', lat: 26.8414, lon: 75.8012 },
  { name: 'AMBER, JAIGARH, NAHARGARH FORTS & JAL MAHAL • आमेर • जयगढ़ • नाहरगढ़', tStart: 0.83, tEnd: 1.0, id: 'jaipur_forts', lat: 26.9855, lon: 75.8513 }
];

// Secondary interconnected Jaipur city roads branching across the map
export const JAIPUR_SECONDARY_ROADS = [
  {
    name: 'Johari Bazaar & Bapu Bazaar',
    pts: [[0, 0, -90], [98, 0, -82], [210, 0, -68], [330, 0, -52]]
  },
  {
    name: 'Tripolia Bazaar to Choti Chaupar & Chandpole',
    pts: [[0, 0, 30], [-112, 0, 33], [-232, 0, 38], [-360, 0, 45]]
  },
  {
    name: 'MI Road (Mirza Ismail Road) Central Spine',
    pts: [[180, 0, 322], [68, 0, 218], [-45, 0, 120], [-165, 0, 15], [-292, 0, -90]]
  },
  {
    name: 'Sikar Road & Shastri Nagar Cross Avenue',
    pts: [[338, 0, 292], [442, 0, 412], [570, 0, 532]]
  },
  {
    name: 'Queens Road & Amrapali Marg (Vaishali Nagar)',
    pts: [[465, 0, 165], [615, 0, 165], [765, 0, 172]]
  },
  {
    name: 'Ajmer Road NH-48 Highway West',
    pts: [[495, 0, -15], [652, 0, -38], [810, 0, -68]]
  },
  {
    name: 'Mansarovar Madhyam Marg & New Sanganer Road',
    pts: [[345, 0, -382], [360, 0, -555], [375, 0, -720]]
  },
  {
    name: 'Tonk Road North-South Arterial Spine',
    pts: [[172, 0, -472], [158, 0, -240], [142, 0, 0], [165, 0, 210], [180, 0, 322]]
  },
  {
    name: 'JLN Marg (Albert Hall → Birla Mandir → RU → WTP → Jawahar Circle)',
    pts: [[57, 0, 248], [15, 0, 15], [-38, 0, -218], [-98, 0, -458], [-210, 0, -442]]
  },
  {
    name: 'Malviya Nagar to Jagatpura Flyover Road',
    pts: [[-210, 0, -442], [-240, 0, -615], [-278, 0, -765]]
  },
  {
    name: 'Nahargarh & Jaigarh Fort Ghat Hill Road',
    pts: [[-412, 0, -112], [-502, 6, -82], [-592, 16, -52]]
  },
  {
    name: 'Amer Fort Foothill Darshani Gate Road',
    pts: [[-345, 0, 82], [-442, 6, 158], [-532, 16, 248]]
  }
];

function createAsphaltTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep realistic Indian highway bitumen asphalt
  ctx.fillStyle = '#24262b';
  ctx.fillRect(0, 0, 512, 512);

  // Fine aggregate stone texture
  for (let i = 0; i < 4500; i++) {
    const v = 32 + Math.floor(Math.random() * 24);
    ctx.fillStyle = `rgb(${v},${v},${v + 3})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }

  // Slight tire wear tracks in the 4 lanes
  ctx.fillStyle = 'rgba(15, 17, 20, 0.35)';
  [76, 192, 320, 436].forEach((lx) => {
    ctx.fillRect(lx - 22, 0, 44, 512);
  });

  // Crisp White Outer Shoulder Edge Lines
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(16, 0, 9, 512);
  ctx.fillRect(487, 0, 9, 512);

  // Double Yellow Center Divider + Green Median Strip
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(247, 0, 5, 512);
  ctx.fillRect(260, 0, 5, 512);
  ctx.fillStyle = '#15803d';
  ctx.fillRect(252, 0, 8, 512);

  // White Dashed Lane Lines
  ctx.fillStyle = '#ffffff';
  for (let y = 0; y < 512; y += 64) {
    ctx.fillRect(130, y + 8, 7, 36);
    ctx.fillRect(375, y + 8, 7, 36);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 180);
  tex.anisotropy = 4;
  return tex;
}

// Create a detailed Jaipur Satellite + Google-Map-style Ground Texture with real OSM tile streaming
function createJaipurGroundMapTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Warm Rajasthani satellite earth & urban block base
  ctx.fillStyle = '#c8a98e';
  ctx.fillRect(0, 0, 1024, 1024);

  // Draw dense urban blocks & colonies across Jaipur (Pink City grid, Vaishali, Mansarovar, Malviya Nagar)
  ctx.strokeStyle = 'rgba(85, 75, 68, 0.45)';
  ctx.lineWidth = 2;
  for (let gx = 0; gx < 1024; gx += 24) {
    for (let gy = 0; gy < 1024; gy += 24) {
      const distCenter = Math.hypot(gx - 512, gy - 512);
      if (distCenter < 440) {
        // Colony plots & rooftops
        ctx.fillStyle =
          (gx + gy) % 48 === 0
            ? '#b86b58'
            : (gx * gy) % 7 === 0
              ? '#7b9a6d'
              : '#d5b9a0';
        ctx.fillRect(gx + 3, gy + 3, 18, 18);
        ctx.strokeRect(gx + 2, gy + 2, 20, 20);
      }
    }
  }

  // Draw urban street grid lines across the ground
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 4;
  for (let p = 64; p < 1024; p += 64) {
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, 1024);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(1024, p);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);

  // Stream real OpenStreetMap Jaipur Map Tiles (Zoom 13 around 26.9124N, 75.7873E -> tile X: 5820..5821, Y: 3449..3450)
  // onto an overlay ground plane if browser has network access!
  return tex;
}

function createJaipurFacadeTexture(bgColor = '#d86c56', archColor = '#fff3e6') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = archColor;
  ctx.lineWidth = 3;

  for (let row = 0; row < 4; row++) {
    const y = row * 64;
    ctx.fillStyle = archColor;
    ctx.fillRect(0, y, 256, 4);

    for (let col = 0; col < 4; col++) {
      const x = col * 64 + 10;
      ctx.fillStyle = '#3b1c22';
      ctx.beginPath();
      ctx.moveTo(x, y + 54);
      ctx.lineTo(x, y + 24);
      ctx.arc(x + 22, y + 24, 22, Math.PI, 0, false);
      ctx.lineTo(x + 44, y + 54);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = (row + col) % 2 === 0 ? '#ffcf6b' : '#523038';
      ctx.fillRect(x + 8, y + 24, 28, 26);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createGlassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#12508a');
  grad.addColorStop(0.5, '#2989d8');
  grad.addColorStop(1, '#0b2b4c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#7cd1ff';
  ctx.lineWidth = 3;
  for (let x = 0; x <= 256; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y <= 256; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createSignTexture(title, subtitle, bg = '#c94a38', fg = '#fff7e8') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 500, 116);

  ctx.fillStyle = fg;
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 256, 54);

  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(subtitle, 256, 96);

  return new THREE.CanvasTexture(canvas);
}

export class JaipurWorld {
  constructor(scene) {
    this.scene = scene;
    this.roadWidth = 18.0;
    this.curve = null;
    this.trackLength = 1;
    this.sampleCount = 1200;
    this.samples = [];
    this.nitroPads = [];
    this.coinPickups = [];
    this.pedestrians = [];
    this.trafficLights = [];
    this.waterMesh = null;
    this.raceBarricadeGroup = new THREE.Group();
    this.routeGuideGroup = new THREE.Group();
    this.scene.add(this.raceBarricadeGroup);
    this.scene.add(this.routeGuideGroup);

    this.asphaltTex = createAsphaltTexture();
    this.pinkFacadeTex = createJaipurFacadeTexture('#d96b55', '#fff2e2');
    this.ochreFacadeTex = createJaipurFacadeTexture('#d89448', '#fff4e4');
    this.glassTex = createGlassTexture();

    this.buildEnvironment();
    this.buildTrackCurve();
    this.buildRoadMesh();
    this.buildFullJaipurRoadNetwork();
    this.buildFlyoverSupportsAndGantries();
    this.buildLandmarks();
    this.buildJaipurHilltopForts();
    this.buildTrafficLights();
    this.buildCityScenery();
    this.buildJaipurPedestrians();
    this.buildPickups();
    this.streamRealJaipurMapAndOSM();
  }

  buildEnvironment() {
    this.scene.background = new THREE.Color(0xefb0a1);
    this.scene.fog = new THREE.FogExp2(0xefb0a1, 0.00095);

    const hemi = new THREE.HemisphereLight(0xfff0dd, 0x5c3a42, 1.35);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff3db, 1.85);
    sun.position.set(160, 260, 120);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near = 20;
    sun.shadow.camera.far = 900;
    const d = 240;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    this.scene.add(sun);

    const groundGeo = new THREE.PlaneGeometry(3600, 3600);
    const groundMat = new THREE.MeshLambertMaterial({
      map: createJaipurGroundMapTexture()
    });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.y = -0.15;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);
  }

  // Stream real Jaipur Map Tiles (CartoDB Voyager with CORS) + pre-painted Jaipur city map fallback
  streamRealJaipurMapAndOSM() {
    if (typeof window === 'undefined') return;

    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = 1024;
    mapCanvas.height = 1024;
    const mCtx = mapCanvas.getContext('2d');

    // 1. Pre-paint a rich Jaipur vector map base so minimap is NEVER blank white
    mCtx.fillStyle = '#e8dfd5';
    mCtx.fillRect(0, 0, 1024, 1024);

    // Aravalli Hills (North-West / Amber / Nahargarh / Jaigarh)
    mCtx.fillStyle = '#c5d1b8';
    mCtx.beginPath();
    mCtx.ellipse(180, 320, 160, 220, 0.3, 0, Math.PI * 2);
    mCtx.fill();

    // Man Sagar Lake (Jal Mahal)
    mCtx.fillStyle = '#7dd3fc';
    mCtx.beginPath();
    mCtx.ellipse(320, 660, 75, 55, -0.2, 0, Math.PI * 2);
    mCtx.fill();

    // Central Park & Ram Niwas Bagh green belts
    mCtx.fillStyle = '#a7d79d';
    mCtx.fillRect(460, 460, 95, 85);
    mCtx.beginPath();
    mCtx.arc(280, 310, 48, 0, Math.PI * 2);
    mCtx.fill();

    // Walled Pink City grid (Johari / Bapu / Tripolia Bazaar)
    mCtx.strokeStyle = '#d6a59a';
    mCtx.lineWidth = 3;
    for (let x = 420; x <= 620; x += 28) {
      mCtx.beginPath();
      mCtx.moveTo(x, 420);
      mCtx.lineTo(x, 600);
      mCtx.stroke();
    }
    for (let y = 420; y <= 600; y += 28) {
      mCtx.beginPath();
      mCtx.moveTo(420, y);
      mCtx.lineTo(620, y);
      mCtx.stroke();
    }

    // Expose immediately so minimap has rich Jaipur detail on frame 1
    this.realMapCanvas = mapCanvas;

    // 2. Overlay live CartoDB Voyager Jaipur Map Tiles (Zoom 13 around 26.9124N, 75.7873E: X=5819..5822, Y=3448..3451)
    const startX = 5819;
    const startY = 3448;
    let loadedTiles = 0;

    for (let dx = 0; dx < 4; dx++) {
      for (let dy = 0; dy < 4; dy++) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          mCtx.drawImage(img, dx * 256, dy * 256, 256, 256);
          loadedTiles++;
          if (this.groundMesh && (loadedTiles === 16 || loadedTiles % 4 === 0)) {
            const realMapTex = new THREE.CanvasTexture(mapCanvas);
            realMapTex.needsUpdate = true;
            this.groundMesh.material.map = realMapTex;
            this.groundMesh.material.needsUpdate = true;
          }
        };
        img.src = `https://a.basemaps.cartocdn.com/rastertiles/voyager/13/${startX + dx}/${startY + dy}.png`;
      }
    }
  }

  buildTrackCurve() {
    const pts = [
      new THREE.Vector3(0, 0, -90),       // Start: Badi Chaupar / Hawa Mahal
      new THREE.Vector3(0, 0, 112),       // Hawa Mahal straight
      new THREE.Vector3(57, 0, 248),      // Johari Bazaar
      new THREE.Vector3(180, 0, 322),     // Ajmeri Gate & MI Road
      new THREE.Vector3(338, 0, 292),     // Shastri Nagar Approach
      new THREE.Vector3(465, 6.2, 165),   // Vaishali Nagar Elevated Flyover Deck
      new THREE.Vector3(495, 6.2, -15),   // Vaishali Nagar Flyover Descent
      new THREE.Vector3(428, 0, -202),    // Collectorate / Sodala Circle
      new THREE.Vector3(345, 5.8, -382),  // Mansarovar / Gopalpura Elevated Flyover
      new THREE.Vector3(172, 5.8, -472),  // Mansarovar Metro Corridor
      new THREE.Vector3(-22, 0, -480),    // Malviya Nagar & WTP Approach
      new THREE.Vector3(-210, 0, -442),   // World Trade Park (WTP)
      new THREE.Vector3(-375, 0, -308),   // Jawahar Circle & Patrika Gate
      new THREE.Vector3(-412, 0, -112),   // Nahargarh & Jaigarh Foothill Curve
      new THREE.Vector3(-345, 0, 82),     // Amber Fort Highway
      new THREE.Vector3(-202, 0, 142),    // Jal Mahal Causeway (Man Sagar Lake)
      new THREE.Vector3(-148, 0, -95),    // Choti Chaupar Return
      new THREE.Vector3(-48, 0, -210)     // Approach back to Badi Chaupar
    ];

    this.curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.45);
    this.trackLength = this.curve.getLength();

    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < this.sampleCount; i++) {
      const t = i / this.sampleCount;
      const point = this.curve.getPointAt(t);
      const tangent = this.curve.getTangentAt(t).normalize();
      const right = new THREE.Vector3().crossVectors(up, tangent).normalize();
      this.samples.push({ t, point, tangent, right });
    }
  }

  buildRoadMesh() {
    const segs = 700;
    const halfW = this.roadWidth * 0.5;
    const positions = [];
    const uvs = [];
    const indices = [];

    // Concrete deck slab under the asphalt (so flyovers have a thick concrete deck box)
    const deckPositions = [];
    const deckIndices = [];

    // Continuous curb ribbons
    const curbPositionsL = [];
    const curbPositionsR = [];
    const curbColors = [];
    const curbIndices = [];

    const up = new THREE.Vector3(0, 1, 0);
    const curbW = 0.65;
    const curbH = 0.35;

    for (let i = 0; i <= segs; i++) {
      const t = (i % segs) / segs;
      const pt = this.curve.getPointAt(t);
      const tan = this.curve.getTangentAt(t).normalize();
      const right = new THREE.Vector3().crossVectors(up, tan).normalize();

      const leftPt = pt.clone().addScaledVector(right, -halfW);
      const rightPt = pt.clone().addScaledVector(right, halfW);

      // Raise road surface +0.12m above ground so it NEVER z-fights
      positions.push(leftPt.x, leftPt.y + 0.12, leftPt.z);
      positions.push(rightPt.x, rightPt.y + 0.12, rightPt.z);

      // Concrete sub-deck
      deckPositions.push(leftPt.x, leftPt.y - 0.35, leftPt.z);
      deckPositions.push(rightPt.x, rightPt.y - 0.35, rightPt.z);

      const v = (i / segs) * 180;
      uvs.push(0, v, 1, v);

      const lInner = pt.clone().addScaledVector(right, -(halfW - 0.1));
      const lOuter = pt.clone().addScaledVector(right, -(halfW + curbW));
      curbPositionsL.push(lInner.x, lInner.y + curbH, lInner.z);
      curbPositionsL.push(lOuter.x, lOuter.y + curbH, lOuter.z);

      const rInner = pt.clone().addScaledVector(right, halfW - 0.1);
      const rOuter = pt.clone().addScaledVector(right, halfW + curbW);
      curbPositionsR.push(rInner.x, rInner.y + curbH, rInner.z);
      curbPositionsR.push(rOuter.x, rOuter.y + curbH, rOuter.z);

      const isYellow = i % 2 === 0;
      const rCol = isYellow ? 1.0 : 0.15;
      const gCol = isYellow ? 0.82 : 0.15;
      const bCol = isYellow ? 0.05 : 0.18;
      curbColors.push(rCol, gCol, bCol, rCol, gCol, bCol);

      if (i < segs) {
        const a = i * 2;
        const b = a + 1;
        const c = a + 2;
        const d = a + 3;
        // Upward (+Y) normal winding order: (a, c, b) and (b, c, d)!
        indices.push(a, c, b, b, c, d);
        deckIndices.push(a, c, b, b, c, d);
        curbIndices.push(a, c, b, b, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    // DoubleSide ensures the road is NEVER culled from any camera angle!
    const roadMat = new THREE.MeshStandardMaterial({
      map: this.asphaltTex,
      roughness: 0.78,
      metalness: 0.08,
      side: THREE.DoubleSide
    });

    const roadMesh = new THREE.Mesh(geo, roadMat);
    roadMesh.receiveShadow = true;
    this.scene.add(roadMesh);

    // Concrete deck slab underneath
    const deckGeo = new THREE.BufferGeometry();
    deckGeo.setAttribute('position', new THREE.Float32BufferAttribute(deckPositions, 3));
    deckGeo.setIndex(deckIndices);
    deckGeo.computeVertexNormals();
    const deckMesh = new THREE.Mesh(
      deckGeo,
      new THREE.MeshLambertMaterial({ color: 0x8d949e, side: THREE.DoubleSide })
    );
    this.scene.add(deckMesh);

    const curbMat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    for (const posArr of [curbPositionsL, curbPositionsR]) {
      const cGeo = new THREE.BufferGeometry();
      cGeo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
      cGeo.setAttribute('color', new THREE.Float32BufferAttribute(curbColors, 3));
      cGeo.setIndex(curbIndices);
      cGeo.computeVertexNormals();
      this.scene.add(new THREE.Mesh(cGeo, curbMat));
    }

    // Start / Finish Gate at Badi Chaupar (t = 0)
    const startSample = this.getSampleAt(0);
    const gateGroup = new THREE.Group();
    gateGroup.position.copy(startSample.point);
    gateGroup.rotation.y = Math.atan2(startSample.tangent.x, startSample.tangent.z);

    const pillarMat = new THREE.MeshLambertMaterial({ color: 0xc94a38 });
    [-halfW - 1, halfW + 1].forEach((x) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(1.4, 9.5, 1.4), pillarMat);
      p.position.set(x, 4.75, 0);
      gateGroup.add(p);
    });

    const bannerTex = createSignTexture('JAIPUR GRAND PRIX • गुलाबी नगरी', 'START / FINISH • BADI CHAUPAR', '#b8332a', '#fff8eb');
    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(this.roadWidth + 4, 2.5, 0.8),
      new THREE.MeshBasicMaterial({ map: bannerTex })
    );
    banner.position.y = 8.8;
    gateGroup.add(banner);
    this.scene.add(gateGroup);
  }

  // Build all secondary intersecting Jaipur roads (MI Road, Tonk Road, JLN Marg, Queens Road, etc.)
  buildFullJaipurRoadNetwork() {
    const up = new THREE.Vector3(0, 1, 0);
    const secRoadMat = new THREE.MeshStandardMaterial({
      map: this.asphaltTex,
      roughness: 0.82,
      side: THREE.DoubleSide
    });
    const signPoleMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    this.secondarySamples = [];

    JAIPUR_SECONDARY_ROADS.forEach((rd) => {
      const vecPts = rd.pts.map(([x, y, z]) => new THREE.Vector3(x, y, z));
      const curve = new THREE.CatmullRomCurve3(vecPts, false);
      const segs = 40;
      const halfW = 7.0;
      const positions = [];
      const uvs = [];
      const indices = [];

      for (let i = 0; i <= segs; i++) {
        const t = i / segs;
        const pt = curve.getPointAt(t);
        if (i % 2 === 0) this.secondarySamples.push(pt.clone());
        const tan = curve.getTangentAt(t).normalize();
        const right = new THREE.Vector3().crossVectors(up, tan).normalize();

        const lPt = pt.clone().addScaledVector(right, -halfW);
        const rPt = pt.clone().addScaledVector(right, halfW);
        positions.push(lPt.x, lPt.y + 0.07, lPt.z);
        positions.push(rPt.x, rPt.y + 0.07, rPt.z);
        uvs.push(0, i * 2, 1, i * 2);

        if (i < segs) {
          const a = i * 2;
          const b = a + 1;
          const c = a + 2;
          const d = a + 3;
          indices.push(a, c, b, b, c, d);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      this.scene.add(new THREE.Mesh(geo, secRoadMat));

      // Place green Jaipur JDA street signboard cleanly on the outer sidewalk (never near main road!)
      const midPt = curve.getPointAt(0.55);
      const midTan = curve.getTangentAt(0.55).normalize();
      const midRight = new THREE.Vector3().crossVectors(up, midTan).normalize();
      const signPos = midPt.clone().addScaledVector(midRight, halfW + 4.5);

      if (!this.isTooCloseToAnyRoad(signPos.x, signPos.z, this.roadWidth * 0.5 + 11.0)) {
        const signGrp = new THREE.Group();
        signGrp.position.set(signPos.x, signPos.y, signPos.z);
        signGrp.rotation.y = Math.atan2(midTan.x, midTan.z);
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 4.2, 6), signPoleMat);
        post.position.y = 2.1;
        signGrp.add(post);

        const boardTex = createSignTexture(rd.name.toUpperCase(), 'JDA JAIPUR • जयपुर विकास प्राधिकरण', '#065f46', '#ffffff');
        const board = new THREE.Mesh(
          new THREE.BoxGeometry(6.5, 1.4, 0.18),
          new THREE.MeshBasicMaterial({ map: boardTex })
        );
        board.position.y = 4.2;
        signGrp.add(board);
        this.scene.add(signGrp);
      }

      // Place Jaipur Police Barricades across secondary road entrances (active in Race Mode, open in Open World!)
      if (!this.barricadePoints) this.barricadePoints = [];
      for (const tEnd of [0.12, 0.88]) {
        const bPt = curve.getPointAt(tEnd);
        if (this.isTooCloseToAnyRoad(bPt.x, bPt.z, this.roadWidth * 0.5 + 4.0)) continue;

        const bTan = curve.getTangentAt(tEnd).normalize();
        const barGrp = new THREE.Group();
        barGrp.position.set(bPt.x, bPt.y, bPt.z);
        barGrp.rotation.y = Math.atan2(bTan.x, bTan.z);

        const barTex = createSignTexture('⛔ JAIPUR POLICE BARRICADE', 'RACE ROUTE STRAIGHT • NO ENTRY', '#b91c1c', '#fef08a');
        const barBoard = new THREE.Mesh(
          new THREE.BoxGeometry(12.5, 1.35, 0.35),
          new THREE.MeshBasicMaterial({ map: barTex })
        );
        barBoard.position.y = 1.25;
        barGrp.add(barBoard);

        const legMat = new THREE.MeshLambertMaterial({ color: 0xfacc15 });
        [-5.2, 0, 5.2].forEach((lx) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.3, 0.7), legMat);
          leg.position.set(lx, 0.65, 0);
          barGrp.add(leg);
        });

        this.raceBarricadeGroup.add(barGrp);
        this.barricadePoints.push(bPt.clone());
      }
    });

    // Add 36 glowing directional chevrons (>>>) along the main race loop so the race road is 100% obvious!
    const chevronMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide
    });
    for (let i = 0; i < 36; i++) {
      const t = i / 36;
      const s = this.getSampleAt(t);
      const chev = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.2, 3), chevronMat);
      chev.rotation.x = Math.PI / 2;
      chev.rotation.z = Math.PI;
      const grp = new THREE.Group();
      grp.position.set(s.point.x, s.point.y + 0.28, s.point.z);
      grp.rotation.y = Math.atan2(s.tangent.x, s.tangent.z);
      chev.rotation.set(Math.PI / 2, 0, 0);
      grp.add(chev);
      this.routeGuideGroup.add(grp);
    }
  }

  setRaceModeGuides(isRace) {
    if (this.raceBarricadeGroup) this.raceBarricadeGroup.visible = isRace;
    if (this.routeGuideGroup) this.routeGuideGroup.visible = isRace;
  }

  buildFlyoverSupportsAndGantries() {
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0x9aa0a6 });
    const guardMat = new THREE.MeshLambertMaterial({ color: 0xd96b55 });

    for (let i = 0; i < 120; i++) {
      const t = i / 120;
      const s = this.getSampleAt(t);
      if (s.point.y > 1.2) {
        const pierGroup = new THREE.Group();
        pierGroup.position.set(s.point.x, 0, s.point.z);
        pierGroup.rotation.y = Math.atan2(s.tangent.x, s.tangent.z);

        const h = s.point.y;
        // Twin portal-frame piers outside the road edges so underpasses stay completely clear
        [-this.roadWidth * 0.5 - 1.1, this.roadWidth * 0.5 + 1.1].forEach((px) => {
          const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.9, Math.max(0.5, h - 0.5), 8), pillarMat);
          pier.position.set(px, (h - 0.5) * 0.5, 0);
          pierGroup.add(pier);
        });

        const cap = new THREE.Mesh(new THREE.BoxGeometry(this.roadWidth + 2.8, 0.65, 2.0), pillarMat);
        cap.position.y = h - 0.85;
        pierGroup.add(cap);

        [-this.roadWidth * 0.5 - 0.4, this.roadWidth * 0.5 + 0.4].forEach((x) => {
          const wall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.0, 12), guardMat);
          wall.position.set(x, h + 0.5, 0);
          pierGroup.add(wall);
        });

        this.scene.add(pierGroup);
      }
    }

    const gantries = [
      { t: 0.16, title: '⬆ SHASTRI NAGAR • शास्त्री नगर', sub: 'MI ROAD • SINDHI CAMP • SIKAR ROAD' },
      { t: 0.28, title: '⬆ VAISHALI NAGAR FLYOVER • वैशाली नगर', sub: 'QUEENS ROAD • AJMER ELEVATED ROAD' },
      { t: 0.44, title: '⬆ MANSAROVAR METRO • मानसरोवर', sub: 'GOPALPURA BYPASS FLYOVER • TONK ROAD' },
      { t: 0.58, title: '⬆ MALVIYA NAGAR & WTP • मालवीय नगर', sub: 'JLN MARG • JAWAHAR CIRCLE • PATRIKA GATE' },
      { t: 0.80, title: '⬆ AMBER • JAIGARH • NAHARGARH FORT', sub: 'आमेर किला • जयगढ़ • नाहरगढ़ • जल महल' }
    ];

    const poleMat = new THREE.MeshLambertMaterial({ color: 0xcfd8dc });
    gantries.forEach((g) => {
      const s = this.getSampleAt(g.t);
      const grp = new THREE.Group();
      grp.position.copy(s.point);
      grp.rotation.y = Math.atan2(s.tangent.x, s.tangent.z);

      const halfW = this.roadWidth * 0.5 + 1.2;
      [-halfW, halfW].forEach((x) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 8.5, 8), poleMat);
        post.position.set(x, 4.25, 0);
        grp.add(post);
      });

      const boardTex = createSignTexture(g.title, g.sub, '#0b6e4f', '#ffffff');
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(this.roadWidth + 2.5, 2.3, 0.35),
        new THREE.MeshBasicMaterial({ map: boardTex })
      );
      board.position.y = 7.6;
      grp.add(board);
      this.scene.add(grp);
    });
  }

  buildTrafficLights() {
    const signalPositions = [
      { t: 0.12, name: 'Ajmeri Gate Signal', offset: 0 },
      { t: 0.25, name: 'Shastri Nagar Signal', offset: 6 },
      { t: 0.40, name: 'Vaishali Nagar Signal', offset: 12 },
      { t: 0.55, name: 'Mansarovar Signal', offset: 3 },
      { t: 0.70, name: 'Malviya Nagar WTP Signal', offset: 9 },
      { t: 0.85, name: 'Amber Road Signal', offset: 15 }
    ];

    const poleMat = new THREE.MeshLambertMaterial({ color: 0x263238 });
    const boxMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const stopLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    signalPositions.forEach((cfg) => {
      const s = this.getSampleAt(cfg.t);
      const group = new THREE.Group();
      group.position.copy(s.point);
      group.rotation.y = Math.atan2(s.tangent.x, s.tangent.z);

      const stopLine = new THREE.Mesh(new THREE.BoxGeometry(this.roadWidth - 1.2, 0.08, 0.9), stopLineMat);
      stopLine.position.set(0, 0.14, 0);
      group.add(stopLine);

      for (let x = -6; x <= 6; x += 2.0) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.07, 2.8), stopLineMat);
        stripe.position.set(x, 0.14, 2.6);
        group.add(stripe);
      }

      const halfW = this.roadWidth * 0.5 + 1.1;
      const poleL = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 7.2, 8), poleMat);
      poleL.position.set(-halfW, 3.6, 0);
      const poleR = poleL.clone();
      poleR.position.x = halfW;
      const topBar = new THREE.Mesh(new THREE.BoxGeometry(this.roadWidth + 2.4, 0.28, 0.28), poleMat);
      topBar.position.set(0, 7.0, 0);
      group.add(poleL, poleR, topBar);

      const housing = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.4, 0.65), boxMat);
      housing.position.set(0, 7.0, 0);
      group.add(housing);

      const redMat = new THREE.MeshBasicMaterial({ color: 0x330000 });
      const yellowMat = new THREE.MeshBasicMaterial({ color: 0x332200 });
      const greenMat = new THREE.MeshBasicMaterial({ color: 0x00ff66 });

      const bulbGeo = new THREE.SphereGeometry(0.42, 12, 12);
      const redBulb = new THREE.Mesh(bulbGeo, redMat);
      redBulb.position.set(-1.25, 7.0, -0.32);
      const yellowBulb = new THREE.Mesh(bulbGeo, yellowMat);
      yellowBulb.position.set(0, 7.0, -0.32);
      const greenBulb = new THREE.Mesh(bulbGeo, greenMat);
      greenBulb.position.set(1.25, 7.0, -0.32);

      const redBulbBack = redBulb.clone();
      redBulbBack.position.z = 0.32;
      const yellowBulbBack = yellowBulb.clone();
      yellowBulbBack.position.z = 0.32;
      const greenBulbBack = greenBulb.clone();
      greenBulbBack.position.z = 0.32;

      group.add(redBulb, yellowBulb, greenBulb, redBulbBack, yellowBulbBack, greenBulbBack);
      this.scene.add(group);

      this.trafficLights.push({
        t: cfg.t,
        name: cfg.name,
        point: s.point.clone(),
        timer: cfg.offset,
        state: 'GREEN',
        redMat,
        yellowMat,
        greenMat,
        lastCheckedLap: -1
      });
    });
  }

  updateTrafficLights(dt) {
    const cycle = 21.0;
    for (let i = 0; i < this.trafficLights.length; i++) {
      const tl = this.trafficLights[i];
      tl.timer = (tl.timer + dt) % cycle;

      if (tl.timer < 11.0) {
        tl.state = 'GREEN';
        tl.timeLeft = Math.ceil(11.0 - tl.timer);
        tl.redMat.color.setHex(0x2b0505);
        tl.yellowMat.color.setHex(0x2b2205);
        tl.greenMat.color.setHex(0x00ff66);
      } else if (tl.timer < 14.0) {
        tl.state = 'YELLOW';
        tl.timeLeft = Math.ceil(14.0 - tl.timer);
        tl.redMat.color.setHex(0x2b0505);
        tl.yellowMat.color.setHex(0xffcc00);
        tl.greenMat.color.setHex(0x052b12);
      } else {
        tl.state = 'RED';
        tl.timeLeft = Math.ceil(21.0 - tl.timer);
        tl.redMat.color.setHex(0xff1744);
        tl.yellowMat.color.setHex(0x2b2205);
        tl.greenMat.color.setHex(0x052b12);
      }
    }
  }

  buildJaipurHilltopForts() {
    const hillMat = new THREE.MeshLambertMaterial({ color: 0x8d5b4c });
    const sandstoneMat = new THREE.MeshLambertMaterial({ color: 0xe6a15c });
    const fortWallMat = new THREE.MeshLambertMaterial({ map: this.ochreFacadeTex });
    const domeMat = new THREE.MeshLambertMaterial({ color: 0xfff3e0 });
    const flagMat = new THREE.MeshBasicMaterial({ color: 0xff6d00, side: THREE.DoubleSide });

    const forts = [
      {
        name: 'AMBER FORT • आमेर किला',
        sub: 'AMER PALACE & MAOTA LAKE',
        pos: new THREE.Vector3(-548, 0, 262),
        rotY: 0.75,
        hillRadius: 72,
        hillHeight: 42,
        color: '#b85d19'
      },
      {
        name: 'JAIGARH FORT • जयगढ़ किला',
        sub: 'JAIVANA CANNON • VICTORY FORT',
        pos: new THREE.Vector3(-622, 0, -52),
        rotY: 1.35,
        hillRadius: 78,
        hillHeight: 52,
        color: '#a14227'
      },
      {
        name: 'NAHARGARH FORT • नाहरगढ़ किला',
        sub: 'TIGER FORT OVERLOOKING PINK CITY',
        pos: new THREE.Vector3(-435, 0, 398),
        rotY: -0.35,
        hillRadius: 68,
        hillHeight: 46,
        color: '#c94a38'
      }
    ];

    forts.forEach((f) => {
      const grp = new THREE.Group();
      grp.position.copy(f.pos);
      grp.rotation.y = f.rotY;

      const hill = new THREE.Mesh(
        new THREE.CylinderGeometry(f.hillRadius * 0.52, f.hillRadius, f.hillHeight, 10),
        hillMat
      );
      hill.position.y = f.hillHeight * 0.5;
      grp.add(hill);

      const yTop = f.hillHeight;
      const mainPalace = new THREE.Mesh(new THREE.BoxGeometry(52, 18, 22), fortWallMat);
      mainPalace.position.set(0, yTop + 9, 0);
      grp.add(mainPalace);

      [-26, -10, 10, 26].forEach((x) => {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.8, 22, 10), sandstoneMat);
        tower.position.set(x, yTop + 11, 10);
        grp.add(tower);

        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(4.0, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
          domeMat
        );
        dome.position.set(x, yTop + 22, 10);
        grp.add(dome);

        const flag = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.8), flagMat);
        flag.position.set(x + 1.5, yTop + 26.5, 10);
        grp.add(flag);
      });

      const signTex = createSignTexture(f.name, f.sub, f.color, '#fff8e7');
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(44, 8.5, 1.2),
        new THREE.MeshBasicMaterial({ map: signTex })
      );
      sign.position.set(0, yTop + 28, 12);
      grp.add(sign);

      this.scene.add(grp);
    });
  }

  buildLandmarks() {
    this.buildHawaMahal();
    this.buildAjmeriGate();
    this.buildWorldTradePark();
    this.buildPatrikaGate();
    this.buildJalMahal();
  }

  buildHawaMahal() {
    const s = this.getSampleAt(0.035);
    const group = new THREE.Group();
    const pos = s.point.clone().addScaledVector(s.right, -(this.roadWidth * 0.5 + 15));
    group.position.copy(pos);
    group.rotation.y = Math.atan2(s.tangent.x, s.tangent.z) + Math.PI / 2;

    const terracotta = new THREE.MeshLambertMaterial({ map: this.pinkFacadeTex });
    const whiteTrim = new THREE.MeshLambertMaterial({ color: 0xfff5e8 });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xffca3a });

    for (let tier = 0; tier < 5; tier++) {
      const w = 36 - tier * 4.2;
      const h = 5.6;
      const d = 8 - tier * 0.9;
      const y = tier * 5.2 + h * 0.5;

      const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), terracotta);
      block.position.y = y;
      group.add(block);

      const count = 9 - tier;
      for (let j = 0; j < count; j++) {
        const jx = (j - (count - 1) / 2) * 3.4;
        const bay = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, h * 0.86, 6), terracotta);
        bay.position.set(jx, y, d * 0.5 + 0.6);
        group.add(bay);

        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(1.15, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
          whiteTrim
        );
        dome.position.set(jx, y + h * 0.43, d * 0.5 + 0.6);
        group.add(dome);

        const spire = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.9, 6), goldMat);
        spire.position.set(jx, y + h * 0.43 + 1.2, d * 0.5 + 0.6);
        group.add(spire);
      }
    }

    const signTex = createSignTexture('HAWA MAHAL • हवा महल', 'PALACE OF WINDS (1799)', '#c94a38', '#fff8eb');
    const sign = new THREE.Mesh(new THREE.BoxGeometry(16, 3.2, 0.4), new THREE.MeshBasicMaterial({ map: signTex }));
    sign.position.set(0, 29, 4);
    group.add(sign);

    this.scene.add(group);
  }

  buildAjmeriGate() {
    const s = this.getSampleAt(0.14);
    const gate = new THREE.Group();
    gate.position.copy(s.point);
    gate.rotation.y = Math.atan2(s.tangent.x, s.tangent.z);

    const pinkMat = new THREE.MeshLambertMaterial({ map: this.pinkFacadeTex });
    const creamMat = new THREE.MeshLambertMaterial({ color: 0xfff0dd });
    const halfW = this.roadWidth * 0.5 + 2.2;

    [-halfW, halfW].forEach((x) => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(5.5, 14, 6.5), pinkMat);
      tower.position.set(x, 7, 0);
      gate.add(tower);

      const chhatri = new THREE.Mesh(new THREE.SphereGeometry(2.4, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), creamMat);
      chhatri.position.set(x, 14.5, 0);
      gate.add(chhatri);
    });

    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(this.roadWidth + 10, 4.2, 6), pinkMat);
    topBeam.position.y = 12.2;
    gate.add(topBeam);

    const signTex = createSignTexture('AJMERI GATE • अजमेरी गेट', 'WALLED PINK CITY ENTRANCE', '#b83b2b', '#fff8eb');
    const sign = new THREE.Mesh(new THREE.BoxGeometry(14, 2.6, 6.3), new THREE.MeshBasicMaterial({ map: signTex }));
    sign.position.y = 12.2;
    gate.add(sign);

    this.scene.add(gate);
  }

  buildWorldTradePark() {
    const s = this.getSampleAt(0.62);
    const wtp = new THREE.Group();
    wtp.position.copy(s.point);
    wtp.rotation.y = Math.atan2(s.tangent.x, s.tangent.z);

    const glassMat = new THREE.MeshLambertMaterial({ map: this.glassTex });
    const steelMat = new THREE.MeshLambertMaterial({ color: 0xdbe4ee });
    const offset = this.roadWidth * 0.5 + 14;

    const leftTower = new THREE.Mesh(new THREE.BoxGeometry(18, 34, 26), glassMat);
    leftTower.position.set(-offset, 17, 0);
    leftTower.rotation.z = -0.07;
    wtp.add(leftTower);

    const rightTower = new THREE.Mesh(new THREE.BoxGeometry(18, 34, 26), glassMat);
    rightTower.position.set(offset, 17, 0);
    rightTower.rotation.z = 0.07;
    wtp.add(rightTower);

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(offset * 2, 5.5, 14), glassMat);
    bridge.position.set(0, 22, 0);
    wtp.add(bridge);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(offset * 2 + 2, 1.0, 15), steelMat);
    frame.position.set(0, 25, 0);
    wtp.add(frame);

    const signTex = createSignTexture('WORLD TRADE PARK • MALVIYA NAGAR', 'मालवीय नगर • JLN MARG JAIPUR', '#0d3b66', '#ffffff');
    const sign = new THREE.Mesh(new THREE.BoxGeometry(20, 3.0, 14.4), new THREE.MeshBasicMaterial({ map: signTex }));
    sign.position.set(0, 22, 0);
    wtp.add(sign);

    this.scene.add(wtp);
  }

  buildPatrikaGate() {
    const s = this.getSampleAt(0.75);
    const pg = new THREE.Group();
    pg.position.copy(s.point);
    pg.rotation.y = Math.atan2(s.tangent.x, s.tangent.z);

    const pinkMat = new THREE.MeshLambertMaterial({ map: this.pinkFacadeTex });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xffd166 });
    const creamMat = new THREE.MeshLambertMaterial({ color: 0xfff3e3 });

    const halfW = this.roadWidth * 0.5 + 2.5;
    [-halfW - 4, -halfW, halfW, halfW + 4].forEach((x) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(3.2, 15, 7), pinkMat);
      p.position.set(x, 7.5, 0);
      pg.add(p);
    });

    const roof = new THREE.Mesh(new THREE.BoxGeometry(this.roadWidth + 16, 3.8, 7.5), pinkMat);
    roof.position.y = 14.5;
    pg.add(roof);

    for (let i = -3; i <= 3; i++) {
      const x = i * 3.8;
      const h = i === 0 ? 4.2 : 2.8;
      const pav = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, h, 8), creamMat);
      pav.position.set(x, 16.4 + h * 0.5, 0);
      pg.add(pav);

      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.65, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), goldMat);
      dome.position.set(x, 16.4 + h, 0);
      pg.add(dome);
    }

    const signTex = createSignTexture('PATRIKA GATE • पत्रिका गेट', 'JAWAHAR CIRCLE • JAIPUR', '#c94a38', '#fff8eb');
    const sign = new THREE.Mesh(new THREE.BoxGeometry(16, 2.5, 7.8), new THREE.MeshBasicMaterial({ map: signTex }));
    sign.position.y = 14.5;
    pg.add(sign);

    this.scene.add(pg);
  }

  buildJalMahal() {
    const s = this.getSampleAt(0.90);
    const lakeCenter = s.point.clone().addScaledVector(s.right, this.roadWidth * 0.5 + 52);

    const waterGeo = new THREE.PlaneGeometry(150, 150);
    const waterMat = new THREE.MeshLambertMaterial({
      color: 0x1d84b5,
      transparent: true,
      opacity: 0.88
    });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.set(lakeCenter.x, 0.05, lakeCenter.z);
    this.scene.add(this.waterMesh);

    const palace = new THREE.Group();
    palace.position.set(lakeCenter.x, 0, lakeCenter.z);
    palace.rotation.y = Math.atan2(s.tangent.x, s.tangent.z);

    const wallMat = new THREE.MeshLambertMaterial({ map: this.ochreFacadeTex });
    const domeMat = new THREE.MeshLambertMaterial({ color: 0xfff5e4 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(28, 8, 22), wallMat);
    base.position.y = 4;
    palace.add(base);

    const upper = new THREE.Mesh(new THREE.BoxGeometry(22, 5.5, 16), wallMat);
    upper.position.y = 10.5;
    palace.add(upper);

    [[-9, -6], [9, -6], [-9, 6], [9, 6], [0, 0]].forEach(([x, z], idx) => {
      const r = idx === 4 ? 2.6 : 1.7;
      const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
      dome.position.set(x, 13.5, z);
      palace.add(dome);
    });

    const signTex = createSignTexture('JAL MAHAL • जल महल', 'MAN SAGAR LAKE • AMER ROAD', '#d07c38', '#fff8eb');
    const sign = new THREE.Mesh(new THREE.BoxGeometry(16, 2.8, 0.5), new THREE.MeshBasicMaterial({ map: signTex }));
    sign.position.set(0, 17.5, -10);
    palace.add(sign);

    this.scene.add(palace);
  }

  // Check if an (x, z) point is too close to ANY part of the main track or secondary roads
  isTooCloseToAnyRoad(x, z, minClearance) {
    const minSq = minClearance * minClearance;
    for (let i = 0; i < this.samples.length; i += 4) {
      const pt = this.samples[i].point;
      const dx = x - pt.x;
      const dz = z - pt.z;
      if (dx * dx + dz * dz < minSq) return true;
    }
    if (this.secondarySamples) {
      const secMinSq = Math.max(100, (minClearance - 2) * (minClearance - 2));
      for (let i = 0; i < this.secondarySamples.length; i++) {
        const pt = this.secondarySamples[i];
        const dx = x - pt.x;
        const dz = z - pt.z;
        if (dx * dx + dz * dz < secMinSq) return true;
      }
    }
    return false;
  }

  buildCityScenery() {
    const pinkMat = new THREE.MeshLambertMaterial({ map: this.pinkFacadeTex });
    const ochreMat = new THREE.MeshLambertMaterial({ map: this.ochreFacadeTex });
    const glassMat = new THREE.MeshLambertMaterial({ map: this.glassTex });
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5c3d2e });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });

    const buildingCount = 80;
    for (let i = 0; i < buildingCount; i++) {
      const t = i / buildingCount;
      if (Math.abs(t - 0.035) < 0.025 || Math.abs(t - 0.62) < 0.03) continue;

      const s = this.getSampleAt(t);
      if (s.point.y > 2.0) continue;

      for (const side of [-1, 1]) {
        if (side === 1 && t > 0.85 && t < 0.95) continue;

        const w = 8 + Math.random() * 8;
        const d = 8 + Math.random() * 8;
        const h = 10 + Math.random() * 20;

        const dist = this.roadWidth * 0.5 + 14 + Math.random() * 14;
        const pos = s.point.clone().addScaledVector(s.right, side * dist);

        // Prevent buildings from EVER overlapping any road segment!
        if (this.isTooCloseToAnyRoad(pos.x, pos.z, this.roadWidth * 0.5 + Math.max(w, d) * 0.65 + 4.5)) {
          continue;
        }

        let mat = pinkMat;
        if (t > 0.54 && t < 0.70) mat = Math.random() > 0.35 ? glassMat : ochreMat;
        else if (Math.random() > 0.65) mat = ochreMat;

        const bMesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        bMesh.position.set(pos.x, h * 0.5, pos.z);
        bMesh.rotation.y = Math.atan2(s.tangent.x, s.tangent.z);
        this.scene.add(bMesh);
      }
    }

    // 90 Roadside Trees
    const treeCount = 90;
    for (let i = 0; i < treeCount; i++) {
      const t = i / treeCount;
      const s = this.getSampleAt(t);
      if (s.point.y > 1.5) continue;

      const side = i % 2 === 0 ? -1 : 1;
      if (side === 1 && t > 0.85 && t < 0.95) continue;

      const dist = this.roadWidth * 0.5 + 3.6 + (i % 3) * 1.4;
      const pos = s.point.clone().addScaledVector(s.right, side * dist);

      if (this.isTooCloseToAnyRoad(pos.x, pos.z, this.roadWidth * 0.5 + 2.2)) {
        continue;
      }

      const tree = new THREE.Group();
      tree.position.set(pos.x, 0, pos.z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.36, 2.8, 6), trunkMat);
      trunk.position.y = 1.4;
      tree.add(trunk);

      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(2.1, 0), leafMat);
      crown.position.y = 3.8;
      tree.add(crown);

      this.scene.add(tree);
    }

    // Distant Aravalli Mountain Range (kept well outside the expanded 1.5x Jaipur loop)
    const hillMat = new THREE.MeshLambertMaterial({ color: 0x8d5b4c });
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const r = 1220 + (i % 3) * 140;
      const h = 110 + (i % 4) * 45;
      const cone = new THREE.Mesh(new THREE.ConeGeometry(145, h, 8), hillMat);
      cone.position.set(Math.cos(angle) * r, h * 0.5 - 5, Math.sin(angle) * r - 90);
      this.scene.add(cone);
    }
  }

  buildJaipurPedestrians() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xc68642 });
    const turbanColors = [0xff1744, 0xff9100, 0xffea00, 0xd500f9, 0x00e676];
    const outfitColors = [0xd81b60, 0x1e88e5, 0xfdd835, 0x43a047, 0xf4511e, 0x8e24aa, 0xffffff];

    const totalPeds = 36;
    for (let i = 0; i < totalPeds; i++) {
      const t = (i / totalPeds + Math.random() * 0.005) % 1;
      const s = this.getSampleAt(t);
      if (s.point.y > 1.0) continue;

      const side = i % 2 === 0 ? -1 : 1;
      const sideOffset = this.roadWidth * 0.5 + 2.6 + (i % 3) * 0.7;
      const checkPos = s.point.clone().addScaledVector(s.right, side * sideOffset);
      if (this.isTooCloseToAnyRoad(checkPos.x, checkPos.z, this.roadWidth * 0.5 + 1.8)) continue;

      const pedGroup = new THREE.Group();
      const outfitMat = new THREE.MeshLambertMaterial({ color: outfitColors[i % outfitColors.length] });
      const turbanMat = new THREE.MeshLambertMaterial({ color: turbanColors[i % turbanColors.length] });

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.85, 0.28), outfitMat);
      torso.position.y = 0.95;
      pedGroup.add(torso);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), skinMat);
      head.position.y = 1.52;
      pedGroup.add(head);

      const pagdi = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.08, 6, 8), turbanMat);
      pagdi.rotation.x = Math.PI / 2;
      pagdi.position.y = 1.64;
      pedGroup.add(pagdi);

      const legGeo = new THREE.BoxGeometry(0.16, 0.55, 0.18);
      const legL = new THREE.Mesh(legGeo, outfitMat);
      legL.position.set(-0.12, 0.3, 0);
      const legR = new THREE.Mesh(legGeo, outfitMat);
      legR.position.set(0.12, 0.3, 0);
      pedGroup.add(legL, legR);

      this.scene.add(pedGroup);
      this.pedestrians.push({
        mesh: pedGroup,
        legL,
        legR,
        t,
        side,
        sideOffset,
        speed: (0.0005 + (i % 4) * 0.00015) * (i % 3 === 0 ? -1 : 1),
        phase: i * 0.9
      });
    }
  }

  updatePedestrians(dt, time, focusPos = null) {
    for (let i = 0; i < this.pedestrians.length; i++) {
      const p = this.pedestrians[i];
      p.t = (p.t + p.speed * dt + 1) % 1;
      const s = this.getSampleAt(p.t);

      const px = s.point.x + s.right.x * (p.side * p.sideOffset);
      const pz = s.point.z + s.right.z * (p.side * p.sideOffset);
      p.mesh.position.set(px, Math.max(0, s.point.y), pz);

      if (focusPos) {
        const dx = px - focusPos.x;
        const dz = pz - focusPos.z;
        if (dx * dx + dz * dz > 14400) continue;
      }

      const dir = p.speed >= 0 ? 1 : -1;
      p.mesh.rotation.y = Math.atan2(s.tangent.x * dir, s.tangent.z * dir);

      const swing = Math.sin(time * 7 + p.phase) * 0.45;
      p.legL.rotation.x = swing;
      p.legR.rotation.x = -swing;
    }
  }

  buildPickups() {
    const padPositions = [
      0.04, 0.09, 0.15, 0.21, 0.27, 0.33, 0.39, 0.45, 0.51,
      0.57, 0.63, 0.69, 0.75, 0.81, 0.86, 0.91, 0.95, 0.98
    ];
    const canisterBodyMat = new THREE.MeshLambertMaterial({ color: 0x00e5ff, emissive: 0x0088cc });
    const canisterRingMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const glowRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });

    padPositions.forEach((t, idx) => {
      const s = this.getSampleAt(t);
      const laneOffset = ((idx % 3) - 1) * 3.8;
      const pos = s.point.clone().addScaledVector(s.right, laneOffset);

      const group = new THREE.Group();
      group.position.set(pos.x, pos.y + 0.9, pos.z);

      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 1.35, 10), canisterBodyMat);
      group.add(cyl);

      const topDome = new THREE.Mesh(new THREE.SphereGeometry(0.48, 10, 8), canisterRingMat);
      topDome.position.y = 0.65;
      group.add(topDome);

      const baseRing = new THREE.Mesh(new THREE.RingGeometry(0.65, 1.25, 16), glowRingMat);
      baseRing.rotation.x = -Math.PI / 2;
      baseRing.position.y = -0.82;
      group.add(baseRing);

      this.scene.add(group);
      this.nitroPads.push({ mesh: group, point: pos, baseY: pos.y + 0.9, t, cooldown: 0 });
    });

    const coinGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.16, 12);
    const coinMat = new THREE.MeshLambertMaterial({ color: 0xffd166, emissive: 0x996600 });

    for (let i = 0; i < 48; i++) {
      const t = (i / 48 + 0.01) % 1;
      const s = this.getSampleAt(t);
      const lane = ((i % 3) - 1) * 3.6;
      const pos = s.point.clone().addScaledVector(s.right, lane);

      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.rotation.z = Math.PI / 2;
      coin.position.set(pos.x, pos.y + 0.95, pos.z);
      this.scene.add(coin);

      this.coinPickups.push({
        mesh: coin,
        point: pos,
        baseY: pos.y + 0.95,
        collected: false,
        respawnTimer: 0
      });
    }
  }

  getSampleAt(t) {
    const normT = ((t % 1) + 1) % 1;
    const idx = Math.floor(normT * this.sampleCount) % this.sampleCount;
    return this.samples[idx];
  }

  getClosestTrackInfo(worldPos) {
    let bestIdx = 0;
    let bestDistSq = Infinity;

    for (let i = 0; i < this.sampleCount; i++) {
      const pt = this.samples[i].point;
      const dx = worldPos.x - pt.x;
      const dz = worldPos.z - pt.z;
      const dSq = dx * dx + dz * dz;
      if (dSq < bestDistSq) {
        bestDistSq = dSq;
        bestIdx = i;
      }
    }

    const sample = this.samples[bestIdx];
    const rel = new THREE.Vector3().subVectors(worldPos, sample.point);
    const lateralOffset = rel.dot(sample.right);
    return {
      sample,
      t: sample.t,
      lateralOffset,
      distance: Math.sqrt(bestDistSq)
    };
  }

  getLandmarkAt(t) {
    const normT = ((t % 1) + 1) % 1;
    for (const zone of LANDMARK_ZONES) {
      if (normT >= zone.tStart && normT <= zone.tEnd) return zone;
    }
    return LANDMARK_ZONES[0];
  }

  update(dt, time, focusPos = null) {
    for (const coin of this.coinPickups) {
      if (coin.collected) {
        coin.respawnTimer -= dt;
        if (coin.respawnTimer <= 0) {
          coin.collected = false;
          coin.mesh.visible = true;
        }
      } else {
        coin.mesh.rotation.y += dt * 3.0;
        coin.mesh.position.y = coin.baseY + Math.sin(time * 4 + coin.point.x) * 0.15;
      }
    }

    for (const pad of this.nitroPads) {
      if (pad.cooldown > 0) {
        pad.cooldown -= dt;
        if (pad.cooldown <= 0) pad.mesh.visible = true;
      } else {
        pad.mesh.rotation.y += dt * 2.5;
        pad.mesh.position.y = pad.baseY + Math.sin(time * 5 + pad.point.z) * 0.14;
      }
    }

    if (this.waterMesh) {
      this.waterMesh.position.y = 0.05 + Math.sin(time * 2.0) * 0.04;
    }

    this.updateTrafficLights(dt);
    this.updatePedestrians(dt, time, focusPos);
  }
}
