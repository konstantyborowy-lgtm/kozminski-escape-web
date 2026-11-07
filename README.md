# Kozminski Escape: Polowanie na ECTS 🎓

> **Oficjalna gra zręcznościowa 2D w klimacie retro-arcade osadzona w murach Akademii Leona Koźmińskiego (ALK) w Warszawie.**

---

## 📖 1. Fabuła, Lore i Zasady Gry

Trwa zimowa sesja egzaminacyjna w **Akademii Leona Koźmińskiego**. Surowy **Egzaminator** uzbrojony w bezlitosny, czerwony długopis krąży po auli i korytarzach, gotów wpisać ocenę niedostateczną i zesłać każdego nieprzygotowanego żaka na **Kampanię Wrześniową**.

Twoim celem jako studenta ALK jest przetrwanie, zebranie kompletu **30 punktów ECTS** i bezpieczna ucieczka przez przeszklone, zielone **Patio ALK**!

### 🗺️ Lokacje Kampusu ALK
- **Aula A:** Duża sala wykładowa – miejsce egzaminów zerowych i kolokwiów.
- **Biblioteka ALK:** Kraina ciszy, podręczników i przypisów w formacie APA/harwardzkim.
- **Dziekanat:** Ostateczna instancja zamykająca protokoły w USOS-ie.
- **Lab Komputerowy:** Królestwo cyberbezpieczeństwa i sztucznej inteligencji.
- **Patio ALK 🌿:** Słynne zielone serce uczelni z palmami, fontanną i ławkami – idealne do manewrowania i gubienia pościgu.

### 🎒 Przedmioty i Mechaniki
| Przedmiot | Działanie |
|---|---|
| 📜 **Punkty ECTS** | Zbieraj indeksy ALK (+1 ECTS). Zdobycie 30 ECTS oznacza natychmiastowe zaliczenie semestru i ocenę 5.0 (BDB). |
| ☕ **Kawa z Patio ALK** | Daje 5 sekund turbo-prędkości (7.2 px/s) oraz natychmiast odnawia 100% staminy. |
| 💻 **Gemini AI** | Paraliżuje egzaminatora w lodowej klatce cyfrowej na 3.5 sekundy. |
| 🪪 **Legitymacja ALK (ELS)** | Aktywuje holograficzną tarczę, która neutralizuje 1 złapanie przez profesora i odpycha go. |
| 👨‍🏫 **Egzaminator** | Z każdym zebranym punktem ECTS profesor przyspiesza! Unikaj bezpośredniego kontaktu z jego czerwonym długopisem. |

---

## 🗂️ 2. Struktura Projektu

Projekt charakteryzuje się czystym, modułowym podziałem kodu i brakiem jakichkolwiek zewnętrznych zależności binarnych audio:

```text
kozminski-escape/
├── index.html          # Semantyczny szkielet HTML5 (HUD, Canvas 800x540, Modale, Mobile D-Pad)
├── css/
│   └── style.css       # Style: Oficjalna paleta ALK (#002244, #f2a900), Glassmorphism, Retro-Arcade
├── js/
│   ├── audio.js        # Moduł SoundSystem – 100% proceduralna synteza Web Audio API (zero plików .mp3/.wav)
│   └── game.js         # Silnik gry: pętla 60 FPS, wektory, strefy ALK, fizyka kolizji i AI profesora
├── metadata.json       # Konfiguracja aplikacji w środowisku AI Studio
└── README.md           # Dokumentacja projektu
```

---

## 🕹️ 3. Instrukcja Sterowania

Gra jest w pełni responsywna – automatycznie dostosowuje interfejs do komputerów stacjonarnych oraz smartfonów.

### 💻 Komputery PC / Laptopy:
- **W, A, S, D** lub **Klawisze Strzałek** — Poruszanie się studentem we wszystkich kierunkach.
- **SHIFT** lub **SPACJA** — Sprint (zużywa staminę; postój odnawia ją dwukrotnie szybciej).
- **P** — Pauza w dziekanacie.
- **M** — Wyciszenie / włączenie efektów dźwiękowych.
- **ENTER** — Rozpoczęcie gry na ekranie startowym.
- **R** — Restart po Kampanii Wrześniowej.

### 📱 Smartfony i Tablety (Mobile-First):
- **Wirtualny D-Pad (po lewej stronie ekranu)** — Dotykowe sterowanie kierunkami (Góra, Dół, Lewo, Prawo).
- **Przycisk SPRINT (po prawej stronie ekranu)** — Przytrzymaj, aby przyspieszyć bieg kosztem staminy.
- Kontrolki dotykowe uaktywniają się automatycznie na ekranach o szerokości poniżej **768px** lub na urządzeniach wyposażonych w panel dotykowy.

---

## 🔊 4. Architektura Dźwięku (Web Audio API)

Wszystkie efekty audio są generowane w czasie rzeczywistym przez syntezator `SoundSystem`:
- `'ects'`: Dwuton monety arcade (fala trójkątna B5 ➔ E6).
- `'coffee'`: Energetyczny sweep częstotliwości (fala piłokształtna 180 Hz ➔ 920 Hz).
- `'shield'`: Harmoniczny akord durowy C-E-G (fala sinusoidalna).
- `'freeze'`: Cybernetyczny glitch z arpeggiem (fala prostokątna).
- `'hit'`: Opadający dramatycznie bas sesyjny (fala piłokształtna 220 Hz ➔ 40 Hz).
- `'win'`: 4-tonowa fanfara stypendialna (C5 ➔ F5 ➔ A5 ➔ C6).

---

*Powodzenia na egzaminach! Nie daj się złapać z czerwonym długopisem i zdobywaj ECTS!* 🚀
