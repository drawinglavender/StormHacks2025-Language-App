declare module 'elevenlabs-node' {
  export class VoiceSettings {
    constructor(stability: number, similarity_boost: number, style: number);
  }

  export class Voice {
    constructor(
      apiKey: string,
      voiceId: string,
      settings: VoiceSettings
    );
    generateAudio(text: string): Promise<Buffer>;
  }
}