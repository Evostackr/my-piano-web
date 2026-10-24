import { audioEngine } from './audio';
import { WHITE_KEYS, BLACK_KEYS, getKeyboardMapping, WhiteKeyData, BlackKeyData } from './pianoData';

// DOM Elements - Piano Interface
const pianoCardWrapper = document.getElementById('pianoCardWrapper') as HTMLElement;
const pianoScrollContainer = document.getElementById('pianoScrollContainer') as HTMLElement;
const pianoSurface = document.getElementById('pianoSurface') as HTMLElement;
const whiteKeysLayout = document.getElementById('whiteKeysLayout') as HTMLElement;
const blackKeysLayout = document.getElementById('blackKeysLayout') as HTMLElement;

const miniMapContainer = document.getElementById('miniMapContainer') as HTMLElement;
const miniMapThumb = document.getElementById('miniMapThumb') as HTMLElement;

const volumeSlider = document.getElementById('volumeSlider') as HTMLInputElement;
const muteBtn = document.getElementById('muteBtn') as HTMLButtonElement;
const volumeIcon = document.getElementById('volumeIcon') as unknown as SVGElement;
const fullscreenBtn = document.getElementById('fullscreenBtn') as HTMLButtonElement;
const toggleShortcutsBtn = document.getElementById('toggleShortcutsBtn') as HTMLButtonElement;
const helpBtn = document.getElementById('helpBtn') as HTMLButtonElement;
const octavePills = document.querySelectorAll<HTMLButtonElement>('.octave-pill');

// DOM Elements - Website Navigation & Modals
const mobileMenuToggle = document.getElementById('mobileMenuToggle') as HTMLButtonElement | null;
const mobileNavDrawer = document.getElementById('mobileNavDrawer') as HTMLElement | null;
const mobileNavLinks = document.querySelectorAll<HTMLAnchorElement>('.mobile-nav-link');
const desktopNavLinks = document.querySelectorAll<HTMLAnchorElement>('.site-nav .nav-link');

const helpModal = document.getElementById('helpModal') as HTMLElement;
const closeModalBtn = document.getElementById('closeModalBtn') as HTMLButtonElement;

const privacyModal = document.getElementById('privacyModal') as HTMLElement | null;
const openPrivacyBtn = document.getElementById('openPrivacyBtn') as HTMLButtonElement | null;
const closePrivacyBtn = document.getElementById('closePrivacyBtn') as HTMLButtonElement | null;

const termsModal = document.getElementById('termsModal') as HTMLElement | null;
const openTermsBtn = document.getElementById('openTermsBtn') as HTMLButtonElement | null;
const closeTermsBtn = document.getElementById('closeTermsBtn') as HTMLButtonElement | null;

const contactModal = document.getElementById('contactModal') as HTMLElement | null;
const openContactBtn = document.getElementById('openContactBtn') as HTMLButtonElement | null;
const closeContactBtn = document.getElementById('closeContactBtn') as HTMLButtonElement | null;

const copyrightYear = document.getElementById('copyrightYear') as HTMLElement | null;

// State
let currentKeyboardOctave = 4;
let showKeyShortcuts = false;
let isMiniMapDragging = false;
let activeKeysMap: Map<string, number> = new Map(); // keyId -> timeoutId
let activePointers: Map<number, HTMLElement> = new Map(); // pointerId -> current key element
let pressedKeyboardCodes: Set<string> = new Set();

// Cache of button elements by ID
const keyElementsById: Map<string, HTMLElement> = new Map();

/**
 * Initialize Piano Keys in the DOM matching Android Layout
 */
