"use client";

import { useState, useRef } from "react";
import { speechToText } from "../../utils/elevenlabs";

export default function TranslatePage() {
  const [transcribedText, setTranscribedText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Recording failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      // You could add state to show this error to user if needed
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });

        console.log("Audio blob created:", { size: audioBlob.size, type: audioBlob.type });

        setIsProcessing(true);
        try {
          const text = await speechToText(audioBlob);
          console.log("Transcription result:", text);
          setTranscribedText(text);
        } catch (error) {
          console.error("Transcription failed:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
          setTranscribedText("Transcription failed: " + errorMessage);
        } finally {
          setIsProcessing(false);
        }

        // Clean up
        mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Voice Transcriber</h1>

      <div className="mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`w-full py-3 px-4 rounded text-white font-medium ${
            isRecording
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          } disabled:opacity-50`}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </div>

      {isProcessing && <p className="text-gray-600 mb-4">Processing audio...</p>}

      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Transcription:</label>
        <textarea
          value={transcribedText}
          readOnly
          className="w-full h-32 p-3 border rounded resize-none"
          placeholder="Your speech will appear here..."
        />
      </div>
    </div>
  );
}
