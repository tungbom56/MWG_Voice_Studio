// Utility to convert raw Float32 PCM to WAV format for download
// This avoids heavy external libraries for simple wav encoding

export function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

export function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function encodeWAV(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return new Blob([view], { type: 'audio/wav' });
}

// Decode Base64 to AudioBuffer
export async function decodeAudioData(
    base64String: string,
    audioContext: AudioContext
  ): Promise<AudioBuffer> {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
  
    // Gemini 2.5 TTS native sample rate is often 24000Hz
    const sampleRate = 24000; 
    
    // Manual decoding of raw PCM
    // The API returns raw PCM data, usually Int16 little-endian
    // We need to convert it to Float32 for the Web Audio API
    
    // Note: The bytes array contains raw bytes. We need to interpret them as Int16.
    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length;
    
    // Create an AudioBuffer (1 channel, correct length, correct sample rate)
    const audioBuffer = audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
      // Normalize Int16 to Float32 range [-1.0, 1.0]
      channelData[i] = dataInt16[i] / 32768.0;
    }
    
    return audioBuffer;
  }