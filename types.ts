export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  geminiVoiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  gender: 'Male' | 'Female';
}

export interface StyleProfile {
  id: string;
  name: string;
  instruction: string;
}

export interface ProcessingState {
  isGenerating: boolean;
  progress: number; // 0 to 100
  error: string | null;
}

export interface GeneratedAudio {
  blob: Blob;
  url: string;
  duration: number;
}