const REASONS = [
  { freq: 88.1, audio: 'audios/01.mp3', text: 'Porque sua voz no fone às vezes é a última coisa que eu ouço antes de dormir.' },
  { freq: 89.3, audio: 'audios/02.mp3', text: 'Porque você aprendeu meu fuso horário de cor, sem eu nunca pedir.' },
  { freq: 91.1, audio: 'audios/03.mp3', text: 'Porque não importa a distância, você é a primeira notificação que eu quero ver de manhã.' },
  { freq: 92.7, audio: 'audios/04.mp3', text: 'Porque ouvir você é uma das partes mais bonitas do meu dia.' },
  { freq: 94.5, audio: 'audios/05.mp3', text: 'Porque sua risada transforma até os dias mais comuns.' },
  { freq: 96.2, audio: 'audios/06.mp3', text: 'Porque quando você tá ao vivo, eu fico ali só de bobeira, só pra ouvir sua voz.' },
  { freq: 97.8, audio: 'audios/07.mp3', text: 'Porque você nunca desliga a chamada sem dizer boa noite primeiro.' },
  { freq: 99.4, audio: 'audios/08.mp3', text: 'Porque cada conversa com você faz meu coração se sentir em casa.' },
  { freq: 100.9, audio: 'audios/09.mp3', text: 'Porque receber uma mensagem sua muda completamente o começo do meu dia.' },
  { freq: 101.7, audio: 'audios/10.mp3', text: 'Porque você me faz rir só de mandar um áudio bobo no meio do dia.' },
  { freq: 102.5, audio: 'audios/11.mp3', text: 'Porque a saudade que eu sinto de você é do tamanho de tudo que a gente ainda vai viver junto.' },
  { freq: 103.3, audio: 'audios/12.mp3', text: 'Porque você me escuta de verdade, mesmo quando o assunto é chato.' },
  { freq: 104.1, audio: 'audios/13.mp3', text: 'Porque cada dia que passa é um dia a menos até a gente se ver de verdade.' },
  { freq: 104.9, audio: 'audios/14.mp3', text: 'Porque você transforma pequenos momentos em lembranças que eu quero guardar.' },
  { freq: 105.5, audio: 'audios/15.mp3', text: 'Porque mesmo sem nunca ter te abraçado, eu já sei exatamente o que é sentir sua falta.' },
  { freq: 106.1, audio: 'audios/16.mp3', text: 'Porque você é a pessoa que eu mais quero contar as coisas boas do dia.' },
  { freq: 106.7, audio: 'audios/17.mp3', text: 'Porque você me mostra que estar longe não significa estar ausente.' },
  { freq: 107.1, audio: 'audios/18.mp3', text: 'Porque toda chamada com você parece mais curta do que realmente foi.' },
  { freq: 107.5, audio: 'audios/19.mp3', text: 'Porque você continua sendo a primeira pessoa em quem eu penso, mesmo longe.' },
  { freq: 107.9, audio: 'audios/20.mp3', text: 'Porque um dia a gente vai rir dessa distância toda, de mãos dadas de verdade.' },

];

const FREQ_MIN = 88.0;
const FREQ_MAX = 108.0;
const DIAL_X_MIN = 16;
const DIAL_X_MAX = 304;
const TUNE_DURATION_MS = 900;
const BACKGROUND_MUSIC_VOLUME = 0.01;
const REASON_AUDIO_VOLUME = 1.0;
const ICON_PLAY = '▶';
const ICON_PAUSE = '❚❚';
const LAST_REASON_INDEX = REASONS.length - 1;

const dom = {
  ticks: document.getElementById('ticks'),
  needle: document.getElementById('needle'),
  radio: document.querySelector('.radio'),
  freqReadout: document.getElementById('freqReadout'),
  stationLabel: document.getElementById('stationLabel'),
  waveform: document.getElementById('waveform'),
  tuneBtn: document.getElementById('tuneBtn'),
  messageCard: document.getElementById('messageCard'),
  messageText: document.getElementById('messageText'),
  onair: document.querySelector('.onair'),
  onairText: document.getElementById('onairText'),
  progressText: document.getElementById('progressText'),
  player: document.getElementById('player'),
  backgroundMusic: document.getElementById('backgroundMusic'),
  playBtn: document.getElementById('playBtn'),
  trackBar: document.getElementById('trackBar'),
  trackFill: document.getElementById('trackFill'),
  timeLabel: document.getElementById('timeLabel'),
  audioNote: document.getElementById('audioNote'),
  giftReveal: document.getElementById('giftReveal'),
  giftBox: document.getElementById('giftBox'),
  surpriseCard: document.getElementById('surpriseCard'),
  gameReward: document.getElementById('gameReward'),
  confettiLayer: document.getElementById('confettiLayer'),
  introSession: document.getElementById('introSession'),
  introBtn: document.getElementById('startIntroBtn'),
  introAudio: document.getElementById('introAudio'),
  experience: document.getElementById('experience'),
};

