import { Voice, VoiceSettings } from 'elevenlabs-node';
import axios from 'axios';

const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY!;
const ELEVEN_LABS_API_URL = 'https://api.elevenlabs.io/v1';

export async function speechToText(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await axios.post(
      `${ELEVEN_LABS_API_URL}/speech-to-text`,
      formData,
      {
        headers: {
          'xi-api-key': ELEVEN_LABS_API_KEY,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.text;
  } catch (error) {
    console.error('ElevenLabs Speech-to-Text Error:', error);
    throw error;
  }
}

export async function startRecording(durationMs: number = 5000): Promise<Blob> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];

    return new Promise((resolve, reject) => {
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        stream.getTracks().forEach(track => track.stop());
        resolve(audioBlob);
      };

      mediaRecorder.onerror = (error) => {
        stream.getTracks().forEach(track => track.stop());
        reject(error);
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), durationMs);
    });
  } catch (error) {
    console.error('Recording Error:', error);
    throw error;
  }
}

// Original text-to-speech function
export async function generateSpeech(text: string, voiceId: string) {
  try {
    const voice = new Voice(
      ELEVEN_LABS_API_KEY,
      voiceId,
      new VoiceSettings(0.5, 0.5, 0.5)
    );

    const audio = await voice.generateAudio(text);
    return audio;
  } catch (error) {
    console.error('ElevenLabs API Error:', error);
    throw error;
  }
}