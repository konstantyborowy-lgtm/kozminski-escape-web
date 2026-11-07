/**
 * KOZMINSKI ESCAPE: POLOWANIE NA ECTS
 * js/audio.js - 100% Syntetyzowany moduł dźwiękowy Web Audio API
 * Zero zewnętrznych plików MP3/WAV – czysta synteza falowa retro 8-bit.
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.initialized = false;
  }

  /**
   * Inicjalizacja AudioContext po interakcji użytkownika (zgodnie z polityką przeglądarek)
   */
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Wyciszenie / włączenie dźwięku
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = !!muted;
  }

  /**
   * Odtwarzanie syntetyzowanych efektów retro 8-bit
   * @param {('ects'|'coffee'|'shield'|'freeze'|'hit'|'win')} type - Typ efektu dźwiękowego
   */
  play(type) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    switch (type) {
      case 'ects':
        this.playECTS();
        break;
      case 'coffee':
        this.playCoffee();
        break;
      case 'shield':
        this.playShield();
        break;
      case 'freeze':
        this.playFreeze();
        break;
      case 'hit':
        this.playHit();
        break;
      case 'win':
        this.playWin();
        break;
      default:
        console.warn(`[SoundSystem] Nieznany typ dźwięku: ${type}`);
    }
  }

  /**
   * 1. 'ects': melodyjny, wysoki dwuton monety (trójkątna fala)
   */
  playECTS() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    // Wysoki, czysty dwuton monety (B5 -> E6: 987.77 Hz -> 1318.51 Hz)
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.setValueAtTime(0.2, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  /**
   * 2. 'coffee': dźwięk przyspieszenia (rosnąca częstotliwość fali piłokształtnej)
   */
  playCoffee() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Płynny, energetyczny świst rosnącej częstotliwości (180 Hz -> 920 Hz)
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(920, now + 0.28);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * 3. 'shield': aktywacja tarczy legitymacji studenckiej (akord sinusoidalny)
   */
  playShield() {
    const now = this.ctx.currentTime;
    // Harmoniczny trójdźwięk durowy (C5 - E5 - G5: 523.25, 659.25, 783.99 Hz)
    const chordFrequencies = [523.25, 659.25, 783.99, 1046.50];

    chordFrequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Delikatne wibrujące uniesienie tarczy
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.4);

      gain.gain.setValueAtTime(0.07, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.03);
      osc.stop(now + 0.65);
    });
  }

  /**
   * 4. 'freeze': cybernetyczny paraliż profesora przez AI (fala prostokątna)
   */
  playFreeze() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // 8-bitowa fala prostokątna z arpeggiowanym cyber-stutterem
    osc.type = 'square';
    
    // Szybkie cyfrowe glitche
    osc.frequency.setValueAtTime(840, now);
    osc.frequency.setValueAtTime(320, now + 0.04);
    osc.frequency.setValueAtTime(680, now + 0.08);
    osc.frequency.setValueAtTime(220, now + 0.12);
    osc.frequency.setValueAtTime(540, now + 0.16);
    osc.frequency.setValueAtTime(140, now + 0.22);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * 5. 'hit': faul/przegrana (dramatycznie opadający bas)
   */
  playHit() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Ciężki, dramatyczny spadek basu (220 Hz -> 40 Hz)
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.45);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * 6. 'win': krótka, triumfalna 4-tonowa fanfara zaliczenia sesji
   */
  playWin() {
    const now = this.ctx.currentTime;
    // Triumfalna fanfara: C5 (523.25) -> F5 (698.46) -> A5 (880.00) -> C6 (1046.50)
    const fanfareNotes = [
      { freq: 523.25, time: 0.00, dur: 0.12 },
      { freq: 698.46, time: 0.12, dur: 0.12 },
      { freq: 880.00, time: 0.24, dur: 0.14 },
      { freq: 1046.50, time: 0.38, dur: 0.45 }
    ];

    fanfareNotes.forEach((note) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.18, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });
  }
}

// Globalna instancja modułu dźwiękowego dostępna dla aplikacji
const soundSystem = new SoundSystem();
window.SoundSystem = SoundSystem;
window.soundSystem = soundSystem;

// Zapewnienie wstecznej zgodności z gameAudio
window.gameAudio = soundSystem;

// Eksport ES module, jeśli importowany modułowo
export { SoundSystem, soundSystem };
export default soundSystem;