const INTRO_DELAY_MS = 3000;
const INTRO_AUDIO_SRC = 'música/intro.mp3';

const introFlow = {
  delayMs: INTRO_DELAY_MS,
  started: false,
  revealTimer: null,

  revealExperience() {
    dom.introSession.classList.add('hidden');
    dom.experience.classList.add('ready');
    startBackgroundMusic();
  },

  scheduleReveal() {
    if (this.revealTimer) return;
    this.revealTimer = setTimeout(() => {
      this.revealExperience();
      this.revealTimer = null;
    }, this.delayMs);
  },

  start() {
    if (this.started) return;

    this.started = true;
    dom.introBtn.disabled = true;
    dom.introBtn.textContent = 'tocando...';

    const playIntroAudio = () => {
      dom.introAudio.src = INTRO_AUDIO_SRC;
      dom.introAudio.load();
      const playPromise = dom.introAudio.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => this.scheduleReveal());
      }
    };

    dom.introAudio.addEventListener('ended', () => {
      this.scheduleReveal();
    }, { once: true });

    dom.introAudio.addEventListener('error', () => {
      this.scheduleReveal();
    }, { once: true });

    playIntroAudio();
  },
};

const playerFlow = {
  togglePlayback() {
    if (!dom.player.src) return;

    if (dom.player.paused) {
      if (dom.player.ended) dom.player.currentTime = 0;
      dom.player.play().catch(() => {
        showAudioError('não foi possível reproduzir este áudio — tente novamente.');
      });
    } else {
      dom.player.pause();
    }
  },

  handleTimeUpdate() {
    if (!dom.player.duration) return;
    setAudioProgress(dom.player.currentTime / dom.player.duration);
    dom.timeLabel.textContent = formatTime(dom.player.currentTime);
  },

  handleEnded() {
    setWaveformLive(false);
    setPlayIcon(false);
    setAudioProgress(0);
  },

  handleError() {
    if (!dom.player.getAttribute('src')) return;
    showAudioError('áudio indisponível nesta frequência — mas o motivo continua valendo.');
  },
};

const radioFlow = {
  tuneToNextReason() {
    const reason = pickNextReason();
    caughtCount = Math.min(caughtCount + 1, REASONS.length);

    dom.tuneBtn.disabled = true;
    dom.tuneBtn.textContent = 'Sintonizando…';
    dom.tuneBtn.classList.add('is-tuning');
    dom.onair.classList.add('is-tuning');
    dom.radio.classList.add('is-tuning');
    dom.messageCard.classList.remove('show');
    resetPlayerUI();
    animateNeedleTo(reason.freq);
    playStaticNoise(TUNE_DURATION_MS);

    setTimeout(() => this.revealReason(reason), TUNE_DURATION_MS + 80);
  },

  revealReason(reason) {
    const isLastReason = caughtCount >= REASONS.length;

    dom.freqReadout.firstChild.textContent = reason.freq.toFixed(1);
    dom.stationLabel.textContent = 'Saudade FM · transmissão contínua';
    dom.onair.classList.remove('is-tuning');
    dom.radio.classList.remove('is-tuning');
    dom.onair.classList.add('is-live');
    dom.onairText.textContent = isLastReason ? 'sinal final' : 'no ar';
    dom.messageText.textContent = reason.text;
    dom.messageCard.classList.add('show');
    dom.progressText.textContent = isLastReason
      ? `todas as ${REASONS.length} frequências captadas — o resto a gente sintoniza de perto`
      : `${caughtCount} de ${REASONS.length} sinais captados`;
    dom.tuneBtn.textContent = isLastReason ? 'Sintonizar de novo' : 'Sintonizar';
    dom.tuneBtn.disabled = false;
    dom.tuneBtn.classList.remove('is-tuning');

    if (isLastReason) {
      dom.giftReveal.hidden = false;
      requestAnimationFrame(() => {
        dom.giftReveal.classList.add('show');
      });
    }

    dom.player.src = reason.audio;
    dom.player.volume = REASON_AUDIO_VOLUME;
    dom.player.load();
    dom.player.play().catch(() => {
      showAudioError('não foi possível reproduzir este áudio — tente apertar play novamente.');
    });
  },
};

