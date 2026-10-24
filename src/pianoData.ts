export interface WhiteKeyData {
  id: string;
  note: string;
  octave: number;
  label: string;
  sound: string;
}

export interface BlackKeyData {
  id: string;
  note: string;
  octave: number;
  label: string;
  sound: string;
  marginStart: number; // in dp/px
}

// 49 White Keys matching MainActivity.kt whiteKeyIds and whiteKeySounds
// Octaves 1 to 7: A, B, C, D, E, F, G
export const WHITE_KEYS: WhiteKeyData[] = [];

// 35 Black Keys matching MainActivity.kt blackKeyIds and blackKeySounds
// Octaves 1 to 7: A#, C#, D#, F#, G#
export const BLACK_KEYS: BlackKeyData[] = [];

const noteNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const blackNoteNames = ['A#', 'C#', 'D#', 'F#', 'G#'];
const blackSoundKeys = ['a', 'c', 'd', 'f', 'g'];

for (let octave = 1; octave <= 7; octave++) {
  // White keys
  for (const note of noteNames) {
    WHITE_KEYS.push({
      id: `key${note}${octave}`,
      note: `${note}${octave}`,
      octave,
      label: `${note}${octave}`,
      sound: `${note.toLowerCase()}${octave}`,
    });
  }

  // Black keys with exact layout margins from activity_main.xml
  const margins = octave === 1 
    ? [52, 100, 22, 101, 25] 
    : [26, 100, 22, 101, 25];

  for (let i = 0; i < 5; i++) {
    const rawNote = blackSoundKeys[i];
    BLACK_KEYS.push({
      id: `key${rawNote.toUpperCase()}${octave}Sharp`,
      note: `${blackNoteNames[i]}${octave}`,
      octave,
      label: `${blackNoteNames[i]}`,
      sound: `${rawNote}${octave}${octave}`, // e.g. a11, c11, d11, f11, g11
      marginStart: margins[i],
    });
  }
}

// Standard keyboard mapping relative to a base octave
export const KEYBOARD_MAP_HOME_ROW: Record<string, { note: string; sound: string; keyId: string }> = {};

export function getKeyboardMapping(octave: number) {
  const nextOctave = Math.min(7, octave + 1);
  return {
    // Octave n
    'KeyA': `keyC${octave}`,
    'KeyW': `keyC${octave}Sharp`,
    'KeyS': `keyD${octave}`,
    'KeyE': `keyD${octave}Sharp`,
    'KeyD': `keyE${octave}`,
    'KeyF': `keyF${octave}`,
    'KeyT': `keyF${octave}Sharp`,
    'KeyG': `keyG${octave}`,
    'KeyY': `keyG${octave}Sharp`,
    'KeyH': `keyA${octave}`,
    'KeyU': `keyA${octave}Sharp`,
    'KeyJ': `keyB${octave}`,
    // Octave n+1
    'KeyK': `keyC${nextOctave}`,
    'KeyO': `keyC${nextOctave}Sharp`,
    'KeyL': `keyD${nextOctave}`,
    'KeyP': `keyD${nextOctave}Sharp`,
    'Semicolon': `keyE${nextOctave}`,
    'Quote': `keyF${nextOctave}`,
    'BracketRight': `keyF${nextOctave}Sharp`,
  };
}
