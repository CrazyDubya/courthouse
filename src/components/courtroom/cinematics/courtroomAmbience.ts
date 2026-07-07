/**
 * Procedural, asset-free courtroom ambience: a very quiet filtered-noise room
 * tone that breathes slowly, plus a one-shot gavel rap for phase changes. All
 * synthesized with WebAudio — nothing to bundle or fetch. Off by default and
 * only ever constructed from a user click (see AmbienceToggle), since browsers
 * refuse to start an AudioContext without a gesture.
 */

export interface AmbienceHandle {
  /** Fades out and tears down every node. Safe to call once. */
  stop: () => void;
  /** Fires a single gavel-rap one-shot through the ambience bus. */
  gavel: () => void;
}

function createNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

export function startCourtroomAmbience(ctx: AudioContext): AmbienceHandle {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.5);
  master.connect(ctx.destination);

  // Room-tone bed: looping filtered noise, very quiet, slowly breathing.
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, 4);
  noise.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 320;
  lowpass.Q.value = 0.3;

  const bedGain = ctx.createGain();
  bedGain.gain.value = 1;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06; // ~16s swell
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.25;
  lfo.connect(lfoGain);
  lfoGain.connect(bedGain.gain);

  noise.connect(lowpass);
  lowpass.connect(bedGain);
  bedGain.connect(master);

  noise.start();
  lfo.start();

  const gavel = () => {
    const now = ctx.currentTime;

    // Crack: short bandpassed noise burst.
    const click = ctx.createBufferSource();
    click.buffer = createNoiseBuffer(ctx, 0.12);
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1400;
    bandpass.Q.value = 0.7;
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.35, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    click.connect(bandpass);
    bandpass.connect(clickGain);
    clickGain.connect(master);
    click.start(now);
    click.stop(now + 0.2);

    // Body: fast downward sine thump.
    const knock = ctx.createOscillator();
    knock.type = 'sine';
    knock.frequency.setValueAtTime(140, now);
    knock.frequency.exponentialRampToValueAtTime(60, now + 0.15);
    const knockGain = ctx.createGain();
    knockGain.gain.setValueAtTime(0.25, now);
    knockGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    knock.connect(knockGain);
    knockGain.connect(master);
    knock.start(now);
    knock.stop(now + 0.22);
  };

  const stop = () => {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0.0001, now + 0.4);

    setTimeout(() => {
      try {
        noise.stop();
      } catch {
        /* already stopped */
      }
      try {
        lfo.stop();
      } catch {
        /* already stopped */
      }
      noise.disconnect();
      lowpass.disconnect();
      bedGain.disconnect();
      lfo.disconnect();
      lfoGain.disconnect();
      master.disconnect();
    }, 450);
  };

  return { stop, gavel };
}