const rewardFlow = {
  createConfettiBurst() {
    const colors = ['#f6d88a', '#f1a6b6', '#fff1df', '#d4f0ff', '#9ae6b4', '#f9a8d4'];

    for (let i = 0; i < 34; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.setProperty('--x', `${(Math.random() - 0.5) * 220}px`);
      piece.style.setProperty('--y', `${Math.random() * 180 + 100}px`);
      piece.style.setProperty('--rotation', `${Math.random() * 300 - 150}deg`);
      piece.style.animationDelay = `${Math.random() * 0.15}s`;
      dom.confettiLayer.appendChild(piece);

      setTimeout(() => piece.remove(), 2400);
    }
  },

  openGift() {
    dom.giftBox.disabled = true;
    dom.giftBox.classList.add('opened');
    dom.surpriseCard.hidden = false;
    requestAnimationFrame(() => dom.surpriseCard.classList.add('show'));

    this.createConfettiBurst();

    dom.gameReward.hidden = false;
    requestAnimationFrame(() => {
      dom.gameReward.classList.add('show');
      dom.gameReward.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'center',
      });
    });
  },
};

let unplayedIndexes = [];
let caughtCount = 0;
let voiceAudioContext;
let voiceAnalyser;
let voiceSource;
let voiceFrame;
let voiceFadeTimer;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function freqToDialX(freq) {
  const ratio = (freq - FREQ_MIN) / (FREQ_MAX - FREQ_MIN);
  return DIAL_X_MIN + ratio * (DIAL_X_MAX - DIAL_X_MIN);
}

function formatTime(seconds) {
  if (!isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function buildDialTicks() {
  const svgNs = 'http://www.w3.org/2000/svg';

  for (let freq = FREQ_MIN; freq <= FREQ_MAX; freq += 2) {
    const isMajor = freq % 4 === 0;
    const x = freqToDialX(freq);

    const tick = document.createElementNS(svgNs, 'line');
    tick.setAttribute('x1', x);
    tick.setAttribute('x2', x);
    tick.setAttribute('y1', 34);
    tick.setAttribute('y2', isMajor ? 22 : 27);
    tick.setAttribute('class', isMajor ? 'tick tick--major' : 'tick');
    dom.ticks.appendChild(tick);

    if (!isMajor) continue;

    const label = document.createElementNS(svgNs, 'text');
    label.setAttribute('x', x);
    label.setAttribute('y', 16);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('class', 'tick-label');
    label.textContent = freq.toFixed(0);
    dom.ticks.appendChild(label);
  }
}

function reshuffleUnplayed() {
  unplayedIndexes = REASONS.slice(0, LAST_REASON_INDEX).map((_, index) => index);
  for (let i = unplayedIndexes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unplayedIndexes[i], unplayedIndexes[j]] = [unplayedIndexes[j], unplayedIndexes[i]];
  }
}

function pickNextReason() {
  if (caughtCount === LAST_REASON_INDEX) return REASONS[LAST_REASON_INDEX];
  if (unplayedIndexes.length === 0) {
    reshuffleUnplayed();
    caughtCount = 0;
  }
  return REASONS[unplayedIndexes.pop()];
}

function setPlayIcon(isPlaying) {
  dom.playBtn.textContent = isPlaying ? ICON_PAUSE : ICON_PLAY;
}

function setWaveformLive(isLive) {
  dom.waveform.classList.toggle('live', isLive);
  clearTimeout(voiceFadeTimer);
  if (isLive) {
    dom.messageCard.classList.remove('audio-fading');
    dom.messageCard.classList.add('audio-active');
    startVoicePulse();
  } else {
    stopVoicePulse();
    dom.messageCard.classList.add('audio-fading');
    voiceFadeTimer = setTimeout(() => {
      dom.messageCard.classList.remove('audio-active', 'audio-fading');
    }, 500);
  }
}

function startVoicePulse() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    if (!voiceAudioContext) {
      voiceAudioContext = new AudioContextClass();
      voiceAnalyser = voiceAudioContext.createAnalyser();
      voiceAnalyser.fftSize = 256;
      voiceSource = voiceAudioContext.createMediaElementSource(dom.player);
      voiceSource.connect(voiceAnalyser);
      voiceAnalyser.connect(voiceAudioContext.destination);
    }
  } catch {
    voiceAudioContext = null;
    voiceAnalyser = null;
    voiceSource = null;
    return;
  }

  voiceAudioContext.resume().catch(() => {});
  cancelAnimationFrame(voiceFrame);
  const samples = new Uint8Array(voiceAnalyser.fftSize);

  const measureVoice = () => {
    voiceAnalyser.getByteTimeDomainData(samples);
    let energy = 0;
    for (const sample of samples) {
      const amplitude = (sample - 128) / 128;
      energy += amplitude * amplitude;
    }
    const voiceLevel = Math.min(1, Math.sqrt(energy / samples.length) * 3.4);
    const spread = (2 + voiceLevel * 9).toFixed(1);
    const glow = (12 + voiceLevel * 26).toFixed(1);
    dom.messageCard.style.boxShadow = `0 0 0 ${spread}px rgba(230, 184, 120, .22), 0 0 ${glow}px rgba(241, 166, 182, .4), 0 24px 48px -28px rgba(0, 0, 0, .65)`;
    voiceFrame = requestAnimationFrame(measureVoice);
  };

  measureVoice();
}

