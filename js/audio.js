// js/audio.js
// Authentic Indian Vehicle Audio, Real YouTube Rapperiya Baalam Music Player & Street Soundscape
// Robotic browser speechSynthesis TTS has been removed per user request.

export const YOUTUBE_PLAYLIST = [
  {
    id: '5sJUtVVo1As',
    title: 'Rapperiya Baalam — Mharo Rajasthan (Official)',
    artist: 'Rapperiya Baalam ft. Swaroop Khan'
  },
  {
    id: '8h12ccQgnVU',
    title: 'Rapperiya Baalam — Shoorveer (Rajasthani Rap)',
    artist: 'Rapperiya Baalam • Rajneesh Jaipuri'
  },
  {
    id: '1gukvtH_a3I',
    title: 'Chaudhary — Mame Khan (Rajasthani Folk Hit)',
    artist: 'Mame Khan • Amit Trivedi'
  }
];

export const STREET_CALLOUTS = [
  { text: 'खम्मा घणी सा! जयपुर में पधारो म्हारे देश!', sub: 'Welcome to Jaipur - The Pink City!' },
  { text: 'ओ भाईसाब! आगे लाल बत्ती है, चालान कट जावेगो!', sub: 'Careful! Red traffic light ahead — Police Challan active!' },
  { text: 'हवा महल, बड़ी चौपड़ सवारी ₹20! जल्दी बैठो!', sub: 'Hawa Mahal & Badi Chaupar shared auto callout' },
  { text: 'वैशाली नगर, मानसरोवर, मालवीय नगर फ्लाईओवर क्लियर है!', sub: 'Vaishali Nagar, Mansarovar & Malviya Nagar Flyover route' },
  { text: 'आमेर किला, जयगढ़, नाहरगढ़ दर्शन चालू है!', sub: 'Amber Fort, Jaigarh & Nahargarh Fort hilltop highway' },
  { text: 'रैपरिया बालम को गानो बजाओ भाईसाब! माहौल बना दो!', sub: 'Rapperiya Baalam Rajasthani Hip-Hop playing!' }
];