function initPianoKeys() {
  // 1. Render White Keys
  WHITE_KEYS.forEach((keyData: WhiteKeyData) => {
    const btn = document.createElement('button');
    btn.id = keyData.id;
    btn.className = 'piano-key-white';
    btn.dataset.sound = keyData.sound;
    btn.dataset.note = keyData.note;
    btn.dataset.octave = String(keyData.octave);
    btn.setAttribute('aria-label', `Piano key ${keyData.note}`);

    const labelSpan = document.createElement('span');
    labelSpan.className = 'key-label';
    labelSpan.textContent = keyData.label;

    const shortcutSpan = document.createElement('span');
    shortcutSpan.className = 'key-shortcut';
    shortcutSpan.textContent = ''; // Will be populated dynamically

    btn.appendChild(labelSpan);
    btn.appendChild(shortcutSpan);
    whiteKeysLayout.appendChild(btn);

    keyElementsById.set(keyData.id, btn);
    bindKeyPointerEvents(btn, keyData.sound);
  });

  // 2. Render Black Keys with exact layout margins
  BLACK_KEYS.forEach((keyData: BlackKeyData) => {
    const btn = document.createElement('button');
    btn.id = keyData.id;
    btn.className = 'piano-key-black';
    btn.dataset.sound = keyData.sound;
    btn.dataset.note = keyData.note;
    btn.dataset.octave = String(keyData.octave);
    btn.style.marginLeft = `${keyData.marginStart}px`;
    btn.setAttribute('aria-label', `Piano sharp key ${keyData.note}`);

    const labelSpan = document.createElement('span');
    labelSpan.className = 'key-label';
    labelSpan.textContent = keyData.label;

    const shortcutSpan = document.createElement('span');
    shortcutSpan.className = 'key-shortcut';
    shortcutSpan.textContent = '';

    btn.appendChild(labelSpan);
    btn.appendChild(shortcutSpan);
    blackKeysLayout.appendChild(btn);

    keyElementsById.set(keyData.id, btn);
    bindKeyPointerEvents(btn, keyData.sound);
  });

  updateShortcutLabels();
}

/**
 * Bind unified Pointer Events for high-performance touch and mouse interaction
 */