function stopVoicePulse() {
  cancelAnimationFrame(voiceFrame);
  dom.messageCard.style.boxShadow = '0 0 0 0 rgba(230, 184, 120, 0), 0 0 0 rgba(241, 166, 182, 0), 0 24px 48px -28px rgba(0, 0, 0, .65)';
}

function startBackgroundMusic() {
  dom.backgroundMusic.volume = BACKGROUND_MUSIC_VOLUME;
  dom.backgroundMusic.play().catch(() => {});
}

function revealExperience() {
  introFlow.revealExperience();
}

function startIntroSequence() {
  introFlow.start();
}

function setAudioProgress(ratio) {
  const percent = Math.round(ratio * 100);
  dom.trackFill.style.width = `${percent}%`;
  dom.trackBar.setAttribute('aria-valuenow', percent.toString());
}

function resetPlayerUI() {
  dom.player.pause();
  dom.audioNote.hidden = true;
  dom.timeLabel.textContent = '0:00';
  setAudioProgress(0);
  setWaveformLive(false);
  setPlayIcon(false);
}

function showAudioError(message) {
  if (!dom.audioNote.hidden) return;
  dom.audioNote.textContent = message;
  dom.audioNote.hidden = false;
  setWaveformLive(false);
  setPlayIcon(false);
}

function animateNeedleTo(freq) {
  dom.needle.style.transform = `translateX(${freqToDialX(freq)}px)`;
}

function playStaticNoise(durationMs) {
  const STATIC_CHARS = '░▒▓';
  const STEP_MS = 70;
  const randomDigit = () => STATIC_CHARS[Math.floor(Math.random() * STATIC_CHARS.length)];
  let elapsed = 0;

  dom.stationLabel.textContent = 'captando sinal...';

  const timer = setInterval(() => {
    dom.freqReadout.firstChild.textContent = `${randomDigit()}${randomDigit()}.${randomDigit()}`;
    elapsed += STEP_MS;
    if (elapsed >= durationMs) clearInterval(timer);
  }, STEP_MS);
}

function revealReason(reason) {
  radioFlow.revealReason(reason);
}

function createConfettiBurst() {
  rewardFlow.createConfettiBurst();
}

function openGift() {
  rewardFlow.openGift();
}

function tuneToNextReason() {
  radioFlow.tuneToNextReason();
}

function togglePlayback() {
  playerFlow.togglePlayback();
}

function handleAudioTimeUpdate() {
  playerFlow.handleTimeUpdate();
}

function handleAudioEnded() {
  playerFlow.handleEnded();
}

function handleAudioError() {
  playerFlow.handleError();
}

dom.player.addEventListener('play', () => {
  setWaveformLive(true);
  setPlayIcon(true);
});
dom.player.addEventListener('pause', () => {
  setWaveformLive(false);
  setPlayIcon(false);
});
dom.player.addEventListener('ended', () => playerFlow.handleEnded());
dom.player.addEventListener('timeupdate', () => playerFlow.handleTimeUpdate());
dom.player.addEventListener('error', () => playerFlow.handleError());

window.addEventListener('pointerdown', startBackgroundMusic, { once: true });
window.addEventListener('keydown', startBackgroundMusic, { once: true });
dom.playBtn.addEventListener('click', () => playerFlow.togglePlayback());
dom.tuneBtn.addEventListener('click', () => radioFlow.tuneToNextReason());
dom.giftBox.addEventListener('click', () => rewardFlow.openGift());
dom.introBtn.addEventListener('click', () => introFlow.start());

buildDialTicks();
reshuffleUnplayed();
