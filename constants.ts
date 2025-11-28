import { VoiceProfile, StyleProfile } from './types';

// Mapping user requirements to Gemini 2.5 Voices
export const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'vn-male-hanoi',
    name: 'Nam Trầm Ấm (Hà Nội)',
    description: 'Giọng nam trầm ấm, kể chuyện, chuẩn Hà Nội.',
    geminiVoiceName: 'Fenrir', // Deep, steady
    gender: 'Male'
  },
  {
    id: 'vn-male-news',
    name: 'Nam Chính Luận (Phát Thanh)',
    description: 'Giọng nam sâu, nghiêm túc, phát thanh viên.',
    geminiVoiceName: 'Charon', // Deep, authoritative
    gender: 'Male'
  },
  {
    id: 'vn-male-strong',
    name: 'Nam Mạnh Mẽ',
    description: 'Giọng nam mạnh mẽ, dứt khoát, âm vực rộng.',
    geminiVoiceName: 'Puck', // Energetic
    gender: 'Male'
  },
  {
    id: 'vn-male-saigon',
    name: 'Nam Nhẹ Nhàng (Sài Gòn)',
    description: 'Giọng nam thanh niên nhẹ nhàng, tự nhiên, chuẩn Sài Gòn.',
    geminiVoiceName: 'Zephyr', // Calm, higher pitch
    gender: 'Male'
  },
  {
    id: 'vn-female-hanoi',
    name: 'Nữ Truyền Cảm (Hà Nội)',
    description: 'Giọng nữ nhẹ nhàng, truyền cảm, tự nhiên, chuẩn Hà Nội.',
    geminiVoiceName: 'Kore', // Female, natural
    gender: 'Female'
  },
  {
    id: 'vn-female-saigon',
    name: 'Nữ Tự Nhiên (Sài Gòn)',
    description: 'Giọng nữ nhẹ nhàng, truyền cảm, tự nhiên, chuẩn Sài Gòn.',
    geminiVoiceName: 'Kore', // Re-using Kore
    gender: 'Female'
  }
];

export const READING_STYLES: StyleProfile[] = [
  {
    id: 'story',
    name: 'Kể Chuyện / Truyền Cảm',
    instruction: 'Read the following text with a warm, emotional, and engaging storytelling tone'
  },
  {
    id: 'ads',
    name: 'Quảng Cáo / Sôi Động',
    instruction: 'Read the following text with an energetic, enthusiastic, and persuasive promotional tone'
  },
  {
    id: 'news',
    name: 'Tin Tức / Chính Luận',
    instruction: 'Read the following text with a formal, serious, and professional news-anchor tone'
  }
];

export const SAMPLE_TEXT = "Chào mừng bạn đến với MWG Voice Studio. Đây là giải pháp chuyển đổi văn bản thành giọng nói sử dụng trí tuệ nhân tạo tiên tiến nhất.";