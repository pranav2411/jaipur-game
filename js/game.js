// js/game.js
// Core Game Loop, Manual Driving Physics, 8-Racer AI, Traffic Signal Rules,
// Rajasthan Police Fine (Challan) System, Visual Crash Damage on AI Vehicles & YouTube Audio

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  VEHICLE_CATALOG,
  VEHICLE_ORDER,
  createVehicleMesh,
  loadCustomGLBFile
} from './vehicles.js';
import {
  JaipurWorld,
  JAIPUR_DISTRICTS,
  LANDMARK_ZONES,
  JAIPUR_SECONDARY_ROADS
} from './jaipur_world.js';
import { SoundManager, YOUTUBE_PLAYLIST } from './audio.js';

const AI_DRIVERS = [
  { name: 'Vikram Classic 350', vehicle: 'bike', tint: 0x8b1e1e },
  { name: 'Aarav Swift GT', vehicle: 'car', tint: 0xd62828 },
  { name: 'Raju Jaipur Auto', vehicle: 'auto', tint: null },
  { name: 'Priya Activa 6G', vehicle: 'scooter', tint: 0x1d4e89 },
  { name: 'Kabir XPulse 200', vehicle: 'xpulse', tint: null },
  { name: 'JCTSL Low-Floor AC', vehicle: 'bus', tint: null },
  { name: 'Chotu Pink Tirri', vehicle: 'erickshaw', tint: 0xb5179e }
];

class JaipurRushGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    } catch (_) {}
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.5,
      1000
    );

    this.sound = new SoundManager();
    this.world = new JaipurWorld(this.scene);

    // Persistent progression
    this.coins = parseInt(localStorage.getItem('jaipur_coins') || '3250', 10);
    this.trophies = parseInt(localStorage.getItem('jaipur_trophies') || '1', 10);
    this.upgrades = JSON.parse(localStorage.getItem('jaipur_upgrades') || '{}');

    // Challenge tracking
    this.nitrosCollected = parseInt(localStorage.getItem('jaipur_nitros') || '3', 10);
    this.driftMeters = parseFloat(localStorage.getItem('jaipur_drift') || '120');
    this.visitedLandmarks = new Set(
      JSON.parse(localStorage.getItem('jaipur_landmarks') || '["hawa_mahal"]')
    );

    // Mode & selection state
    this.state = 'MENU'; // MENU | RACING | PAUSED | RESULTS
    this.gameMode = 'race'; // race | roam
    this.selectedDistrict = 'full';
    this.selectedVehicleIdx = 0; // 0 = auto
    this.totalLaps = 3;

    // Input state (100% Manual Throttle & Brake)
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      drift: false,
      nitro: false
    };

    // Player physics state
    this.player = {
      mesh: null,
      type: 'auto',
      pos: new THREE.Vector3(),
      heading: 0,
      speed: 0,
      maxSpeed: 30,
      steerAngle: 0,
      drifting: false,
      driftAngle: 0,
      nitro: 50, // Starts at 50% — refills ONLY when collecting cyan N2O canisters
      boosting: false,
      boostTimer: 0,
      lap: 1,
      trackT: 0,
      lastTrackT: 0,
      totalProgress: 0,
      rank: 1,
      lapStartTime: 0,
      bestLapTime: null,
      currentLapTime: 0,
      offRoad: false,
      crashCount: 0,
      redLightStoppedReward: false
    };

    this.aiRacers = [];
    this.police = {
      active: false,
      mesh: null,
      pos: new THREE.Vector3(),
      heading: 0,
      trackT: 0,
      speed: 0,
      sirenTimer: 0,
      catchCooldown: 0,
      reason: 'TRAFFIC VIOLATION'
    };

    // 3D Crash Spark & Smoke Particle Pool
    this.crashParticles = [];
    this.buildCrashParticlePool();

    this.menuOrbitAngle = 0;
    this.clock = new THREE.Clock();
    this.bannerTimeout = null;
    this.challanTimeout = null;

    this.setupPlayerMesh('auto');
    this.setupPoliceMesh();
    this.setupMinimap();
    this.bindEvents();
    this.setupAudioAndYouTubeCallbacks();
    this.updateMenuUI();
    this.updateChallengesUI();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  // Pool of 28 3D spark/debris cubes for zero-allocation crash bursts
  buildCrashParticlePool() {
    const geo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    for (let i = 0; i < 28; i++) {
      const isSpark = i % 2 === 0;
      const mat = new THREE.MeshBasicMaterial({
        color: isSpark ? 0xffaa00 : 0xff3d00
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.crashParticles.push({
        mesh,
        vel: new THREE.Vector3(),
        life: 0
      });
    }
  }

  spawnCrashBurst(worldPos) {
    for (let i = 0; i < this.crashParticles.length; i++) {
      const p = this.crashParticles[i];
      p.mesh.position.set(
        worldPos.x + (Math.random() - 0.5) * 1.4,
        worldPos.y + 0.9 + Math.random() * 0.8,
        worldPos.z + (Math.random() - 0.5) * 1.4
      );
      p.vel.set(
        (Math.random() - 0.5) * 14,
        3.5 + Math.random() * 7.5,
        (Math.random() - 0.5) * 14
      );
      p.life = 0.45 + Math.random() * 0.35;
      p.mesh.visible = true;
    }
  }

  updateCrashParticles(dt) {
    for (let i = 0; i < this.crashParticles.length; i++) {
      const p = this.crashParticles[i];
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.mesh.visible = false;
        continue;
      }
      p.vel.y -= 18 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.x += 8 * dt;
      p.mesh.rotation.y += 10 * dt;
    }
  }

  setupAudioAndYouTubeCallbacks() {
    // Initialize embedded YouTube IFrame API player for Rapperiya Baalam songs
    this.sound.initYouTubePlayer(YOUTUBE_PLAYLIST[0].id);

    this.sound.onVoiceSubtitle = (hindiText, englishSub) => {
      const toast = document.getElementById('voice-toast');
      const mainEl = document.getElementById('voice-toast-hindi');
      const subEl = document.getElementById('voice-toast-sub');
      if (!toast || !mainEl || !subEl) return;

      mainEl.textContent = `🗣️ "${hindiText}"`;
      subEl.textContent = englishSub;
      toast.classList.remove('hidden');

      clearTimeout(this.voiceToastTimer);
      this.voiceToastTimer = setTimeout(() => {
        toast.classList.add('hidden');
      }, 4200);
    };

    this.sound.onTrackChange = (title) => {
      const songTitle = document.getElementById('song-title-text');
      if (songTitle) songTitle.textContent = title;
    };
  }

  setupPlayerMesh(type) {
    if (this.player.mesh) {
      this.scene.remove(this.player.mesh);
    }

    this.player.type = type;
    this.player.mesh = createVehicleMesh(type);
    this.scene.add(this.player.mesh);

    // Glowing yellow-green speed arc ring under player vehicle
    const ringGeo = new THREE.RingGeometry(1.7, 2.35, 28);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd9ed42,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55
    });
    this.speedRing = new THREE.Mesh(ringGeo, ringMat);
    this.speedRing.rotation.x = -Math.PI / 2;
    this.speedRing.position.y = 0.06;
    this.player.mesh.add(this.speedRing);

    // Twin Cyan/Blue Afterburner Nitro Exhaust Flames
    const flameGeo = new THREE.ConeGeometry(0.38, 2.4, 10);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.9
    });
    this.flameMeshL = new THREE.Mesh(flameGeo, flameMat);
    this.flameMeshL.rotation.x = -Math.PI / 2;
    this.flameMeshL.position.set(-0.45, 0.55, -2.2);
    this.flameMeshL.visible = false;

    this.flameMeshR = new THREE.Mesh(flameGeo, flameMat);
    this.flameMeshR.rotation.x = -Math.PI / 2;
    this.flameMeshR.position.set(0.45, 0.55, -2.2);
    this.flameMeshR.visible = false;

    this.player.mesh.add(this.flameMeshL, this.flameMeshR);

    const startT = JAIPUR_DISTRICTS[this.selectedDistrict]?.startT || 0;
    const sample = this.world.getSampleAt(startT);
    this.player.pos.copy(sample.point);
    this.player.heading = Math.atan2(sample.tangent.x, sample.tangent.z);
    this.player.trackT = startT;
    this.player.lastTrackT = startT;
    this.syncPlayerMeshTransform();
  }

  setupPoliceMesh() {
    this.police.mesh = createVehicleMesh('police');
    this.police.mesh.visible = false;
    this.scene.add(this.police.mesh);
  }

  spawnAIRacers() {
    for (const ai of this.aiRacers) {
      this.scene.remove(ai.mesh);
    }
    this.aiRacers = [];

    const startT = JAIPUR_DISTRICTS[this.selectedDistrict]?.startT || 0;

    AI_DRIVERS.forEach((cfg, idx) => {
      const mesh = createVehicleMesh(cfg.vehicle, cfg.tint);
      this.scene.add(mesh);

      const offsetT = (startT + 0.012 * (idx + 1)) % 1;
      const laneOffset = ((idx % 3) - 1) * 3.8;
      const spec = VEHICLE_CATALOG[cfg.vehicle] || VEHICLE_CATALOG.auto;
      const s = this.world.getSampleAt(offsetT);

      this.aiRacers.push({
        name: cfg.name,
        vehicle: cfg.vehicle,
        mesh,
        trackT: offsetT,
        lap: 1,
        totalProgress: offsetT,
        laneOffset,
        targetLane: laneOffset,
        laneTimer: 2 + Math.random() * 4,
        speed: spec.topSpeed * (0.76 + Math.random() * 0.16),
        baseSpeed: spec.topSpeed * (0.80 + (idx % 4) * 0.045),
        pos: s.point.clone().addScaledVector(s.right, laneOffset),
        heading: Math.atan2(s.tangent.x, s.tangent.z),
        hitCooldown: 0,
        damageTimer: 0,
        damageTilt: 0
      });
    });
  }

  getPlayerEffectiveStats() {
    const spec = VEHICLE_CATALOG[this.player.type] || VEHICLE_CATALOG.auto;
    const lvl = this.upgrades[this.player.type] || 1;
    const mult = 1 + (lvl - 1) * 0.06;
    return {
      topSpeed: spec.topSpeed * mult,
      accel: spec.accel * mult,
      handling: spec.handling * (1 + (lvl - 1) * 0.03),
      mass: spec.mass || 1.0
    };
  }

  startRace() {
    this.sound.init();
    const district = JAIPUR_DISTRICTS[this.selectedDistrict] || JAIPUR_DISTRICTS.full;
    const startT = district.startT;
    const sample = this.world.getSampleAt(startT);

    const vKey = VEHICLE_ORDER[this.selectedVehicleIdx];
    this.setupPlayerMesh(vKey);

    this.player.pos.copy(sample.point);
    this.player.heading = Math.atan2(sample.tangent.x, sample.tangent.z);
    this.player.speed = 0;
    this.player.steerAngle = 0;
    this.player.drifting = false;
    this.player.driftAngle = 0;
    this.player.nitro = 50;
    this.player.boosting = false;
    this.player.boostTimer = 0;
    this.player.lap = 1;
    this.player.trackT = startT;
    this.player.lastTrackT = startT;
    this.player.totalProgress = startT;
    this.player.CrashCount = 0;
    this.player.lapStartTime = performance.now();

    this.spawnAIRacers();

    this.police.active = false;
    this.police.patrolling = true;
    this.police.trackT = (startT + 0.14) % 1;
    const polSample = this.world.getSampleAt(this.police.trackT);
    this.police.pos.copy(polSample.point);
    this.police.heading = Math.atan2(polSample.tangent.x, polSample.tangent.z);
    this.police.speed = 18;
    this.police.mesh.position.copy(this.police.pos);
    this.police.mesh.rotation.y = this.police.heading;
    this.police.mesh.visible = true;

    this.state = 'RACING';
    this.world.setRaceModeGuides(this.gameMode === 'race');
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('results-modal').classList.add('hidden');
    document.getElementById('pause-modal').classList.add('hidden');
    document.getElementById('hud-screen').classList.remove('hidden');

    this.highlightVehicleSwitcher(vKey);
    this.showEventBanner(`🏁 ${district.name.toUpperCase()} — PRESS W / ▲ TO DRIVE!`);
    this.sound.triggerStreetVoice(0);
  }

  returnToMenu() {
    this.state = 'MENU';
    document.getElementById('hud-screen').classList.add('hidden');
    document.getElementById('pause-modal').classList.add('hidden');
    document.getElementById('results-modal').classList.add('hidden');
    document.getElementById('menu-screen').classList.remove('hidden');

    const vKey = VEHICLE_ORDER[this.selectedVehicleIdx];
    this.setupPlayerMesh(vKey);
    this.updateMenuUI();
    this.updateChallengesUI();
  }

  switchVehicleLive(vKey) {
    const idx = VEHICLE_ORDER.indexOf(vKey);
    if (idx === -1) return;
    this.selectedVehicleIdx = idx;

    const oldPos = this.player.pos.clone();
    const oldHeading = this.player.heading;
    const oldSpeed = this.player.speed;
    const oldTrackT = this.player.trackT;

    this.setupPlayerMesh(vKey);
    this.player.pos.copy(oldPos);
    this.player.heading = oldHeading;
    this.player.speed = oldSpeed;
    this.player.trackT = oldTrackT;
    this.syncPlayerMeshTransform();

    this.highlightVehicleSwitcher(vKey);
    const spec = VEHICLE_CATALOG[vKey];
    this.showEventBanner(`🚗 SWITCHED TO ${spec.name.toUpperCase()} (${spec.plate})`);
    this.sound.playHorn(vKey);
  }

  highlightVehicleSwitcher(vKey) {
    document.querySelectorAll('#hud-vehicle-switcher .v-pill').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.vehicle === vKey);
    });
  }

  togglePoliceChase(reason = 'RAJASTHAN POLICE INTERCEPTOR') {
    this.sound.init();
    this.police.active = !this.police.active;
    this.police.mesh.visible = this.police.active;

    if (this.police.active) {
      this.activatePolicePursuit(reason);
    } else {
      this.showEventBanner('🚓 POLICE PURSUIT CLEARED');
    }
  }

  activatePolicePursuit(reason = 'TRAFFIC RULE VIOLATION') {
    this.police.active = true;
    this.police.mesh.visible = true;
    this.police.reason = reason;
    this.police.trackT = (this.player.trackT - 0.016 + 1) % 1;
    const s = this.world.getSampleAt(this.police.trackT);
    this.police.pos.copy(s.point);
    this.police.heading = Math.atan2(s.tangent.x, s.tangent.z);
    this.police.speed = Math.max(24, this.player.speed + 5);
    this.police.catchCooldown = 4.0;
    this.sound.playPoliceSiren();
  }

  issueTrafficChallan(title, fineCoins, subText) {
    this.coins = Math.max(0, this.coins - fineCoins);
    localStorage.setItem('jaipur_coins', String(this.coins));

    if (this.sound.playPoliceWhistle) this.sound.playPoliceWhistle();
    this.sound.triggerStreetVoice(1);

    const hudCoins = document.getElementById('hud-coins');
    if (hudCoins) hudCoins.textContent = this.coins.toLocaleString();
    const menuCoins = document.getElementById('menu-coins');
    if (menuCoins) menuCoins.textContent = this.coins.toLocaleString();

    const challanEl = document.getElementById('challan-alert');
    const titleEl = document.getElementById('challan-title');
    const subEl = document.getElementById('challan-sub');
    if (challanEl && titleEl && subEl) {
      titleEl.textContent = `🚨 ${title}: -₹${fineCoins} COINS`;
      subEl.textContent = subText;
      challanEl.classList.remove('hidden');
      clearTimeout(this.challanTimeout);
      this.challanTimeout = setTimeout(() => {
        challanEl.classList.add('hidden');
      }, 4200);
    }

    this.showEventBanner(`🚨 CHALLAN ISSUED: ${title} (-${fineCoins} COINS)`);
  }

  updatePhysics(dt) {
    const stats = this.getPlayerEffectiveStats();
    const isThrottle = this.keys.up;
    const isBraking = this.keys.down;

    // Nitro Boost activation (Spacebar) — NO passive auto-refill!
    if (this.keys.nitro && this.player.nitro >= 15 && !this.player.boosting) {
      this.player.boosting = true;
      this.player.boostTimer = 2.4;
      this.sound.playNitro();
      this.showEventBanner('⚡ NITRO AFTERBURNER ENGAGED!');
    }

    if (this.player.boosting) {
      this.player.boostTimer -= dt;
      this.player.nitro = Math.max(0, this.player.nitro - 22 * dt);
      if (this.player.boostTimer <= 0 || this.player.nitro <= 0) {
        this.player.boosting = false;
      }
    }

    // Dynamic Camera FOV Warp + Twin Exhaust Flames during Nitro
    const targetFov = this.player.boosting ? 74 : 60;
    if (Math.abs(this.camera.fov - targetFov) > 0.1) {
      this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, dt * 8);
      this.camera.updateProjectionMatrix();
    }
    if (this.flameMeshL && this.flameMeshR) {
      this.flameMeshL.visible = this.player.boosting;
      this.flameMeshR.visible = this.player.boosting;
      if (this.player.boosting) {
        const flicker = 0.85 + Math.random() * 0.45;
        this.flameMeshL.scale.set(1, flicker, 1);
        this.flameMeshR.scale.set(1, flicker, 1);
      }
    }

    const boostMult = this.player.boosting ? 1.38 : 1.0;
    const offRoadPenalty = this.player.offRoad ? 0.72 : 1.0;
    const maxSpd = stats.topSpeed * boostMult * offRoadPenalty;

    // 100% Manual Throttle & Brake / Reverse
    if (isThrottle) {
      this.player.speed += stats.accel * (this.player.boosting ? 1.75 : 1.0) * dt;
      if (this.player.speed > maxSpd) {
        this.player.speed -= 18 * dt;
      }
    } else if (isBraking) {
      if (this.player.speed > 0.5) {
        this.player.speed -= stats.accel * 2.1 * dt;
      } else {
        this.player.speed = Math.max(-10, this.player.speed - stats.accel * 0.9 * dt);
      }
    } else {
      // Natural coasting drag
      if (this.player.speed > 0) {
        this.player.speed = Math.max(0, this.player.speed - 8.5 * dt);
      } else if (this.player.speed < 0) {
        this.player.speed = Math.min(0, this.player.speed + 10.0 * dt);
      }
    }

    // Steering
    let steerInput = 0;
    if (this.keys.left) steerInput += 1;
    if (this.keys.right) steerInput -= 1;

    this.player.drifting =
      this.keys.drift && Math.abs(steerInput) > 0 && this.player.speed > 12;
    const turnRate =
      stats.handling *
      (this.player.drifting ? 1.38 : 1.0) *
      Math.min(1, Math.abs(this.player.speed) / 8);

    const dirSign = this.player.speed >= -0.1 ? 1 : -1;
    this.player.heading += steerInput * turnRate * dirSign * dt;
    this.player.steerAngle = steerInput * 0.45;

    const targetDriftAngle = this.player.drifting ? steerInput * 0.28 : 0;
    this.player.driftAngle +=
      (targetDriftAngle - this.player.driftAngle) * Math.min(1, dt * 10);

    if (this.player.drifting) {
      this.driftMeters += Math.abs(this.player.speed) * dt * 0.8;
    }

    // Advance player position
    this.player.pos.x += Math.sin(this.player.heading) * this.player.speed * dt;
    this.player.pos.z += Math.cos(this.player.heading) * this.player.speed * dt;

    // Snap elevation to road / flyover deck height
    const trackInfo = this.world.getClosestTrackInfo(this.player.pos);
    const roadHalfW = this.world.roadWidth * 0.5;

    if (this.gameMode === 'roam') {
      // TRUE OPEN WORLD MODE: Drive freely across all 12 Jaipur avenues, bazaars & forts!
      const onMainDeck = trackInfo.distance < roadHalfW + 1.5;
      const targetY = onMainDeck ? trackInfo.sample.point.y : 0;
      this.player.pos.y += (targetY - this.player.pos.y) * Math.min(1, dt * 10);
      this.player.offRoad = false;

      // Soft outer city boundary (±1050m)
      this.player.pos.x = Math.max(-1050, Math.min(1050, this.player.pos.x));
      this.player.pos.z = Math.max(-1050, Math.min(1050, this.player.pos.z));
    } else {
      this.player.pos.y = trackInfo.sample.point.y;
      this.player.offRoad = Math.abs(trackInfo.lateralOffset) > roadHalfW - 0.5;

      const maxOffset = roadHalfW + 1.8;
      if (Math.abs(trackInfo.lateralOffset) > maxOffset) {
        const clampedSign = Math.sign(trackInfo.lateralOffset);
        const corrected = trackInfo.sample.point
          .clone()
          .addScaledVector(trackInfo.sample.right, clampedSign * maxOffset);
        this.player.pos.x = corrected.x;
        this.player.pos.z = corrected.z;
        this.player.speed *= 0.90;

        const roadHeading = Math.atan2(
          trackInfo.sample.tangent.x,
          trackInfo.sample.tangent.z
        );
        let diff = roadHeading - this.player.heading;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.player.heading += diff * 0.3;
      }
    }

    // Lap & checkpoint tracking
    this.player.lastTrackT = this.player.trackT;
    this.player.trackT = trackInfo.t;

    const startT = JAIPUR_DISTRICTS[this.selectedDistrict]?.startT || 0;
    const prevRel = (this.player.lastTrackT - startT + 1) % 1;
    const currRel = (this.player.trackT - startT + 1) % 1;

    if (prevRel > 0.88 && currRel < 0.12 && this.player.speed > 0) {
      const now = performance.now();
      const lapTime = (now - this.player.lapStartTime) / 1000;
      this.player.lapStartTime = now;

      if (!this.player.bestLapTime || lapTime < this.player.bestLapTime) {
        this.player.bestLapTime = lapTime;
      }

      if (this.gameMode === 'race') {
        if (this.player.lap >= this.totalLaps) {
          this.finishRace();
          return;
        }
        this.player.lap++;
        this.showEventBanner(`🏁 LAP ${this.player.lap}/${this.totalLaps}!`);
        this.sound.playCoin();
      }
    }

    this.player.totalProgress = this.player.lap - 1 + currRel;

    const zone = this.world.getLandmarkAt(this.player.trackT);
    if (zone && !this.visitedLandmarks.has(zone.id)) {
      this.visitedLandmarks.add(zone.id);
      localStorage.setItem(
        'jaipur_landmarks',
        JSON.stringify([...this.visitedLandmarks])
      );
      this.showEventBanner(`📍 ENTERING ${zone.name}`);
    }

    this.checkTrafficLightRules();
    this.checkPickups();
    this.updateAIRacers(dt, startT);
    this.updatePolice(dt);
    this.computeRankings();
    this.syncPlayerMeshTransform();

    this.sound.updateEngine(
      Math.abs(this.player.speed) / stats.topSpeed,
      this.player.type,
      this.player.boosting,
      dt
    );
  }

  // Enforce Jaipur Traffic Signal Rules + Issue Rajasthan Police Challan on Red Light Jump
  checkTrafficLightRules() {
    const lights = this.world.trafficLights;
    if (!lights || lights.length === 0) return;

    let nearestSignal = null;
    let nearestForwardDist = Infinity;

    for (let i = 0; i < lights.length; i++) {
      const tl = lights[i];
      const forwardT = (tl.t - this.player.trackT + 1) % 1;
      const distMeters = forwardT * this.world.trackLength;

      if (distMeters < nearestForwardDist) {
        nearestForwardDist = distMeters;
        nearestSignal = tl;
      }

      // Check if player just crossed the stop line of this signal
      const prevDiff = (tl.t - this.player.lastTrackT + 1) % 1;
      const currDiff = (tl.t - this.player.trackT + 1) % 1;

      if (prevDiff < 0.015 && currDiff > 0.985 && tl.lastCheckedLap !== this.player.lap) {
        tl.lastCheckedLap = this.player.lap;

        if (tl.state === 'RED' && this.player.speed > 7.8) {
          // Red Light Violation! Issue Challan & dispatch Rajasthan Police
          this.issueTrafficChallan(
            `RED LIGHT JUMP (${tl.name.toUpperCase()})`,
            150,
            'Section 184 MV Act • Rajasthan Police Interceptor Dispatched!'
          );
          this.activatePolicePursuit('RED LIGHT JUMP CHALLAN');
        }
      }

      // Reward stopping at a Red Light within 18m before the stop line
      if (
        tl.state === 'RED' &&
        distMeters < 18 &&
        distMeters > 1 &&
        Math.abs(this.player.speed) < 1.5 &&
        !this.player.redLightStoppedReward
      ) {
        this.player.redLightStoppedReward = true;
        this.coins += 50;
        localStorage.setItem('jaipur_coins', String(this.coins));
        this.sound.playCoin();
        this.showEventBanner('🟢 TRAFFIC RULE OBEYED AT RED LIGHT! +50 COINS');
      } else if (distMeters > 35 && distMeters < 100) {
        this.player.redLightStoppedReward = false;
      }
    }

    // Update Traffic Signal HUD Pill
    const sigPill = document.getElementById('hud-traffic-signal');
    const sigDot = document.getElementById('signal-dot');
    const sigText = document.getElementById('signal-text');
    if (sigPill && sigDot && sigText && nearestSignal) {
      sigDot.className = `signal-dot ${nearestSignal.state.toLowerCase()}`;
      const d = Math.round(nearestForwardDist);
      if (d < 160) {
        sigText.textContent = `${nearestSignal.name}: ${nearestSignal.state} (${nearestSignal.timeLeft}s) • ${d}m`;
      } else {
        sigText.textContent = `Next Signal: ${nearestSignal.state} (${d}m)`;
      }
    }
  }

  checkPickups() {
    // Coins
    for (const coin of this.world.coinPickups) {
      if (coin.collected) continue;
      const dx = this.player.pos.x - coin.point.x;
      const dz = this.player.pos.z - coin.point.z;
      if (dx * dx + dz * dz < 11.5) {
        coin.collected = true;
        coin.mesh.visible = false;
        coin.respawnTimer = 12;
        this.coins += 25;
        this.sound.playCoin();
      }
    }

    // Cyan N2O Canisters (generous 4.0m pickup radius so they always connect reliably)
    for (const pad of this.world.nitroPads) {
      if (pad.cooldown > 0) continue;
      const dx = this.player.pos.x - pad.point.x;
      const dz = this.player.pos.z - pad.point.z;
      if (dx * dx + dz * dz < 16.0) {
        pad.cooldown = 7.0;
        pad.mesh.visible = false;
        this.player.nitro = Math.min(100, this.player.nitro + 50);
        this.nitrosCollected++;
        this.sound.playCoin();
        this.showEventBanner(`🧪 N₂O CANISTER COLLECTED! (+50% NITRO → ${Math.round(this.player.nitro)}%)`);
      }
    }
  }

  updateAIRacers(dt, startT) {
    const playerMass = (VEHICLE_CATALOG[this.player.type] || VEHICLE_CATALOG.auto).mass || 1.0;

    for (const ai of this.aiRacers) {
      if (ai.hitCooldown > 0) ai.hitCooldown -= dt;

      // Decay AI crash tilt & animate rising engine damage smoke if recently crashed
      if (ai.damageTimer > 0) {
        ai.damageTimer -= dt;
        ai.damageTilt *= Math.pow(0.08, dt);
        const smokeGroup = ai.mesh.userData.damageSmoke;
        if (smokeGroup) {
          smokeGroup.visible = true;
          smokeGroup.children.forEach((puff, idx) => {
            puff.position.y = ((performance.now() * 0.002 + idx * 0.35) % 1.4);
            const s = 0.6 + puff.position.y * 0.85;
            puff.scale.set(s, s, s);
          });
        }
      } else if (ai.mesh.userData.damageSmoke) {
        ai.mesh.userData.damageSmoke.visible = false;
        ai.damageTilt = 0;
      }

      ai.laneTimer -= dt;
      if (ai.laneTimer <= 0) {
        ai.laneTimer = 2.5 + Math.random() * 4;
        ai.targetLane = (Math.floor(Math.random() * 3) - 1) * 3.8;
      }
      ai.laneOffset += (ai.targetLane - ai.laneOffset) * Math.min(1, dt * 2.5);
      ai.laneOffset = Math.max(-6.5, Math.min(6.5, ai.laneOffset));

      // AI obeys Red Traffic Lights when within 14m of a stop line
      let stopForRed = false;
      for (let i = 0; i < this.world.trafficLights.length; i++) {
        const tl = this.world.trafficLights[i];
        if (tl.state === 'RED') {
          const distT = (tl.t - ai.trackT + 1) % 1;
          const distM = distT * this.world.trackLength;
          if (distM > 1.5 && distM < 13.0) {
            stopForRed = true;
            break;
          }
        }
      }

      const progressDiff = this.player.totalProgress - ai.totalProgress;
      let rubberBand = 1.0;
      if (progressDiff > 0.08) rubberBand = 1.12;
      else if (progressDiff < -0.08) rubberBand = 0.90;

      const targetSpd = stopForRed ? 2.5 : ai.baseSpeed * rubberBand;
      ai.speed += (targetSpd - ai.speed) * Math.min(1, dt * 3.0);

      const prevT = ai.trackT;
      ai.trackT = (ai.trackT + (ai.speed * dt) / this.world.trackLength) % 1;

      const prevRel = (prevT - startT + 1) % 1;
      const currRel = (ai.trackT - startT + 1) % 1;
      if (prevRel > 0.88 && currRel < 0.12) {
        ai.lap++;
      }
      ai.totalProgress = ai.lap - 1 + currRel;

      const s = this.world.getSampleAt(ai.trackT);
      ai.pos.copy(s.point).addScaledVector(s.right, ai.laneOffset);
      ai.heading = Math.atan2(s.tangent.x, s.tangent.z);

      ai.mesh.position.copy(ai.pos);
      ai.mesh.rotation.y = ai.heading + ai.damageTilt * 0.35;
      ai.mesh.rotation.z = ai.damageTilt;

      if (ai.mesh.userData.wheels) {
        for (const w of ai.mesh.userData.wheels) {
          w.rotation.x += ai.speed * dt * 1.4;
        }
      }

      // Real Vehicle-to-Vehicle Crash Physics & Visual Damage on AI Vehicles
      const dx = this.player.pos.x - ai.pos.x;
      const dz = this.player.pos.z - ai.pos.z;
      const distSq = dx * dx + dz * dz;

      if (distSq < 6.2 && ai.hitCooldown <= 0) {
        ai.hitCooldown = 1.1;
        const aiMass = (VEHICLE_CATALOG[ai.vehicle] || VEHICLE_CATALOG.auto).mass || 1.0;
        const pushDir = Math.sign(ai.laneOffset - this.world.getClosestTrackInfo(this.player.pos).lateralOffset) || 1;

        // Spawn 3D flying sparks & debris right at the collision point!
        const impactPoint = this.player.pos.clone().lerp(ai.pos, 0.5);
        this.spawnCrashBurst(impactPoint);
        this.sound.playCrash();

        // Apply physical knockback, speed loss, tilt jolt, and 4.5s of billowing engine smoke to the hit AI vehicle!
        ai.damageTimer = 4.5;
        ai.damageTilt = pushDir * 0.42;
        ai.laneOffset += pushDir * (playerMass >= aiMass ? 3.4 : 2.1);
        ai.targetLane = ai.laneOffset;
        ai.speed *= 0.58;

        if (playerMass >= aiMass * 1.3) {
          this.player.speed *= 0.92;
          this.showEventBanner(`💥 CRASHED INTO ${ai.name.toUpperCase()}! (DAMAGE INFLICTED)`);
        } else {
          this.player.speed *= 0.76;
          this.showEventBanner(`💥 COLLISION WITH ${ai.name.toUpperCase()}!`);
        }

        // Track rash driving collisions -> trigger Rajasthan Police Fine if repeated
        this.player.crashCount = (this.player.crashCount || 0) + 1;
        if (this.player.crashCount % 3 === 0) {
          this.issueTrafficChallan(
            'RASH DRIVING & COLLISION FINE',
            100,
            `Hit ${ai.name} • Jaipur Traffic Police Challan Issued!`
          );
          if (!this.police.active) {
            this.activatePolicePursuit('RASH DRIVING & HIT CHALLAN');
          }
        }
      }
    }
  }

  updatePolice(dt) {
    if (!this.police.mesh) return;

    if (this.police.catchCooldown > 0) {
      this.police.catchCooldown -= dt;
    }

    // Always patrol Jaipur roads in the Rajasthan Police PCR Van (RJ 14 PC 112)
    if (!this.police.active) {
      this.police.mesh.visible = true;
      this.police.speed = 16;
      this.police.trackT =
        (this.police.trackT + (this.police.speed * dt) / this.world.trackLength) % 1;
      const s = this.world.getSampleAt(this.police.trackT);
      this.police.pos.copy(s.point).addScaledVector(s.right, 3.6);
      this.police.heading = Math.atan2(s.tangent.x, s.tangent.z);
      this.police.mesh.position.copy(this.police.pos);
      this.police.mesh.rotation.y = this.police.heading;

      // If player speeds past Police PCR Van (>82 km/h), Police stops/pursues them!
      const dx = this.player.pos.x - this.police.pos.x;
      const dz = this.player.pos.z - this.police.pos.z;
      if (dx * dx + dz * dz < 144 && this.player.speed > 22.8 && this.police.catchCooldown <= 0) {
        this.activatePolicePursuit('OVERSPEEDING NEAR POLICE CHECKPOINT');
        this.showEventBanner('🚓 POLICE NAKA: OVERSPEEDING DETECTED! PULL OVER!');
      }
      return;
    }

    // Active Pursuit Mode
    this.police.sirenTimer -= dt;
    if (this.police.sirenTimer <= 0) {
      this.police.sirenTimer = 1.0;
      this.sound.playPoliceSiren();
    }

    const targetSpeed = Math.max(26, this.player.speed * 1.08);
    this.police.speed += (targetSpeed - this.police.speed) * dt * 2.5;
    this.police.trackT =
      (this.police.trackT + (this.police.speed * dt) / this.world.trackLength) % 1;

    const s = this.world.getSampleAt(this.police.trackT);
    this.police.pos.copy(s.point);
    this.police.heading = Math.atan2(s.tangent.x, s.tangent.z);

    this.police.mesh.position.copy(this.police.pos);
    this.police.mesh.rotation.y = this.police.heading;

    // When Police PCR catches up, physically STOP the player's vehicle & issue Challan!
    const dx = this.player.pos.x - this.police.pos.x;
    const dz = this.player.pos.z - this.police.pos.z;
    if (dx * dx + dz * dz < 11.5 && this.police.catchCooldown <= 0) {
      this.police.catchCooldown = 8.0;
      this.player.speed = 0; // Police stops your vehicle!
      this.issueTrafficChallan(
        'POLICE STOPPED YOU • CHALLAN',
        120,
        `${this.police.reason} • Rajasthan Police PCR (RJ 14 PC 112)`
      );
      this.police.active = false;
    }
  }

  computeRankings() {
    const standings = [
      { name: '★ YOU (RJ 14)', progress: this.player.totalProgress, isPlayer: true }
    ];
    for (const ai of this.aiRacers) {
      standings.push({ name: ai.name, progress: ai.totalProgress, isPlayer: false });
    }
    standings.sort((a, b) => b.progress - a.progress);
    this.standings = standings;
    this.player.rank = standings.findIndex((s) => s.isPlayer) + 1;
  }

  syncPlayerMeshTransform() {
    if (!this.player.mesh) return;
    this.player.mesh.position.copy(this.player.pos);
    this.player.mesh.rotation.y = this.player.heading + this.player.driftAngle;

    const isTwoWheeler =
      this.player.type === 'bike' ||
      this.player.type === 'scooter' ||
      this.player.type === 'xpulse';
    const leanFactor = isTwoWheeler ? 0.42 : 0.14;
    this.player.mesh.rotation.z =
      -this.player.steerAngle * leanFactor * Math.min(1, this.player.speed / 12);

    if (this.player.mesh.userData.wheels) {
      for (const w of this.player.mesh.userData.wheels) {
        w.rotation.x += this.player.speed * 0.04;
      }
    }

    if (this.speedRing) {
      this.speedRing.material.color.setHex(
        this.player.boosting ? 0x00f5d4 : this.player.drifting ? 0xff9f1c : 0xd9ed42
      );
    }
  }

  updateCamera(dt) {
    if (this.state === 'MENU') {
      this.menuOrbitAngle += dt * 0.35;
      const radius = 8.4;
      const camX = this.player.pos.x + Math.sin(this.menuOrbitAngle) * radius;
      const camZ = this.player.pos.z + Math.cos(this.menuOrbitAngle) * radius;
      this.camera.position.set(camX, this.player.pos.y + 3.1, camZ);
      this.camera.lookAt(
        this.player.pos.x,
        this.player.pos.y + 1.2,
        this.player.pos.z
      );
      return;
    }

    const isBus = this.player.type === 'bus';
    const distBack = (isBus ? 11.5 : 8.2) + (this.player.boosting ? 1.5 : 0);
    const heightUp = isBus ? 4.8 : 3.5;

    const targetCamPos = new THREE.Vector3(
      this.player.pos.x - Math.sin(this.player.heading) * distBack,
      this.player.pos.y + heightUp,
      this.player.pos.z - Math.cos(this.player.heading) * distBack
    );

    this.camera.position.lerp(targetCamPos, Math.min(1, dt * 10));

    const lookAtPos = new THREE.Vector3(
      this.player.pos.x + Math.sin(this.player.heading) * 6,
      this.player.pos.y + 1.4,
      this.player.pos.z + Math.cos(this.player.heading) * 6
    );
    this.camera.lookAt(lookAtPos);
  }

  finishRace() {
    this.state = 'RESULTS';
    const rank = this.player.rank;
    const reward = rank === 1 ? 600 : rank === 2 ? 400 : rank === 3 ? 250 : 120;
    this.coins += reward;
    if (rank <= 3) this.trophies = Math.min(6, this.trophies + 1);

    localStorage.setItem('jaipur_coins', String(this.coins));
    localStorage.setItem('jaipur_trophies', String(this.trophies));
    localStorage.setItem('jaipur_nitros', String(this.nitrosCollected));
    localStorage.setItem('jaipur_drift', String(Math.floor(this.driftMeters)));

    const rankSuffix = ['ST', 'ND', 'RD'][rank - 1] || 'TH';
    document.getElementById('results-title').textContent =
      rank === 1 ? '🏆 KHAMMA GHANI! 1ST PLACE!' : `FINISHED ${rank}${rankSuffix} PLACE!`;
    document.getElementById('results-sub').textContent =
      `You raced across Jaipur in the ${VEHICLE_CATALOG[this.player.type].name}!`;
    document.getElementById('res-rank').textContent = `${rank}${rankSuffix}`;
    document.getElementById('res-coins').textContent = `+${reward}`;
    document.getElementById('res-best-lap').textContent = this.formatTime(
      this.player.bestLapTime || this.player.currentLapTime
    );

    document.getElementById('results-modal').classList.remove('hidden');
    this.sound.playHorn(this.player.type);
  }

  formatTime(sec) {
    if (!sec || !isFinite(sec)) return '0:00.00';
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(2).padStart(5, '0');
    return `${m}:${s}`;
  }

  updateHUD() {
    if (this.state !== 'RACING') return;

    const rank = this.player.rank;
    const suffix = ['ST', 'ND', 'RD'][rank - 1] || 'TH';
    document.getElementById('hud-rank').textContent = rank;
    document.getElementById('hud-rank-suffix').textContent = suffix;
    document.getElementById('hud-lap').textContent =
      this.gameMode === 'roam' ? 'ROAM' : `LAP ${this.player.lap}/${this.totalLaps}`;

    const now = performance.now();
    this.player.currentLapTime = (now - this.player.lapStartTime) / 1000;
    document.getElementById('hud-time').textContent = this.formatTime(
      this.player.currentLapTime
    );
    document.getElementById('hud-best').textContent = this.player.bestLapTime
      ? `BEST ${this.formatTime(this.player.bestLapTime)}`
      : 'BEST --:--.--';

    const zone = this.world.getLandmarkAt(this.player.trackT);
    if (zone) {
      document.getElementById('hud-landmark-name').textContent = zone.name;
    }

    const kmh = Math.round(Math.abs(this.player.speed) * 3.6);
    const gear =
      this.player.speed < -0.5
        ? 'R'
        : Math.max(1, Math.min(5, Math.ceil(kmh / 24)));
    document.getElementById('hud-gear').textContent = gear;
    document.getElementById('hud-kmh').textContent = kmh;

    document.getElementById('hud-coins').textContent = this.coins.toLocaleString();

    const stats = this.getPlayerEffectiveStats();
    const throttlePct = Math.min(
      100,
      Math.round((Math.abs(this.player.speed) / stats.topSpeed) * 100)
    );
    document.getElementById('hud-throttle-fill').style.width = `${throttlePct}%`;

    const nitroPct = Math.round(this.player.nitro);
    const nitroBtn = document.getElementById('btn-nitro');
    nitroBtn.querySelector('.orb-sub').textContent = `${nitroPct}%`;
    nitroBtn.classList.toggle('ready', nitroPct >= 20);

    // Live Standings Leaderboard
    if (this.standings) {
      const board = document.getElementById('hud-leaderboard');
      if (board) {
        board.innerHTML = this.standings
          .slice(0, 5)
          .map(
            (s, idx) =>
              `<div class="lb-row ${s.isPlayer ? 'me' : ''}"><span>${idx + 1}. ${s.name}</span></div>`
          )
          .join('');
      }
    }

    this.drawMinimap();
  }

  setupMinimap() {
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');
  }

  drawMinimap() {
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    ctx.clearRect(0, 0, w, h);

    if (this.world.realMapCanvas) {
      ctx.drawImage(this.world.realMapCanvas, 0, 0, w, h);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#f6efe9';
      ctx.fillRect(0, 0, w, h);
    }

    const mapX = (x) => w * 0.5 + x * 0.22;
    const mapZ = (z) => h * 0.56 + z * 0.22;

    // Secondary Jaipur City Roads (MI Road, Tonk Road, JLN Marg, Queens Road, etc.)
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.2;
    for (const rd of JAIPUR_SECONDARY_ROADS) {
      ctx.beginPath();
      rd.pts.forEach(([rx, , rz], i) => {
        if (i === 0) ctx.moveTo(mapX(rx), mapZ(rz));
        else ctx.lineTo(mapX(rx), mapZ(rz));
      });
      ctx.stroke();
    }

    // Main Jaipur Grand Ring & Flyover Highway
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 5;
    ctx.beginPath();
    this.world.samples.forEach((s, i) => {
      const px = mapX(s.point.x);
      const pz = mapZ(s.point.z);
      if (i === 0) ctx.moveTo(px, pz);
      else ctx.lineTo(px, pz);
    });
    ctx.closePath();
    ctx.stroke();

    // Traffic Lights on Minimap
    for (const tl of this.world.trafficLights) {
      ctx.fillStyle =
        tl.state === 'RED' ? '#ff1744' : tl.state === 'YELLOW' ? '#ffea00' : '#00e676';
      ctx.beginPath();
      ctx.arc(mapX(tl.point.x), mapZ(tl.point.z), 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // AI Dots
    for (const ai of this.aiRacers) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(mapX(ai.pos.x), mapZ(ai.pos.z), 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Police Dot
    if (this.police.active) {
      ctx.fillStyle = Math.floor(performance.now() / 200) % 2 === 0 ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(mapX(this.police.pos.x), mapZ(this.police.pos.z), 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player Dot
    ctx.fillStyle = '#10b981';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mapX(this.player.pos.x), mapZ(this.player.pos.z), 5.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Major Jaipur Area Labels
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 7px sans-serif';
    ctx.fillText('HAWA MAHAL', mapX(0) - 24, mapZ(55));
    ctx.fillText('VAISHALI FLYOVER', mapX(295) - 38, mapZ(60));
    ctx.fillText('MANSAROVAR', mapX(170) - 25, mapZ(-285));
    ctx.fillText('MALVIYA / WTP', mapX(-140) - 26, mapZ(-295));
    ctx.fillText('AMBER / FORTS', mapX(-230) - 24, mapZ(80));
  }

  updateMenuUI() {
    const vKey = VEHICLE_ORDER[this.selectedVehicleIdx];
    const spec = VEHICLE_CATALOG[vKey];
    const lvl = this.upgrades[vKey] || 1;
    const bonus = (lvl - 1) * 5;

    document.getElementById('vehicle-name').textContent = spec.name;
    document.getElementById('vehicle-plate').textContent = spec.plate;
    document.getElementById('stat-speed').style.width = `${Math.min(100, spec.speedStat + bonus)}%`;
    document.getElementById('stat-accel').style.width = `${Math.min(100, spec.accelStat + bonus)}%`;
    document.getElementById('stat-grip').style.width = `${Math.min(100, spec.gripStat + bonus)}%`;
    document.getElementById('vehicle-class-badge').textContent = `${spec.category} • LVL ${lvl}`;
    document.getElementById('vehicle-index-badge').textContent =
      `${this.selectedVehicleIdx + 1} / ${VEHICLE_ORDER.length}`;

    document.getElementById('menu-coins').textContent = this.coins.toLocaleString();
    document.getElementById('menu-trophies').textContent = `${this.trophies}/6`;

    document.querySelectorAll('#vehicle-quick-tabs .v-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.vehicle === vKey);
    });
  }

  updateChallengesUI() {
    const n = Math.min(8, this.nitrosCollected);
    const d = Math.min(300, Math.floor(this.driftMeters));
    const l = Math.min(7, this.visitedLandmarks.size);

    document.getElementById('ch-nitro-text').innerHTML = `${n}/8 • 🪙 200`;
    document.getElementById('ch-nitro-bar').style.width = `${(n / 8) * 100}%`;

    document.getElementById('ch-drift-text').innerHTML = `${d}/300m • 🪙 400`;
    document.getElementById('ch-drift-bar').style.width = `${(d / 300) * 100}%`;

    document.getElementById('ch-landmark-text').innerHTML = `${l}/7 • 🪙 750`;
    document.getElementById('ch-landmark-bar').style.width = `${(l / 7) * 100}%`;
  }

  showEventBanner(text) {
    const banner = document.getElementById('hud-event-banner');
    if (!banner) return;
    banner.textContent = text;
    banner.classList.remove('hidden');
    clearTimeout(this.bannerTimeout);
    this.bannerTimeout = setTimeout(() => {
      banner.classList.add('hidden');
    }, 2800);
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Keyboard Controls (including keys 1-7 for all 7 vehicles)
    window.addEventListener('keydown', (e) => {
      // Allow typing in the YouTube URL input box without triggering driving keys
      if (document.activeElement && document.activeElement.tagName === 'INPUT') {
        return;
      }

      const code = e.code;
      if (code === 'ArrowLeft' || code === 'KeyA') this.keys.left = true;
      if (code === 'ArrowRight' || code === 'KeyD') this.keys.right = true;
      if (code === 'ArrowUp' || code === 'KeyW') this.keys.up = true;
      if (code === 'ArrowDown' || code === 'KeyS') this.keys.down = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.drift = true;
      if (code === 'Space') this.keys.nitro = true;

      if (code === 'KeyH') {
        this.sound.playHorn(this.player.type);
        this.showEventBanner('📯 DESI HORN HONKED!');
      }
      if (code === 'KeyV') {
        this.sound.init();
        this.sound.triggerStreetVoice();
      }
      if (code === 'KeyP' && this.state === 'RACING') {
        this.togglePoliceChase();
      }
      if (code === 'Escape' && (this.state === 'RACING' || this.state === 'PAUSED')) {
        this.togglePause();
      }

      const numMatch = code.match(/^Digit([1-7])$/);
      if (numMatch) {
        const idx = parseInt(numMatch[1], 10) - 1;
        const vKey = VEHICLE_ORDER[idx];
        if (vKey) {
          if (this.state === 'RACING') {
            this.switchVehicleLive(vKey);
          } else if (this.state === 'MENU') {
            this.selectedVehicleIdx = idx;
            this.setupPlayerMesh(vKey);
            this.updateMenuUI();
          }
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'ArrowLeft' || code === 'KeyA') this.keys.left = false;
      if (code === 'ArrowRight' || code === 'KeyD') this.keys.right = false;
      if (code === 'ArrowUp' || code === 'KeyW') this.keys.up = false;
      if (code === 'ArrowDown' || code === 'KeyS') this.keys.down = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') this.keys.drift = false;
      if (code === 'Space') this.keys.nitro = false;
    });

    // Garage Vehicle Carousel
    document.getElementById('prev-vehicle').addEventListener('click', () => {
      this.sound.init();
      this.selectedVehicleIdx =
        (this.selectedVehicleIdx - 1 + VEHICLE_ORDER.length) % VEHICLE_ORDER.length;
      const vKey = VEHICLE_ORDER[this.selectedVehicleIdx];
      this.setupPlayerMesh(vKey);
      this.updateMenuUI();
    });

    document.getElementById('next-vehicle').addEventListener('click', () => {
      this.sound.init();
      this.selectedVehicleIdx = (this.selectedVehicleIdx + 1) % VEHICLE_ORDER.length;
      const vKey = VEHICLE_ORDER[this.selectedVehicleIdx];
      this.setupPlayerMesh(vKey);
      this.updateMenuUI();
    });

    document.querySelectorAll('#vehicle-quick-tabs .v-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.sound.init();
        const vKey = btn.dataset.vehicle;
        this.selectedVehicleIdx = VEHICLE_ORDER.indexOf(vKey);
        this.setupPlayerMesh(vKey);
        this.updateMenuUI();
      });
    });

    // Upgrade Vehicle
    document.getElementById('btn-upgrade').addEventListener('click', () => {
      this.sound.init();
      const vKey = VEHICLE_ORDER[this.selectedVehicleIdx];
      if (this.coins >= 250) {
        this.coins -= 250;
        this.upgrades[vKey] = (this.upgrades[vKey] || 1) + 1;
        localStorage.setItem('jaipur_coins', String(this.coins));
        localStorage.setItem('jaipur_upgrades', JSON.stringify(this.upgrades));
        this.sound.playCoin();
        this.updateMenuUI();
      }
    });

    // Mode Selection
    document.querySelectorAll('.mode-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-pill').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.gameMode = btn.dataset.mode;
      });
    });

    // District Selection
    document.querySelectorAll('.district-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        document
          .querySelectorAll('.district-pill')
          .forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedDistrict = btn.dataset.district;
        const startT = JAIPUR_DISTRICTS[this.selectedDistrict]?.startT || 0;
        const sample = this.world.getSampleAt(startT);
        this.player.pos.copy(sample.point);
        this.player.heading = Math.atan2(sample.tangent.x, sample.tangent.z);
        this.syncPlayerMeshTransform();
      });
    });

    // Start Race CTA
    document.getElementById('btn-start-race').addEventListener('click', () => {
      this.startRace();
    });

    document.getElementById('btn-mode-info').addEventListener('click', () => {
      this.totalLaps = this.totalLaps === 3 ? 5 : this.totalLaps === 5 ? 1 : 3;
      document.querySelector('#btn-mode-info .sub-desc').textContent =
        `${this.totalLaps} Laps • Traffic Signals • Police Fine`;
      document.querySelector('#btn-start-race .cta-main').textContent =
        `RACE 1/${this.totalLaps} चलो!`;
    });

    // Horns
    ['btn-menu-horn', 'btn-horn-test', 'btn-hud-horn'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          this.sound.playHorn(this.player.type);
          if (this.state === 'RACING') this.showEventBanner('📯 DESI HORN HONKED!');
        });
      }
    });

    // HUD Controls
    document.getElementById('btn-hud-police').addEventListener('click', () => {
      this.togglePoliceChase();
    });

    document.getElementById('btn-hud-mute').addEventListener('click', (e) => {
      const muted = this.sound.toggleMute();
      e.currentTarget.textContent = muted ? '🔇' : '🔊';
    });

    document.getElementById('btn-hud-pause').addEventListener('click', () => {
      this.togglePause();
    });

    document.getElementById('btn-resume').addEventListener('click', () => {
      this.togglePause();
    });

    document.getElementById('btn-back-garage').addEventListener('click', () => {
      this.returnToMenu();
    });

    document.getElementById('btn-race-again').addEventListener('click', () => {
      this.startRace();
    });

    document.getElementById('btn-results-garage').addEventListener('click', () => {
      this.returnToMenu();
    });

    // HUD Live Vehicle Switcher (1-7)
    document.querySelectorAll('#hud-vehicle-switcher .v-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.switchVehicleLive(btn.dataset.vehicle);
      });
    });

    // Touch / Mouse Hold for Mobile Steering, Gas, Brake, Nitro & Drift
    const bindHold = (id, keyName) => {
      const el = document.getElementById(id);
      if (!el) return;
      const onDown = (e) => {
        if (e.cancelable) e.preventDefault();
        this.keys[keyName] = true;
      };
      const onUp = () => {
        this.keys[keyName] = false;
      };
      el.addEventListener('mousedown', onDown);
      el.addEventListener('mouseup', onUp);
      el.addEventListener('mouseleave', onUp);
      el.addEventListener('touchstart', onDown, { passive: false });
      el.addEventListener('touchend', onUp);
      el.addEventListener('touchcancel', onUp);
    };

    bindHold('btn-touch-left', 'left');
    bindHold('btn-touch-right', 'right');
    bindHold('btn-touch-gas', 'up');
    bindHold('btn-touch-brake', 'down');

    const nitroBtn = document.getElementById('btn-nitro');
    nitroBtn.addEventListener('mousedown', () => {
      this.keys.nitro = true;
    });
    nitroBtn.addEventListener('mouseup', () => {
      this.keys.nitro = false;
    });
    nitroBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keys.nitro = true;
    });
    nitroBtn.addEventListener('touchend', () => {
      this.keys.nitro = false;
    });

    const driftBtn = document.getElementById('btn-drift');
    driftBtn.addEventListener('mousedown', () => {
      this.keys.drift = true;
    });
    driftBtn.addEventListener('mouseup', () => {
      this.keys.drift = false;
    });
    driftBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keys.drift = true;
    });
    driftBtn.addEventListener('touchend', () => {
      this.keys.drift = false;
    });

    // Rapperiya Baalam & YouTube Music Bar Controls
    const btnPlayPause = document.getElementById('btn-music-toggle');
    const btnNextSong = document.getElementById('btn-next-song');
    const songTitle = document.getElementById('song-title-text');
    const mp3Input = document.getElementById('custom-mp3-input');
    const glbInput = document.getElementById('custom-glb-input');
    const ytPresetSelect = document.getElementById('yt-preset-select');
    const ytUrlInput = document.getElementById('yt-url-input');
    const btnYtLoad = document.getElementById('btn-yt-load');
    const btnYtVideoToggle = document.getElementById('btn-yt-video-toggle');

    if (btnPlayPause) {
      btnPlayPause.addEventListener('click', () => {
        this.sound.init();
        const playing = this.sound.toggleMusic();
        btnPlayPause.textContent = playing ? '⏸' : '▶️';
      });
    }

    if (btnNextSong) {
      btnNextSong.addEventListener('click', () => {
        this.sound.init();
        const title = this.sound.nextSong();
        if (songTitle) songTitle.textContent = title;
        this.showEventBanner(`🎵 NOW PLAYING: ${title}`);
      });
    }

    if (ytPresetSelect) {
      ytPresetSelect.addEventListener('change', (e) => {
        this.sound.init();
        const idx = parseInt(e.target.value, 10);
        const title = this.sound.selectPresetTrack(idx);
        if (songTitle) songTitle.textContent = title;
        this.showEventBanner(`🎵 YOUTUBE: ${title}`);
      });
    }

    if (btnYtLoad && ytUrlInput) {
      btnYtLoad.addEventListener('click', () => {
        this.sound.init();
        const val = ytUrlInput.value.trim();
        if (!val) return;
        const ok = this.sound.playYouTubeTrack(val, `YouTube Track (${val.slice(0, 18)})`);
        if (ok) {
          this.showEventBanner('🎵 PLAYING CUSTOM YOUTUBE SONG!');
          ytUrlInput.value = '';
        } else {
          this.showEventBanner('⚠️ INVALID YOUTUBE LINK OR VIDEO ID');
        }
      });
    }

    if (btnYtVideoToggle) {
      btnYtVideoToggle.addEventListener('click', () => {
        const dock = document.getElementById('yt-player-dock');
        if (dock) dock.classList.toggle('minimized');
      });
    }

    if (mp3Input) {
      mp3Input.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        this.sound.init();
        const title = this.sound.loadCustomMP3(file);
        if (title && songTitle) {
          songTitle.textContent = `🎵 ${title}`;
          this.showEventBanner(`🎵 PLAYING MP3: ${title.toUpperCase()}`);
        }
      });
    }

    if (glbInput) {
      glbInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const vKey = VEHICLE_ORDER[this.selectedVehicleIdx];
        const ok = await loadCustomGLBFile(file, vKey);
        if (ok) {
          this.setupPlayerMesh(vKey);
          this.showEventBanner(`🚗 LOADED REAL 3D MODEL: ${file.name}`);
        }
      });
    }
  }

  togglePause() {
    if (this.state === 'RACING') {
      this.state = 'PAUSED';
      document.getElementById('pause-modal').classList.remove('hidden');
    } else if (this.state === 'PAUSED') {
      this.state = 'RACING';
      this.player.lapStartTime = performance.now() - this.player.currentLapTime * 1000;
      document.getElementById('pause-modal').classList.add('hidden');
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    const dt = Math.min(0.05, this.clock.getDelta());
    const elapsed = this.clock.getElapsedTime();

    this.world.update(dt, elapsed, this.player.pos);
    this.updateCrashParticles(dt);

    if (this.state === 'RACING') {
      this.updatePhysics(dt);
      this.updateHUD();
    }

    this.updateCamera(dt);
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.jaipurGame = new JaipurRushGame();
});