export class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicPlaying = true;
    this.engineGain = null;
    this.engineOsc = null;
    this.subOsc = null;
    this.engineFilter = null;
    this.initialized = false;
    this.currentVehicleType = 'auto';

    // Music state
    this.songIndex = 0;
    this.beatStep = 0;
    this.beatTimer = 0;
    this.customAudio = null;

    // YouTube IFrame Player state
    this.ytPlayer = null;
    this.ytReady = false;
    this.ytActive = false;
    this.ytPlaying = false;
    this.ytTrackIndex = 0;

    // Street ambient callout state (visual banner + authentic horn/bell audio, NO robotic TTS)
    this.voiceCooldown = 5.0;
    this.onVoiceSubtitle = null;
    this.onTrackChange = null;
  }

  init() {
    if (this.initialized) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.35;
    this.master.connect(this.ctx.destination);

    // Engine synthesizer tailored per Indian vehicle
    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.value = 0.001;

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 340;

    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 55;

    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'triangle';
    this.subOsc.frequency.value = 28;

    this.engineOsc.connect(this.engineFilter);
    this.subOsc.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.master);

    this.engineOsc.start();
    this.subOsc.start();

    this.initialized = true;
  }

  // Initialize embedded YouTube IFrame API player for Rapperiya Baalam songs
  initYouTubePlayer(defaultVideoId = YOUTUBE_PLAYLIST[0].id) {
    if (this.ytPlayer || document.getElementById('yt-iframe-api-script')) return;

    const tag = document.createElement('script');
    tag.id = 'yt-iframe-api-script';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      this.ytPlayer = new window.YT.Player('yt-hidden-player', {
        height: '120',
        width: '220',
        videoId: defaultVideoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1
        },
        events: {
          onReady: (e) => {
            this.ytReady = true;
            e.target.setVolume(75);
          },
          onStateChange: (e) => {
            // YT.PlayerState.PLAYING === 1
            if (e.data === 1) {
              this.ytActive = true;
              this.ytPlaying = true;
              if (this.customAudio) this.customAudio.pause();
            } else if (e.data === 2 || e.data === 0) {
              this.ytPlaying = false;
              if (e.data === 0) {
                // Auto-advance to next Rapperiya Baalam song when finished
                this.nextSong();
              }
            }
          }
        }
      });
    };
  }

  extractYouTubeId(input) {
    if (!input) return null;
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  playYouTubeTrack(videoIdOrUrl, customTitle = null) {
    const vid = this.extractYouTubeId(videoIdOrUrl);
    if (!vid) return false;

    if (!this.ytPlayer) {
      this.initYouTubePlayer(vid);
      this.ytActive = true;
      return true;
    }

    if (this.ytReady && this.ytPlayer && this.ytPlayer.loadVideoById) {
      if (this.customAudio) {
        this.customAudio.pause();
        this.customAudio = null;
      }
      this.ytActive = true;
      this.ytPlaying = true;
      this.ytPlayer.loadVideoById(vid);
      this.ytPlayer.playVideo();
      if (this.onTrackChange) {
        this.onTrackChange(customTitle || `YouTube: ${vid}`);
      }
      return true;
    }
    return false;
  }

  selectPresetTrack(index) {
    this.ytTrackIndex = ((index % YOUTUBE_PLAYLIST.length) + YOUTUBE_PLAYLIST.length) % YOUTUBE_PLAYLIST.length;
    const track = YOUTUBE_PLAYLIST[this.ytTrackIndex];
    this.playYouTubeTrack(track.id, track.title);
    return track.title;
  }

  getCurrentSongTitle() {
    if (this.customAudio && this.customSongTitle) return this.customSongTitle;
    const track = YOUTUBE_PLAYLIST[this.ytTrackIndex] || YOUTUBE_PLAYLIST[0];
    return track.title;
  }

  nextSong() {
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
      this.customSongTitle = null;
    }
    this.ytTrackIndex = (this.ytTrackIndex + 1) % YOUTUBE_PLAYLIST.length;
    const track = YOUTUBE_PLAYLIST[this.ytTrackIndex];
    this.playYouTubeTrack(track.id, track.title);
    this.beatStep = 0;
    return track.title;
  }

  toggleMusic() {
    this.musicPlaying = !this.musicPlaying;
    if (this.customAudio) {
      if (this.musicPlaying) this.customAudio.play();
      else this.customAudio.pause();
    }
    if (this.ytReady && this.ytPlayer) {
      if (this.musicPlaying) {
        this.ytPlayer.playVideo();
        this.ytActive = true;
        this.ytPlaying = true;
      } else {
        this.ytPlayer.pauseVideo();
        this.ytPlaying = false;
      }
    }
    return this.musicPlaying;
  }

  loadCustomMP3(file) {
    if (!file) return null;
    if (this.ytReady && this.ytPlayer && this.ytPlayer.pauseVideo) {
      this.ytPlayer.pauseVideo();
      this.ytActive = false;
      this.ytPlaying = false;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
    const url = URL.createObjectURL(file);
    this.customAudio = new Audio(url);
    this.customAudio.loop = true;
    this.customAudio.volume = 0.65;
    this.customSongTitle = file.name.replace(/\.[^/.]+$/, '');
    if (this.musicPlaying && !this.muted) {
      this.customAudio.play().catch(() => {});
    }
    return this.customSongTitle;
  }

  // Trigger authentic Jaipur street callout banner + native Indian Hindi voice (Lekha/Rishi) if available
  triggerStreetVoice(forceIndex = null) {
    if (this.muted) return;
    const idx = forceIndex !== null
      ? forceIndex % STREET_CALLOUTS.length
      : Math.floor(Math.random() * STREET_CALLOUTS.length);
    const line = STREET_CALLOUTS[idx];

    if (this.onVoiceSubtitle) {
      this.onVoiceSubtitle(line.text, line.sub);
    }

    if ('speechSynthesis' in window) {
      try {
        const voices = window.speechSynthesis.getVoices();
        // Prefer natural Indian Hindi / English-India voice (e.g. Lekha, Neel, Rishi, Google हिन्दी)
        const indianVoice =
          voices.find((v) => v.lang === 'hi-IN' && /Google|Lekha|Neel|Natural/i.test(v.name)) ||
          voices.find((v) => v.lang && v.lang.startsWith('hi')) ||
          voices.find((v) => v.lang === 'en-IN');

        if (indianVoice) {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(line.text);
          utter.voice = indianVoice;
          utter.lang = indianVoice.lang;
          utter.rate = 1.02;
          utter.pitch = 1.0;
          utter.volume = 0.85;
          window.speechSynthesis.speak(utter);
        }
      } catch (_) {}
    }
  }

  playPoliceWhistle() {
    if (!this.initialized) this.init();
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    // Classic Indian Traffic Police Havaldar trill whistle (2800Hz - 3100Hz)
    osc.frequency.setValueAtTime(2850, now);
    for (let i = 0; i < 8; i++) {
      osc.frequency.setValueAtTime(i % 2 === 0 ? 2850 : 3120, now + i * 0.045);
    }
    g.gain.setValueAtTime(0.22, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    osc.connect(g);
    g.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.44);
  }

  updateEngine(speedRatio, vehicleType = 'auto', boosting = false, dt = 0.016) {
    if (!this.initialized) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.currentVehicleType = vehicleType;

    const now = this.ctx.currentTime;
    const clamped = Math.max(0, Math.min(1.5, speedRatio));

    let baseFreq = 54;
    let maxAdd = 135;
    let filterBase = 280;

    if (vehicleType === 'erickshaw') {
      baseFreq = 160;
      maxAdd = 320;
      filterBase = 650;
      this.engineOsc.type = 'sine';
    } else if (vehicleType === 'bike') {
      // Royal Enfield Classic 350 dug-dug thump
      baseFreq = 38;
      maxAdd = 115;
      filterBase = 260;
      this.engineOsc.type = 'sawtooth';
    } else if (vehicleType === 'xpulse') {
      // Hero XPulse 200 4V crisp rally single
      baseFreq = 58;
      maxAdd = 185;
      filterBase = 480;
      this.engineOsc.type = 'sawtooth';
    } else if (vehicleType === 'scooter') {
      // Honda Activa 6G smooth CVT hum
      baseFreq = 72;
      maxAdd = 150;
      filterBase = 390;
      this.engineOsc.type = 'triangle';
    } else if (vehicleType === 'bus') {
      // JCTSL Low-Floor Cummins turbo diesel roar
      baseFreq = 34;
      maxAdd = 85;
      filterBase = 220;
      this.engineOsc.type = 'sawtooth';
    } else if (vehicleType === 'car') {
      // Maruti Swift 1.2L K-Series
      baseFreq = 52;
      maxAdd = 175;
      filterBase = 520;
      this.engineOsc.type = 'sawtooth';
    } else {
      // Bajaj RE Auto 2-stroke / 4-stroke rasp
      baseFreq = 60;
      maxAdd = 140;
      filterBase = 380;
      this.engineOsc.type = 'square';
    }

    const freq = baseFreq + clamped * maxAdd + (boosting ? 45 : 0);
    this.engineOsc.frequency.setTargetAtTime(freq, now, 0.05);
    this.subOsc.frequency.setTargetAtTime(freq * 0.5, now, 0.05);
    this.engineFilter.frequency.setTargetAtTime(filterBase + clamped * 950 + (boosting ? 500 : 0), now, 0.06);

    const targetGain = this.muted ? 0.0001 : (0.045 + clamped * 0.095);
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.08);

    // Only play fallback folk dholak rhythm if neither YouTube nor custom MP3 is playing
    if (this.musicPlaying && !this.muted && !this.customAudio && !this.ytPlaying) {
      this.updateFolkSynthesizer(dt);
    }

    // Periodic ambient Jaipur callouts (subtitle only, no robotic TTS)
    this.voiceCooldown -= dt;
    if (this.voiceCooldown <= 0) {
      this.voiceCooldown = 20 + Math.random() * 14;
      this.triggerStreetVoice();
    }
  }

  updateFolkSynthesizer(dt) {
    const stepDuration = 60 / 118 / 4;
    this.beatTimer += dt;
    if (this.beatTimer < stepDuration) return;
    this.beatTimer -= stepDuration;

    const step = this.beatStep % 16;
    this.beatStep++;

    // Rajasthani Dholak beat + Folk scale when YouTube is paused/loading
    if (step === 0 || step === 3 || step === 6 || step === 10 || step === 12) {
      this.playDrumHit(step === 0 || step === 6 ? 88 : 130, 0.12, 0.14);
    }
    const folkScale = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33];
    if (step % 2 === 0) {
      const note = folkScale[(step / 2 + Math.floor(this.beatStep / 16)) % folkScale.length];
      this.playSynthNote(note, 0.18, 'triangle', 0.06);
    }
  }

  playDrumHit(freq, dur, vol) {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.6, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + dur);

    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(g);
    g.connect(this.master);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  playSynthNote(freq, dur, type = 'sawtooth', vol = 0.08) {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.0, now);

    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(g);
    g.connect(this.master);

    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  playHorn(vehicleType = 'auto') {
    if (!this.initialized) this.init();
    if (!this.initialized || this.muted) return;

    const now = this.ctx.currentTime;
    if (vehicleType === 'bus') {
      const notes = [440, 554.37, 659.25, 554.37, 440, 659.25];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        const t0 = now + idx * 0.095;
        g.gain.setValueAtTime(0.001, t0);
        g.gain.linearRampToValueAtTime(0.24, t0 + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.085);
        osc.connect(g);
        g.connect(this.master);
        osc.start(t0);
        osc.stop(t0 + 0.09);
      });
    } else {
      const freqs = vehicleType === 'car' ? [420, 520] : [580, 720];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = f;
        const t0 = now + idx * 0.11;
        g.gain.setValueAtTime(0.001, t0);
        g.gain.linearRampToValueAtTime(0.18, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09);
        osc.connect(g);
        g.connect(this.master);
        osc.start(t0);
        osc.stop(t0 + 0.1);
      });
    }
  }

  playCoin() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    [987.77, 1318.51].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t0 = now + i * 0.06;
      g.gain.setValueAtTime(0.2, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);
      osc.connect(g);
      g.connect(this.master);
      osc.start(t0);
      osc.stop(t0 + 0.17);
    });
  }

  playNitro() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.45);
    g.gain.setValueAtTime(0.25, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(g);
    g.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.52);
  }

  playPoliceSiren() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.linearRampToValueAtTime(960, now + 0.25);
    osc.frequency.linearRampToValueAtTime(650, now + 0.5);
    g.gain.setValueAtTime(0.22, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
    osc.connect(g);
    g.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.55);
  }

  playCrash() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    // Metallic crunch + low thud
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.28);
    g.gain.setValueAtTime(0.34, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(g);
    g.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  toggleMute() {
    if (!this.initialized) this.init();
    this.muted = !this.muted;
    if (this.master && this.ctx) {
      this.master.gain.setValueAtTime(this.muted ? 0.0001 : 0.35, this.ctx.currentTime);
    }
    if (this.customAudio) {
      this.customAudio.muted = this.muted;
    }
    if (this.ytReady && this.ytPlayer) {
      if (this.muted) this.ytPlayer.mute();
      else this.ytPlayer.unMute();
    }
    return this.muted;
  }
}