function bindKeyPointerEvents(btn: HTMLElement, soundName: string) {
  btn.addEventListener('pointerdown', (e: PointerEvent) => {
    e.preventDefault();
    btn.setPointerCapture(e.pointerId);
    activePointers.set(e.pointerId, btn);
    triggerKey(btn, soundName);
  });

  btn.addEventListener('pointermove', (e: PointerEvent) => {
    if (!activePointers.has(e.pointerId)) return;
    
    // Check if pointer moved to another key (Glissando effect)
    const currentTarget = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('.piano-key-white, .piano-key-black');
    const prevTarget = activePointers.get(e.pointerId);

    if (currentTarget && currentTarget !== prevTarget) {
      if (prevTarget) releaseKey(prevTarget);
      activePointers.set(e.pointerId, currentTarget);
      const targetSound = currentTarget.dataset.sound;
      if (targetSound) {
        triggerKey(currentTarget, targetSound);
      }
    }
  });

  btn.addEventListener('pointerup', (e: PointerEvent) => {
    try {
      if (btn.hasPointerCapture(e.pointerId)) {
        btn.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignored
    }
    activePointers.delete(e.pointerId);
    releaseKey(btn);
  });

  btn.addEventListener('pointercancel', (e: PointerEvent) => {
    try {
      if (btn.hasPointerCapture(e.pointerId)) {
        btn.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignored
    }
    activePointers.delete(e.pointerId);
    releaseKey(btn);
  });
}

/**
 * Trigger visual press and note playback
 * Visual feedback matches Android's 100ms #80ffe5 flash
 */
function triggerKey(btn: HTMLElement, soundName: string) {
  // Clear any pending release timeout
  if (activeKeysMap.has(btn.id)) {
    clearTimeout(activeKeysMap.get(btn.id)!);
    activeKeysMap.delete(btn.id);
  }

  btn.classList.add('active');
  audioEngine.playSound(soundName);
}

/**
 * Release visual press with at least 100ms display to match Android app behavior
 */
function releaseKey(btn: HTMLElement) {
  if (activeKeysMap.has(btn.id)) {
    clearTimeout(activeKeysMap.get(btn.id)!);
  }

  const timeoutId = window.setTimeout(() => {
    btn.classList.remove('active');
    activeKeysMap.delete(btn.id);
  }, 100);

  activeKeysMap.set(btn.id, timeoutId);
}

/**
 * Mini-Map Seekbar Synchronization (matching Android SeekBar + HorizontalScrollView)
 */
function syncMiniMapWithScroll() {
  const maxScroll = pianoScrollContainer.scrollWidth - pianoScrollContainer.clientWidth;
  if (maxScroll <= 0) return;

  const progress = pianoScrollContainer.scrollLeft / maxScroll;
  const containerWidth = miniMapContainer.clientWidth;
  const thumbWidth = miniMapThumb.clientWidth;
  const maxThumbLeft = containerWidth - thumbWidth;

  const targetLeft = Math.max(0, Math.min(maxThumbLeft, progress * maxThumbLeft));
  miniMapThumb.style.transform = `translateX(${targetLeft}px)`;

  // Update active octave pill based on visible region
  updateActiveOctavePill(progress);
}

function scrollToProgress(progress: number, smooth: boolean = false) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const maxScroll = pianoScrollContainer.scrollWidth - pianoScrollContainer.clientWidth;
  const targetX = clampedProgress * maxScroll;

  pianoScrollContainer.scrollTo({
    left: targetX,
    behavior: smooth ? 'smooth' : 'auto',
  });
}

function handleMiniMapPointer(e: MouseEvent | TouchEvent) {
  const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
  const rect = miniMapContainer.getBoundingClientRect();
  const thumbWidth = miniMapThumb.clientWidth;
  const availableTrack = rect.width - thumbWidth;

  if (availableTrack <= 0) return;

  const clickOffset = clientX - rect.left - thumbWidth / 2;
  const progress = Math.max(0, Math.min(1, clickOffset / availableTrack));

  scrollToProgress(progress, false);
}

function initMiniMapEvents() {
  miniMapContainer.addEventListener('mousedown', (e) => {
    isMiniMapDragging = true;
    handleMiniMapPointer(e);
  });

  window.addEventListener('mousemove', (e) => {
    if (isMiniMapDragging) {
      handleMiniMapPointer(e);
    }
  });

  window.addEventListener('mouseup', () => {
    isMiniMapDragging = false;
  });

  miniMapContainer.addEventListener('touchstart', (e) => {
    isMiniMapDragging = true;
    handleMiniMapPointer(e);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (isMiniMapDragging) {
      handleMiniMapPointer(e);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isMiniMapDragging = false;
  });

  pianoScrollContainer.addEventListener('scroll', () => {
    syncMiniMapWithScroll();
  }, { passive: true });
}

/**
 * Octave Quick Navigation
 */
function updateActiveOctavePill(progress: number) {
  // Approximate octave from progress across 7 octaves
  const currentApproxOctave = Math.min(7, Math.max(1, Math.round(progress * 6) + 1));
  octavePills.forEach(pill => {
    const oct = parseInt(pill.dataset.octave || '0', 10);
    pill.classList.toggle('active', oct === currentApproxOctave);
  });
}

function jumpToOctave(octave: number) {
  const targetKey = keyElementsById.get(`keyC${octave}`) || keyElementsById.get(`keyA${octave}`);
  if (targetKey) {
    targetKey.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    currentKeyboardOctave = octave;
    updateShortcutLabels();
  }
}

/**
 * Computer Keyboard Controls
 */
function updateShortcutLabels() {
  // Clear all existing shortcut labels
  keyElementsById.forEach(el => {
    const span = el.querySelector<HTMLElement>('.key-shortcut');
    if (span) span.textContent = '';
  });

  if (!showKeyShortcuts) return;

  const mapping = getKeyboardMapping(currentKeyboardOctave);
  Object.entries(mapping).forEach(([code, keyId]) => {
    const el = keyElementsById.get(keyId);
    if (el) {
      const span = el.querySelector<HTMLElement>('.key-shortcut');
      if (span) {
        let char = code.replace('Key', '');
        if (code === 'Semicolon') char = ';';
        if (code === 'Quote') char = "'";
        if (code === 'BracketRight') char = ']';
        span.textContent = char;
      }
    }
  });
}

function initKeyboardEvents() {
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // Ignore keystrokes when typing into form fields or when modals are active
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (document.querySelector('.modal-overlay.open')) return;

    // Octave Shifting shortcuts
    if (e.code === 'BracketLeft' || (e.code === 'ArrowLeft' && e.altKey)) {
      if (currentKeyboardOctave > 1) {
        currentKeyboardOctave--;
        jumpToOctave(currentKeyboardOctave);
      }
      return;
    }
    if (e.code === 'BracketRight' || (e.code === 'ArrowRight' && e.altKey)) {
      if (currentKeyboardOctave < 6) {
        currentKeyboardOctave++;
        jumpToOctave(currentKeyboardOctave);
      }
      return;
    }

    if (pressedKeyboardCodes.has(e.code)) return; // Prevent key repeat
    pressedKeyboardCodes.add(e.code);

    const mapping = getKeyboardMapping(currentKeyboardOctave);
    const keyId = mapping[e.code as keyof typeof mapping];
    if (keyId) {
      const btn = keyElementsById.get(keyId);
      if (btn) {
        const sound = btn.dataset.sound;
        if (sound) {
          triggerKey(btn, sound);
        }
      }
    }
  });

  window.addEventListener('keyup', (e: KeyboardEvent) => {
    pressedKeyboardCodes.delete(e.code);
    const mapping = getKeyboardMapping(currentKeyboardOctave);
    const keyId = mapping[e.code as keyof typeof mapping];
    if (keyId) {
      const btn = keyElementsById.get(keyId);
      if (btn) {
        releaseKey(btn);
      }
    }
  });

  // Handle window blur to prevent stuck keys
  window.addEventListener('blur', () => {
    pressedKeyboardCodes.clear();
    activePointers.clear();
    keyElementsById.forEach(btn => btn.classList.remove('active'));
    audioEngine.stopAll();
  });
}

