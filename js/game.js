/**
 * KOZMINSKI ESCAPE: POLOWANIE NA ECTS
 * js/game.js - Serce gry (Canvas 2D Engine)
 * Akademia Leona Koźmińskiego (ALK)
 */

// Stany gry
const GAME_STATE = {
  START: 'START',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAMEOVER: 'GAMEOVER',
  VICTORY: 'VICTORY'
};

class KozminskiEscapeGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.state = GAME_STATE.START;

    // Parametry rozgrywki
    this.targetECTS = 30;
    this.ects = 0;
    this.stamina = 100;
    this.maxStamina = 100;
    this.isSprinting = false;
    this.coffeesCollected = 0;
    this.startTime = 0;
    this.elapsedTime = 0;

    // Timery power-upów
    this.turboTimer = 0;      // ☕ Kawa: 5 sekund turbo
    this.freezeTimer = 0;     // 💻 Gemini AI: 3.5 sekundy zamrożenia profesora
    this.hasShield = false;   // 🪪 Legitymacja ALK: tarcza ochronna
    this.shieldAngle = 0;

    // Wypowiedzi profesora
    this.professorQuotes = [
      "A gdzie przypis harwardzki?!",
      "Ten bilans się nie zamyka!",
      "Widzę Pana we wrześniu!",
      "USOS właśnie zamknął protokół!",
      "Czy ten esej pisał Pan, czy ChatGPT?!",
      "Nie podpiszę karty egzaminacyjnej!",
      "Proszę schować ten telefon pod ławką!"
    ];
    this.quoteCooldown = 4.0;
    this.bubbleTimer = null;

    // Referencje DOM
    this.dom = {
      ectsCounter: document.getElementById('ects-counter'),
      ectsFill: document.getElementById('ects-progress-fill'),
      staminaBar: document.getElementById('stamina-bar'),
      staminaPercent: document.getElementById('stamina-percent'),
      locationStatus: document.getElementById('location-status'),
      threatStatus: document.getElementById('threat-status'),
      professorBubble: document.getElementById('professor-bubble'),
      bubbleQuote: document.getElementById('bubble-quote'),
      screenStart: document.getElementById('screen-start'),
      screenGameOver: document.getElementById('screen-gameover'),
      screenVictory: document.getElementById('screen-victory'),
      screenPause: document.getElementById('screen-pause'),
      btnStart: document.getElementById('btn-start-game'),
      btnRestart: document.getElementById('btn-restart-game'),
      btnVictoryReplay: document.getElementById('btn-victory-replay'),
      btnResume: document.getElementById('btn-resume-game'),
      btnAudio: document.getElementById('btn-audio-toggle'),
      audioIcon: document.getElementById('audio-icon'),
      btnPause: document.getElementById('btn-pause-toggle'),
      pauseIcon: document.getElementById('pause-icon'),
      gameOverEcts: document.getElementById('gameover-ects'),
      gameOverTime: document.getElementById('gameover-time'),
      gameOverCoffees: document.getElementById('gameover-coffees'),
      victoryEcts: document.getElementById('victory-ects'),
      victoryTime: document.getElementById('victory-time'),
      victoryGrade: document.getElementById('victory-grade')
    };

    // Obsługa sterowania
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      sprint: false
    };

    // Wymiary planszy (Canvas 800 x 540)
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    // Postać Studenta
    this.student = {
      x: 400,
      y: 270,
      radius: 15,
      baseSpeed: 3.3,
      sprintSpeed: 5.6,
      turboSpeed: 7.2,
      angle: 0,
      moving: false,
      walkCycle: 0
    };

    // Postać Egzaminatora (Profesor)
    this.examiner = {
      x: 100,
      y: 100,
      radius: 17,
      baseSpeed: 2.1,
      speed: 2.1,
      angle: 0,
      penAngle: 0,
      frozen: false
    };

    // Elementy mapy i itemy
    this.walls = [];
    this.rooms = [];
    this.items = [];
    this.particles = [];
    this.floatingTexts = [];

    // Inicjalizacja
    this.initCampusMap();
    this.setupControls();
    this.setupTouch();

    // Pętla animacji
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  /* ========================================================================
     1. UKŁAD KAMPUSU NA CANVASIE
     Aule: Aula A, Biblioteka, Dziekanat, Lab Komputerowy + Centralne Patio ALK
     ======================================================================== */
  initCampusMap() {
    // Definicja stref i etykiet
    this.rooms = [
      {
        id: 'aula_a',
        name: 'Aula A',
        x: 20, y: 20, w: 220, h: 160,
        bgColor: '#162238',
        labelX: 130, labelY: 100
      },
      {
        id: 'biblioteka',
        name: 'Biblioteka ALK',
        x: 560, y: 20, w: 220, h: 160,
        bgColor: '#13283f',
        labelX: 670, labelY: 100
      },
      {
        id: 'dziekanat',
        name: 'Dziekanat',
        x: 20, y: 360, w: 220, h: 160,
        bgColor: '#1a2744',
        labelX: 130, labelY: 440
      },
      {
        id: 'lab_komp',
        name: 'Lab Komputerowy',
        x: 560, y: 360, w: 220, h: 160,
        bgColor: '#11223b',
        labelX: 670, labelY: 440
      },
      {
        id: 'patio',
        name: 'Patio ALK 🌿',
        x: 270, y: 170, w: 260, h: 200,
        bgColor: '#08331d',
        labelX: 400, labelY: 270
      }
    ];

    // Ściany stałe z przejściami / drzwiami
    this.walls = [
      // Zewnętrzne granice kampusu
      { x: 0, y: 0, w: 800, h: 16 },
      { x: 0, y: 524, w: 800, h: 16 },
      { x: 0, y: 0, w: 16, h: 540 },
      { x: 784, y: 0, w: 16, h: 540 },

      // Aula A (ściany z wejściami od wschodu i południa)
      { x: 20, y: 176, w: 150, h: 12 },    // dolna ściana lewa
      { x: 236, y: 20, w: 12, h: 100 },    // prawa ściana górna

      // Biblioteka (ściany z wejściami od zachodu i południa)
      { x: 630, y: 176, w: 150, h: 12 },   // dolna ściana prawa
      { x: 552, y: 20, w: 12, h: 100 },    // lewa ściana górna

      // Dziekanat (ściany z wejściami od wschodu i północy)
      { x: 20, y: 352, w: 150, h: 12 },    // górna ściana lewa
      { x: 236, y: 420, w: 12, h: 100 },   // prawa ściana dolna

      // Lab Komputerowy (ściany z wejściami od zachodu i północy)
      { x: 630, y: 352, w: 150, h: 12 },   // górna ściana prawa
      { x: 552, y: 420, w: 12, h: 100 },   // lewa ściana dolna

      // Patio ALK - Donice z palmami & Ławki (przeszkody wewnętrzne)
      { x: 300, y: 210, w: 32, h: 32, type: 'plant' },
      { x: 468, y: 210, w: 32, h: 32, type: 'plant' },
      { x: 300, y: 298, w: 32, h: 32, type: 'plant' },
      { x: 468, y: 298, w: 32, h: 32, type: 'plant' },
      { x: 375, y: 195, w: 50, h: 14, type: 'bench' },
      { x: 375, y: 330, w: 50, h: 14, type: 'bench' }
    ];
  }

  /* ========================================================================
     4. PRZEDMIOTY (Spawnują się wyłącznie poza ścianami)
     📜 ECTS (cel 30) | ☕ Kawa (turbo) | 💻 Gemini AI (freeze) | 🪪 Legitymacja
     ======================================================================== */
  spawnItem(type) {
    const validZones = [
      // Aula A
      { minX: 45, maxX: 210, minY: 45, maxY: 160 },
      // Biblioteka
      { minX: 585, maxX: 750, minY: 45, maxY: 160 },
      // Dziekanat
      { minX: 45, maxX: 210, minY: 375, maxY: 500 },
      // Lab Komputerowy
      { minX: 585, maxX: 750, minY: 375, maxY: 500 },
      // Korytarze i Patio
      { minX: 340, maxX: 460, minY: 230, maxY: 310 },
      { minX: 260, maxX: 540, minY: 60, maxY: 130 },
      { minX: 260, maxX: 540, minY: 410, maxY: 480 }
    ];

    let attempts = 0;
    while (attempts < 60) {
      attempts++;
      const zone = validZones[Math.floor(Math.random() * validZones.length)];
      const x = Math.floor(zone.minX + Math.random() * (zone.maxX - zone.minX));
      const y = Math.floor(zone.minY + Math.random() * (zone.maxY - zone.minY));

      // Sprawdź czy nie koliduje ze ścianami
      if (!this.checkWallCollision(x, y, 16)) {
        return {
          type,
          x,
          y,
          radius: 14,
          pulse: Math.random() * Math.PI * 2,
          created: performance.now()
        };
      }
    }
    return null;
  }

  populateItems() {
    this.items = [];

    // Na start: 6 punktów ECTS
    for (let i = 0; i < 6; i++) {
      const it = this.spawnItem('ects');
      if (it) this.items.push(it);
    }

    // 2 Kawy na Patio/korytarzu
    for (let i = 0; i < 2; i++) {
      const it = this.spawnItem('coffee');
      if (it) this.items.push(it);
    }

    // 1 Gemini AI (w labie lub auli)
    const gemini = this.spawnItem('gemini');
    if (gemini) this.items.push(gemini);

    // 1 Legitymacja ALK
    const idCard = this.spawnItem('id_card');
    if (idCard) this.items.push(idCard);
  }

  ensureItemCounts() {
    // Dbaj o to, aby zawsze na planszy było 5-6 ECTS dopóki gracz nie uzbiera 30
    const ectsCount = this.items.filter(i => i.type === 'ects').length;
    if (ectsCount < 5 && (this.ects + ectsCount) < this.targetECTS) {
      const it = this.spawnItem('ects');
      if (it) this.items.push(it);
    }

    // Kawa (zawsze co najmniej 1)
    if (!this.items.some(i => i.type === 'coffee') && Math.random() < 0.02) {
      const it = this.spawnItem('coffee');
      if (it) this.items.push(it);
    }

    // Gemini AI
    if (!this.items.some(i => i.type === 'gemini') && Math.random() < 0.015) {
      const it = this.spawnItem('gemini');
      if (it) this.items.push(it);
    }

    // Legitymacja ALK (pojawia się rzadziej, jeśli gracz jej nie ma)
    if (!this.hasShield && !this.items.some(i => i.type === 'id_card') && Math.random() < 0.01) {
      const it = this.spawnItem('id_card');
      if (it) this.items.push(it);
    }
  }

  /* ========================================================================
     KOLIZJE ZE ŚCIANAMI (Slide Along Walls)
     ======================================================================== */
  checkWallCollision(x, y, radius) {
    for (const w of this.walls) {
      const closestX = Math.max(w.x, Math.min(x, w.x + w.w));
      const closestY = Math.max(w.y, Math.min(y, w.y + w.h));
      const dx = x - closestX;
      const dy = y - closestY;
      if (dx * dx + dy * dy < radius * radius) {
        return true;
      }
    }
    return false;
  }

  /* ========================================================================
     STEROWANIE (Klawiatura & Dotyk)
     ======================================================================== */
  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = true;
      if (['ShiftLeft', 'ShiftRight', 'Space'].includes(e.code)) this.keys.sprint = true;

      if (e.code === 'KeyP') this.togglePause();
      if (e.code === 'KeyM') this.toggleMute();
      if (e.code === 'Enter' && this.state === GAME_STATE.START) this.start();
      if (e.code === 'KeyR' && this.state === GAME_STATE.GAMEOVER) this.start();
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = false;
      if (['ShiftLeft', 'ShiftRight', 'Space'].includes(e.code)) this.keys.sprint = false;
    });

    // Przyciski menu
    this.dom.btnStart.addEventListener('click', () => this.start());
    this.dom.btnRestart.addEventListener('click', () => this.start());
    this.dom.btnVictoryReplay.addEventListener('click', () => this.start());
    this.dom.btnResume.addEventListener('click', () => this.togglePause());
    this.dom.btnAudio.addEventListener('click', () => this.toggleMute());
    this.dom.btnPause.addEventListener('click', () => this.togglePause());
  }

  setupTouch() {
    const bindTouch = (id, key) => {
      const el = document.getElementById(id);
      if (!el) return;

      const on = (e) => {
        e.preventDefault();
        this.keys[key] = true;
        el.classList.add('active');
        if (window.soundSystem) window.soundSystem.init();
      };
      const off = (e) => {
        e.preventDefault();
        this.keys[key] = false;
        el.classList.remove('active');
      };

      el.addEventListener('touchstart', on, { passive: false });
      el.addEventListener('touchend', off, { passive: false });
      el.addEventListener('touchcancel', off, { passive: false });
      el.addEventListener('mousedown', on);
      el.addEventListener('mouseup', off);
      el.addEventListener('mouseleave', off);
    };

    bindTouch('touch-btn-up', 'up');
    bindTouch('touch-btn-down', 'down');
    bindTouch('touch-btn-left', 'left');
    bindTouch('touch-btn-right', 'right');
    bindTouch('touch-btn-sprint', 'sprint');
  }

  start() {
    this.state = GAME_STATE.PLAYING;
    this.ects = 0;
    this.stamina = 100;
    this.coffeesCollected = 0;
    this.turboTimer = 0;
    this.freezeTimer = 0;
    this.hasShield = false;
    this.startTime = performance.now();

    // Pozycja początkowa: Student na środku Patio, Profesor w auli
    this.student.x = 400;
    this.student.y = 270;
    this.examiner.x = 100;
    this.examiner.y = 90;
    this.examiner.speed = this.examiner.baseSpeed;

    this.populateItems();
    this.updateHUD();

    this.dom.screenStart.classList.add('hidden');
    this.dom.screenGameOver.classList.add('hidden');
    this.dom.screenVictory.classList.add('hidden');
    this.dom.screenPause.classList.add('hidden');

    if (window.soundSystem) {
      window.soundSystem.init();
    }

    this.showProfessorBubble("A gdzie przypis harwardzki?!");
  }

  togglePause() {
    if (this.state === GAME_STATE.PLAYING) {
      this.state = GAME_STATE.PAUSED;
      this.dom.screenPause.classList.remove('hidden');
      this.dom.pauseIcon.textContent = '▶️';
    } else if (this.state === GAME_STATE.PAUSED) {
      this.state = GAME_STATE.PLAYING;
      this.dom.screenPause.classList.add('hidden');
      this.dom.pauseIcon.textContent = '⏸️';
    }
  }

  toggleMute() {
    if (window.soundSystem) {
      const isMuted = window.soundSystem.toggleMute();
      this.dom.audioIcon.textContent = isMuted ? '🔇' : '🔊';
    }
  }

  showProfessorBubble(quote) {
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    this.dom.bubbleQuote.textContent = `„${quote}”`;
    this.dom.professorBubble.classList.remove('hidden');

    this.bubbleTimer = setTimeout(() => {
      this.dom.professorBubble.classList.add('hidden');
    }, 3500);
  }

  /* ========================================================================
     AKTUALIZACJA LOGIKI GRY
     ======================================================================== */
  update(dt) {
    if (this.state !== GAME_STATE.PLAYING) return;

    this.elapsedTime = performance.now() - this.startTime;
    this.shieldAngle += 0.05;

    // 1. Obsługa Power-upów
    if (this.turboTimer > 0) {
      this.turboTimer -= dt;
      this.stamina = this.maxStamina; // Turbo gwarantuje nieograniczoną staminę
      if (Math.random() < 0.4) {
        this.addParticle(this.student.x, this.student.y, '#f2a900', 6, 18);
      }
    }

    if (this.freezeTimer > 0) {
      this.freezeTimer -= dt;
      this.examiner.frozen = true;
      if (Math.random() < 0.3) {
        this.addParticle(this.examiner.x, this.examiner.y, '#38bdf8', 5, 20);
      }
    } else {
      this.examiner.frozen = false;
    }

    // 2. Ruch Studenta (Wektorowy)
    let vx = 0;
    let vy = 0;
    if (this.keys.up) vy -= 1;
    if (this.keys.down) vy += 1;
    if (this.keys.left) vx -= 1;
    if (this.keys.right) vx += 1;

    const len = Math.hypot(vx, vy);
    this.student.moving = len > 0;

    let speed = this.student.baseSpeed;

    // Sprint & Stamina
    if (this.turboTimer > 0) {
      speed = this.student.turboSpeed;
    } else if (this.keys.sprint && this.student.moving && this.stamina > 4) {
      this.isSprinting = true;
      speed = this.student.sprintSpeed;
      this.stamina = Math.max(0, this.stamina - 28 * dt);
      this.addParticle(this.student.x, this.student.y + 10, '#38bdf8', 3, 12);
    } else {
      this.isSprinting = false;
      // Regeneracja staminy: szybsza podczas postoju
      const regen = this.student.moving ? 12 : 26;
      this.stamina = Math.min(this.maxStamina, this.stamina + regen * dt);
    }

    if (len > 0) {
      vx = (vx / len) * speed;
      vy = (vy / len) * speed;
      this.student.angle = Math.atan2(vy, vx);
      this.student.walkCycle += 0.25;

      // Płynny ślizg po ścianach (sprawdzenie X i Y osobno)
      const nx = this.student.x + vx;
      if (!this.checkWallCollision(nx, this.student.y, this.student.radius)) {
        this.student.x = nx;
      }
      const ny = this.student.y + vy;
      if (!this.checkWallCollision(this.student.x, ny, this.student.radius)) {
        this.student.y = ny;
      }
    }

    // 3. Pościg Egzaminatora (Skalowanie prędkości z ECTS)
    if (!this.examiner.frozen) {
      // Egzaminator przyspiesza z każdym zdobytym punktem ECTS!
      const difficultyBonus = this.ects * 0.055;
      this.examiner.speed = this.examiner.baseSpeed + difficultyBonus;

      const exDx = this.student.x - this.examiner.x;
      const exDy = this.student.y - this.examiner.y;
      const exDist = Math.hypot(exDx, exDy);

      if (exDist > 0) {
        const dirX = exDx / exDist;
        const dirY = exDy / exDist;
        this.examiner.angle = Math.atan2(dirY, dirX);
        this.examiner.penAngle += 0.08;

        // Ruch ze ślizgiem
        const pnx = this.examiner.x + dirX * this.examiner.speed;
        if (!this.checkWallCollision(pnx, this.examiner.y, this.examiner.radius)) {
          this.examiner.x = pnx;
        }
        const pny = this.examiner.y + dirY * this.examiner.speed;
        if (!this.checkWallCollision(this.examiner.x, pny, this.examiner.radius)) {
          this.examiner.y = pny;
        }
      }

      // Losowe cytaty profesora podczas pościgu
      this.quoteCooldown -= dt;
      if (this.quoteCooldown <= 0) {
        const randQuote = this.professorQuotes[Math.floor(Math.random() * this.professorQuotes.length)];
        this.showProfessorBubble(randQuote);
        this.quoteCooldown = 6.0 + Math.random() * 4.0;
      }
    }

    // 4. Kolizja Studenta z Profesorem
    const distToProf = Math.hypot(this.student.x - this.examiner.x, this.student.y - this.examiner.y);
    if (distToProf < this.student.radius + this.examiner.radius) {
      if (this.hasShield) {
        // Tarcza legitymacji studenckiej ratuje przed fauliem!
        this.hasShield = false;
        if (window.soundSystem) window.soundSystem.play('shield');
        this.addFloatingText("TARCZA ALK ZUŻYTA! 🪪", this.student.x, this.student.y, '#ffc740');
        this.addExplosion(this.student.x, this.student.y, '#f2a900');

        // Odepchnij profesora i zdezorientuj
        this.examiner.x = Math.max(30, Math.min(770, this.examiner.x + (this.examiner.x - this.student.x) * 1.8));
        this.examiner.y = Math.max(30, Math.min(510, this.examiner.y + (this.examiner.y - this.student.y) * 1.8));
        this.showProfessorBubble("Legitymacja podbita?! Jeszcze Cię złapię!");
      } else {
        // Przegrana - Kampania Wrześniowa!
        this.gameOver();
        return;
      }
    }

    // 5. Zbieranie Przedmiotów
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      const d = Math.hypot(this.student.x - it.x, this.student.y - it.y);

      if (d < this.student.radius + it.radius) {
        // Efekty zebrania
        switch (it.type) {
          case 'ects':
            this.ects++;
            if (window.soundSystem) window.soundSystem.play('ects');
            this.addFloatingText("+1 ECTS 📜", it.x, it.y, '#ffc740');
            this.addExplosion(it.x, it.y, '#f2a900');

            if (this.ects >= this.targetECTS) {
              this.victory();
              return;
            }
            break;

          case 'coffee':
            this.coffeesCollected++;
            this.turboTimer = 5.0; // 5 sekund turbo
            this.stamina = 100;
            if (window.soundSystem) window.soundSystem.play('coffee');
            this.addFloatingText("TURBO KOFEINA ALK! ☕⚡", it.x, it.y, '#38bdf8');
            this.addExplosion(it.x, it.y, '#004b87');
            break;

          case 'gemini':
            this.freezeTimer = 3.5; // 3.5 sekundy paraliżu profesora
            if (window.soundSystem) window.soundSystem.play('freeze');
            this.addFloatingText("GEMINI AI: PARALIŻ PROFESORA! 💻", it.x, it.y, '#38bdf8');
            this.addExplosion(this.examiner.x, this.examiner.y, '#38bdf8');
            this.showProfessorBubble("Czy ten esej pisał Pan, czy ChatGPT?!");
            break;

          case 'id_card':
            this.hasShield = true;
            if (window.soundSystem) window.soundSystem.play('shield');
            this.addFloatingText("TARCZA LEGITYMACJI ALK! 🪪", it.x, it.y, '#ffc740');
            this.addExplosion(it.x, it.y, '#f2a900');
            break;
        }

        // Usunięcie zebranego przedmiotu
        this.items.splice(i, 1);
      }
    }

    // Uzupełniaj przedmioty na planszy
    this.ensureItemCounts();

    // 6. Aktualizacja cząsteczek
    this.updateFX();

    // 7. Aktualizacja HUD
    this.updateHUD();
  }

  gameOver() {
    this.state = GAME_STATE.GAMEOVER;
    if (window.soundSystem) window.soundSystem.play('hit');

    this.dom.gameOverEcts.textContent = `${this.ects} / ${this.targetECTS}`;
    this.dom.gameOverTime.textContent = this.formatTime(this.elapsedTime);
    this.dom.gameOverCoffees.textContent = this.coffeesCollected;
    this.dom.screenGameOver.classList.remove('hidden');
  }

  victory() {
    this.state = GAME_STATE.VICTORY;
    if (window.soundSystem) window.soundSystem.play('win');

    this.dom.victoryEcts.textContent = `${this.ects} / ${this.targetECTS}`;
    this.dom.victoryTime.textContent = this.formatTime(this.elapsedTime);
    this.dom.victoryGrade.textContent = this.elapsedTime < 50000 ? '5.5 (CEL)' : '5.0 (BDB)';
    this.dom.screenVictory.classList.remove('hidden');
  }

  formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  updateHUD() {
    this.dom.ectsCounter.textContent = this.ects;
    const pct = Math.min(100, Math.round((this.ects / this.targetECTS) * 100));
    this.dom.ectsFill.style.width = `${pct}%`;

    const stamInt = Math.round(this.stamina);
    this.dom.staminaBar.style.width = `${stamInt}%`;
    this.dom.staminaPercent.textContent = `${stamInt}%`;

    if (this.stamina < 20) {
      this.dom.staminaBar.classList.add('low');
    } else {
      this.dom.staminaBar.classList.remove('low');
    }

    // Ustalanie bieżącej lokalizacji
    let currentRoom = "Korytarz Kampusu ALK";
    for (const r of this.rooms) {
      if (this.student.x >= r.x && this.student.x <= r.x + r.w &&
          this.student.y >= r.y && this.student.y <= r.y + r.h) {
        currentRoom = r.name;
        break;
      }
    }
    this.dom.locationStatus.textContent = currentRoom;

    // Wskaźnik zagrożenia
    const dist = Math.hypot(this.student.x - this.examiner.x, this.student.y - this.examiner.y);
    if (this.examiner.frozen) {
      this.dom.threatStatus.textContent = "AI: Profesor sparaliżowany ❄️";
      this.dom.threatStatus.style.background = "rgba(56, 189, 248, 0.25)";
      this.dom.threatStatus.style.color = "#38bdf8";
    } else if (dist < 180) {
      this.dom.threatStatus.textContent = "CZERWONY DŁUGOPIS W DŁONI! 🛑";
      this.dom.threatStatus.style.background = "rgba(230, 57, 70, 0.35)";
      this.dom.threatStatus.style.color = "#ff8787";
    } else if (dist < 340) {
      this.dom.threatStatus.textContent = "Pościg egzaminacyjny trwa...";
      this.dom.threatStatus.style.background = "rgba(242, 169, 0, 0.25)";
      this.dom.threatStatus.style.color = "#ffc740";
    } else {
      this.dom.threatStatus.textContent = "Korytarz czysty";
      this.dom.threatStatus.style.background = "rgba(16, 124, 65, 0.25)";
      this.dom.threatStatus.style.color = "#4ade80";
    }
  }

  /* ========================================================================
     EFEKTY CZĄSTECZKOWE
     ======================================================================== */
  addParticle(x, y, color, size, life) {
    this.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      color,
      size,
      maxLife: life,
      life
    });
  }

  addExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12;
      const sp = 2 + Math.random() * 2;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        color,
        size: 3 + Math.random() * 3,
        maxLife: 20,
        life: 20
      });
    }
  }

  addFloatingText(text, x, y, color) {
    this.floatingTexts.push({
      text, x, y, color,
      life: 45,
      maxLife: 45
    });
  }

  updateFX() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.8;
      ft.life--;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  /* ========================================================================
     RENDEROWANIE GRAFIKI CANVAS
     ======================================================================== */
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Tło i Aule z Etykietami
    this.renderRooms();

    // 2. Ściany i Przeszkody
    this.renderWalls();

    // 3. Przedmioty (ECTS, Kawa, Gemini, Legitymacja)
    this.renderItems();

    // 4. Cząsteczki
    this.renderParticles();

    // 5. Postać Studenta
    this.renderStudent();

    // 6. Postać Profesora Egzaminatora
    this.renderExaminer();

    // 7. Pływające teksty
    this.renderFloating();
  }

  renderRooms() {
    // Posadzka korytarza ALK
    this.ctx.fillStyle = '#0a1128';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Siatka korytarza
    this.ctx.strokeStyle = 'rgba(0, 75, 135, 0.15)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // Aule i Patio z etykietami
    for (const r of this.rooms) {
      this.ctx.fillStyle = r.bgColor;
      this.ctx.fillRect(r.x, r.y, r.w, r.h);

      // Obramowanie strefy
      this.ctx.strokeStyle = r.id === 'patio' ? 'rgba(46, 204, 113, 0.4)' : 'rgba(242, 169, 0, 0.3)';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(r.x, r.y, r.w, r.h);

      // Etykieta strefy
      this.ctx.save();
      this.ctx.font = r.id === 'patio' ? 'bold 15px "Space Grotesk", sans-serif' : 'bold 13px "Space Grotesk", sans-serif';
      this.ctx.fillStyle = r.id === 'patio' ? '#4ade80' : '#ffc740';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(r.name, r.labelX, r.labelY);
      this.ctx.restore();
    }
  }

  renderWalls() {
    for (const w of this.walls) {
      if (w.type === 'plant') {
        // Donica z palmami ALK na Patio
        this.ctx.fillStyle = '#0f5132';
        this.ctx.fillRect(w.x, w.y, w.w, w.h);
        this.ctx.strokeStyle = '#2ecc71';
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(w.x, w.y, w.w, w.h);

        // Liść
        this.ctx.fillStyle = '#4ade80';
        this.ctx.beginPath();
        this.ctx.arc(w.x + w.w / 2, w.y + w.h / 2, 10, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (w.type === 'bench') {
        // Ławka
        this.ctx.fillStyle = '#854d0e';
        this.ctx.fillRect(w.x, w.y, w.w, w.h);
        this.ctx.strokeStyle = '#f2a900';
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(w.x, w.y, w.w, w.h);
      } else {
        // Standardowa ściana architektoniczna ALK
        this.ctx.fillStyle = '#002244';
        this.ctx.fillRect(w.x, w.y, w.w, w.h);
        this.ctx.strokeStyle = '#004b87';
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(w.x, w.y, w.w, w.h);

        // Złote wykończenie krawędzi
        this.ctx.fillStyle = '#f2a900';
        this.ctx.fillRect(w.x, w.y, Math.min(w.w, 4), Math.min(w.h, 4));
      }
    }
  }

  renderItems() {
    for (const it of this.items) {
      it.pulse += 0.06;
      const s = 1 + Math.sin(it.pulse) * 0.12;

      this.ctx.save();
      this.ctx.translate(it.x, it.y);
      this.ctx.scale(s, s);

      switch (it.type) {
        case 'ects':
          // 📜 Złoty Indeks ECTS ALK
          this.ctx.beginPath();
          this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
          this.ctx.fillStyle = 'rgba(242, 169, 0, 0.25)';
          this.ctx.fill();

          this.ctx.fillStyle = '#002244';
          this.ctx.fillRect(-10, -12, 20, 24);
          this.ctx.strokeStyle = '#f2a900';
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(-10, -12, 20, 24);

          this.ctx.fillStyle = '#ffc740';
          this.ctx.font = 'bold 8px monospace';
          this.ctx.textAlign = 'center';
          this.ctx.fillText("ECTS", 0, 3);
          break;

        case 'coffee':
          // ☕ Kawa z Patio ALK
          this.ctx.beginPath();
          this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
          this.ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          this.ctx.fill();

          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillRect(-7, -8, 14, 18);
          this.ctx.fillStyle = '#004b87';
          this.ctx.fillRect(-7, -2, 14, 5);

          // Para
          this.ctx.strokeStyle = '#38bdf8';
          this.ctx.lineWidth = 1.5;
          this.ctx.beginPath();
          this.ctx.moveTo(-2, -10);
          this.ctx.lineTo(-2, -15);
          this.ctx.moveTo(2, -10);
          this.ctx.lineTo(2, -15);
          this.ctx.stroke();
          break;

        case 'gemini':
          // 💻 Gemini AI (Laptop z gwiazdą AI)
          this.ctx.beginPath();
          this.ctx.arc(0, 0, 17, 0, Math.PI * 2);
          this.ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
          this.ctx.fill();

          this.ctx.fillStyle = '#0f172a';
          this.ctx.fillRect(-12, -9, 24, 16);
          this.ctx.strokeStyle = '#38bdf8';
          this.ctx.lineWidth = 1.5;
          this.ctx.strokeRect(-12, -9, 24, 16);

          // Ikona gwiazdy AI
          this.ctx.fillStyle = '#38bdf8';
          this.ctx.font = 'bold 10px sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.fillText("✦", 0, 3);
          break;

        case 'id_card':
          // 🪪 Legitymacja ALK (ELS)
          this.ctx.beginPath();
          this.ctx.arc(0, 0, 17, 0, Math.PI * 2);
          this.ctx.fillStyle = 'rgba(242, 169, 0, 0.3)';
          this.ctx.fill();

          this.ctx.fillStyle = '#f8fafc';
          this.ctx.fillRect(-12, -8, 24, 16);
          this.ctx.strokeStyle = '#002244';
          this.ctx.lineWidth = 1.5;
          this.ctx.strokeRect(-12, -8, 24, 16);

          this.ctx.fillStyle = '#004b87';
          this.ctx.fillRect(-10, -6, 7, 12);
          this.ctx.fillStyle = '#f2a900';
          this.ctx.fillRect(-1, -4, 9, 2);
          this.ctx.fillRect(-1, 0, 7, 2);
          break;
      }

      this.ctx.restore();
    }
  }

  renderStudent() {
    this.ctx.save();
    this.ctx.translate(this.student.x, this.student.y);

    // Holograficzna tarcza Legitymacji ALK (jeśli aktywna)
    if (this.hasShield) {
      this.ctx.save();
      this.ctx.rotate(this.shieldAngle);
      this.ctx.strokeStyle = 'rgba(255, 199, 64, 0.85)';
      this.ctx.lineWidth = 2.5;
      this.ctx.setLineDash([8, 6]);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.student.radius + 8, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Turbo poświata po kawie
    if (this.turboTimer > 0) {
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.student.radius + 5, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(242, 169, 0, 0.4)';
      this.ctx.fill();
    }

    this.ctx.rotate(this.student.angle);

    // Cień
    this.ctx.beginPath();
    this.ctx.ellipse(0, 3, 16, 9, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.ctx.fill();

    // Nogi
    const leg = Math.sin(this.student.walkCycle) * 5;
    this.ctx.fillStyle = '#002244';
    this.ctx.fillRect(-10, -12 + leg, 5, 7);
    this.ctx.fillRect(-10, 5 - leg, 5, 7);

    // Tułów (Bluza studenta ALK)
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 13, 0, Math.PI * 2);
    this.ctx.fillStyle = '#004b87';
    this.ctx.fill();
    this.ctx.strokeStyle = '#f2a900';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Plecak
    this.ctx.fillStyle = '#0a1128';
    this.ctx.fillRect(-14, -8, 6, 16);

    // Głowa
    this.ctx.beginPath();
    this.ctx.arc(3, 0, 7, 0, Math.PI * 2);
    this.ctx.fillStyle = '#fed7aa';
    this.ctx.fill();

    this.ctx.restore();
  }

  renderExaminer() {
    this.ctx.save();
    this.ctx.translate(this.examiner.x, this.examiner.y);

    // Efekt zamrożenia przez Gemini AI
    if (this.examiner.frozen) {
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(-22, -22, 44, 44);
      this.ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
      this.ctx.fillRect(-22, -22, 44, 44);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 9px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText("AI FREEZE", 0, -26);
    } else {
      // Czerwona aura pościgu
      this.ctx.beginPath();
      this.ctx.arc(0, 0, this.examiner.radius + 10, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(230, 57, 70, 0.25)';
      this.ctx.fill();
    }

    this.ctx.rotate(this.examiner.angle);

    // Cień
    this.ctx.beginPath();
    this.ctx.ellipse(0, 4, 18, 10, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fill();

    // Marynarka tweedowa
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
    this.ctx.fillStyle = '#451a03';
    this.ctx.fill();
    this.ctx.strokeStyle = '#e63946';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    // Krawat
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(2, -3, 7, 6);

    // Głowa i siwizna
    this.ctx.beginPath();
    this.ctx.arc(4, 0, 8, 0, Math.PI * 2);
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.fill();

    // SŁYNNY CZERWONY DŁUGOPIS WYMIERZONY W STUDENTA! 🖊️
    this.ctx.save();
    this.ctx.translate(12, 7);
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(0, -2, 20, 4);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(16, -2, 4, 4);
    this.ctx.fillStyle = '#e11d48';
    this.ctx.beginPath();
    this.ctx.arc(20, 0, 2.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    this.ctx.restore();
  }

  renderParticles() {
    for (const p of this.particles) {
      const a = p.life / p.maxLife;
      this.ctx.save();
      this.ctx.globalAlpha = a;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  renderFloating() {
    for (const ft of this.floatingTexts) {
      const a = ft.life / ft.maxLife;
      this.ctx.save();
      this.ctx.globalAlpha = a;
      this.ctx.font = 'bold 13px "Space Grotesk", sans-serif';
      this.ctx.fillStyle = ft.color;
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = '#000000';
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    }
  }

  loop(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Inicjalizacja gry po załadowaniu dokumentu
window.addEventListener('DOMContentLoaded', () => {
  window.kozminskiGame = new KozminskiEscapeGame();
});
