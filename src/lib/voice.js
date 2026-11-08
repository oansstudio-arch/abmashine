export const CLIPS = [
  { key: 'welcome', file: 'welcome.mp3', label: 'Welcome', text: (n) => `Welcome ${n || 'athlete'}! Your challenge starts now. Let's go!` },
  { key: 'morning', file: 'morning.mp3', label: 'Morning greeting', text: (n) => `Good morning ${n || 'athlete'}! Time to wake up those abs.` },
  { key: 'workout_start', file: 'workout_start.mp3', label: 'Workout start', text: () => `Let's go! You've got this!` },
  { key: 'exercise_complete', file: 'exercise_complete.mp3', label: 'Exercise complete', text: () => `Nice! Another one done!` },
  { key: 'rest_start', file: 'rest_start.mp3', label: 'Rest start', text: () => `Great work. Rest now, breathe deep.` },
  { key: 'workout_complete', file: 'workout_complete.mp3', label: 'Session complete', text: () => `Session complete! Consistency beats perfection.` },
  { key: 'motivation', file: 'motivation.mp3', label: 'Motivation', text: () => `Every day counts. Keep going!` },
  { key: 'reminder', file: 'reminder.mp3', label: 'Session reminder', text: (n) => `Hey ${n || 'athlete'}, it's training time!` },
  { key: 'goal_reached', file: 'goal_reached.mp3', label: 'Goal reached', text: () => `Goal reached! You are unstoppable!` },
  { key: 'challenge_complete', file: 'challenge_complete.mp3', label: 'Challenge complete', text: (n) => `Challenge complete, ${n || 'athlete'}! You did the whole thing!` },
];

let cfg = { voiceEnabled: true, volume: 0.8, sfxEnabled: true };
let currentAudio = null;

export const configureVoice = (settings) => {
  cfg = { ...cfg, ...(settings || {}) };
};

export const isVoiceReady = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

export const speakText = (text, force = false) => {
  if ((!cfg.voiceEnabled && !force) || !text || !isVoiceReady()) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.volume = Math.max(0, Math.min(1, cfg.volume));
    utter.rate = 1.03;
    utter.pitch = 1.05;
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => String(v.lang || '').toLowerCase().startsWith('en'));
    if (voice) utter.voice = voice;
    window.speechSynthesis.speak(utter);
  } catch (e) {
    /* speech unavailable */
  }
};

export const playClip = (key, text, force = false) => {
  const clip = CLIPS.find((c) => c.key === key);
  const line = text || (clip ? clip.text('') : '');
  if ((!cfg.voiceEnabled && !force) || !clip) return;
  try {
    const audio = new Audio(`/audio/${clip.file}`);
    audio.volume = Math.max(0, Math.min(1, cfg.volume));
    const played = audio.play();
    if (played && typeof played.then === 'function') {
      played.then(() => { currentAudio = audio; }).catch(() => speakText(line, force));
    }
  } catch (e) {
    speakText(line, force);
  }
};

export const stopVoice = () => {
  try {
    if (isVoiceReady()) window.speechSynthesis.cancel();
  } catch (e) { /* noop */ }
  if (currentAudio) {
    try { currentAudio.pause(); } catch (e) { /* noop */ }
    currentAudio = null;
  }
};

let audioCtx = null;
export const beep = (freq = 880, duration = 0.12, gain = 0.25) => {
  if (!cfg.sfxEnabled) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    const osc = audioCtx.createOscillator();
    const amp = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    amp.gain.value = Math.max(0, Math.min(1, gain * cfg.volume));
    osc.connect(amp);
    amp.connect(audioCtx.destination);
    osc.start();
    amp.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration + 0.02);
  } catch (e) {
    /* audio unavailable */
  }
};

/** true when a real MP3 exists in /audio */
export const probeClip = (file, timeout = 1400) =>
  new Promise((resolve) => {
    try {
      const audio = new Audio(`/audio/${file}`);
      audio.preload = 'metadata';
      let settled = false;
      const finish = (has) => {
        if (settled) return;
        settled = true;
        audio.removeAttribute('src');
        resolve(has);
      };
      audio.addEventListener('loadedmetadata', () => finish(true), { once: true });
      audio.addEventListener('canplay', () => finish(true), { once: true });
      audio.addEventListener('error', () => finish(false), { once: true });
      setTimeout(() => finish(false), timeout);
    } catch (e) {
      resolve(false);
    }
  });