/**
 * Top Piano Toolbar Setup
 */
function initToolbar() {
  // Volume Slider
  volumeSlider.addEventListener('input', () => {
    const val = parseFloat(volumeSlider.value);
    audioEngine.setVolume(val);
    updateVolumeIcon(val === 0);
  });

  // Mute Button
  muteBtn.addEventListener('click', () => {
    const isMuted = audioEngine.toggleMute();
    updateVolumeIcon(isMuted);
    if (isMuted) {
      volumeSlider.value = '0';
    } else {
      volumeSlider.value = String(audioEngine.getVolume());
    }
  });

  // Fullscreen
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      pianoCardWrapper.requestFullscreen().catch(() => {
        document.documentElement.requestFullscreen().catch(() => {});
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  document.addEventListener('fullscreenchange', () => {
    const isFull = !!document.fullscreenElement;
    fullscreenBtn.classList.toggle('active', isFull);
    pianoCardWrapper.classList.toggle('fullscreen-mode', isFull);
  });

  // Toggle Keyboard Shortcut Badges
  toggleShortcutsBtn.addEventListener('click', () => {
    showKeyShortcuts = !showKeyShortcuts;
    toggleShortcutsBtn.classList.toggle('active', showKeyShortcuts);
    document.getElementById('siteWrapper')?.classList.toggle('show-shortcuts', showKeyShortcuts);
    updateShortcutLabels();
  });

  // Octave Pills
  octavePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const oct = parseInt(pill.dataset.octave || '4', 10);
      jumpToOctave(oct);
    });
  });

  // Help Modal
  helpBtn.addEventListener('click', () => {
    helpModal.classList.add('open');
  });

  closeModalBtn.addEventListener('click', () => {
    helpModal.classList.remove('open');
  });

  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.classList.remove('open');
    }
  });
}

function updateVolumeIcon(muted: boolean) {
  if (muted) {
    volumeIcon.innerHTML = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
  } else {
    volumeIcon.innerHTML = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
  }
}

/**
 * Professional Website Navigation, Drawer & Modals Setup
 */
function initWebsiteInfrastructure() {
  // 1. Mobile Menu Toggle
  if (mobileMenuToggle && mobileNavDrawer) {
    mobileMenuToggle.addEventListener('click', () => {
      const isOpen = mobileNavDrawer.classList.toggle('open');
      mobileMenuToggle.classList.toggle('open', isOpen);
      mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
      mobileNavDrawer.setAttribute('aria-hidden', String(!isOpen));
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavDrawer.classList.remove('open');
        mobileMenuToggle.classList.remove('open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileNavDrawer.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // 2. Active Desktop Nav Highlight on Scroll
  const sections = [
    { id: 'top', linkText: 'Home' },
    { id: 'play', linkText: 'Play Piano' },
    { id: 'how-to-play', linkText: 'How to Play' },
    { id: 'features', linkText: 'Features' },
    { id: 'piano-guide', linkText: 'Piano Guide' },
    { id: 'faq', linkText: 'FAQ' },
    { id: 'about', linkText: 'About' },
  ];

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 100;
    let currentId = 'top';

    sections.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el && el.offsetTop <= scrollPos) {
        currentId = sec.id;
      }
    });

    desktopNavLinks.forEach(link => {
      const href = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('active', href === currentId);
    });
  }, { passive: true });

  // 3. Dynamic Copyright Year
  if (copyrightYear) {
    copyrightYear.textContent = String(new Date().getFullYear());
  }

  // 4. Privacy Policy Modal
  if (openPrivacyBtn && privacyModal && closePrivacyBtn) {
    openPrivacyBtn.addEventListener('click', () => privacyModal.classList.add('open'));
    closePrivacyBtn.addEventListener('click', () => privacyModal.classList.remove('open'));
    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal) privacyModal.classList.remove('open');
    });
  }

  // 5. Terms of Use Modal
  if (openTermsBtn && termsModal && closeTermsBtn) {
    openTermsBtn.addEventListener('click', () => termsModal.classList.add('open'));
    closeTermsBtn.addEventListener('click', () => termsModal.classList.remove('open'));
    termsModal.addEventListener('click', (e) => {
      if (e.target === termsModal) termsModal.classList.remove('open');
    });
  }

  // 6. Contact Modal
  if (openContactBtn && contactModal && closeContactBtn) {
    openContactBtn.addEventListener('click', () => contactModal.classList.add('open'));
    closeContactBtn.addEventListener('click', () => contactModal.classList.remove('open'));
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) contactModal.classList.remove('open');
    });
  }

  // Escape key closes any open modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(modal => modal.classList.remove('open'));
      if (mobileNavDrawer && mobileMenuToggle) {
        mobileNavDrawer.classList.remove('open');
        mobileMenuToggle.classList.remove('open');
      }
    }
  });
}

/**
 * Preload commonly used notes for zero-latency initial play
 */
function preloadCoreAudio() {
  const commonNotes = [
    'c3', 'd3', 'e3', 'f3', 'g3', 'a3', 'b3',
    'c4', 'c44', 'd4', 'd44', 'e4', 'f4', 'f44', 'g4', 'g44', 'a4', 'a44', 'b4',
    'c5', 'c55', 'd5', 'd55', 'e5', 'f5', 'f55', 'g5', 'g55', 'a5', 'a55', 'b5'
  ];
  audioEngine.preloadNotes(commonNotes);
}

/**
 * Main Initialization
 */
function startApp() {
  initPianoKeys();
  initMiniMapEvents();
  initKeyboardEvents();
  initToolbar();
  initWebsiteInfrastructure();
  preloadCoreAudio();

  // Replicate Android exact initial scroll offset:
  // scrollView.post { scrollView.scrollTo((scrollView.getChildAt(0).width * 0.55).toInt(), 0) }
  requestAnimationFrame(() => {
    scrollToProgress(0.55, false);
    syncMiniMapWithScroll();
  });

  // Window resize handler to maintain accurate mini-map position
  window.addEventListener('resize', () => {
    syncMiniMapWithScroll();
  });
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
