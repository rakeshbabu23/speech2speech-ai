import React, { useRef, useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Upload,
  Check,
  X,
} from "lucide-react";
const apiUrl = import.meta.env.VITE_API_URL;
console.log(apiUrl);
const App = () => {
  const [recordedUrl, setRecordedUrl] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [backendResponse, setBackendResponse] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const mediaStream = useRef(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];
      setIsRecording(true);
      setUploadStatus("");

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const recordedBlob = new Blob(chunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(recordedBlob);
        setRecordedUrl(url);
        setIsRecording(false);
        await uploadAudio(recordedBlob);
      };

      mediaRecorder.current.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setUploadStatus("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.stop();
    }
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
    }
  };

  const uploadAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    try {
      setUploadStatus("Please wait...");
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload audio");
      }

      const result = await response.json();
      setBackendResponse(result.message);
      setUploadStatus("Success");
    } catch (error) {
      console.error("Error uploading audio:", error);
      setUploadStatus("Upload failed");
    }
  };

  // Handle text-to-speech
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (backendResponse) {
      const u = new SpeechSynthesisUtterance(backendResponse);
      setUtterance(u);
    }

    return () => {
      synth.cancel();
    };
  }, [backendResponse]);

  const handlePlay = () => {
    const synth = window.speechSynthesis;

    if (isPaused) {
      synth.resume();
    } else if (utterance) {
      synth.speak(utterance);
    }

    setIsPaused(false);
  };

  const handlePause = () => {
    const synth = window.speechSynthesis;
    synth.pause();
    setIsPaused(true);
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsPaused(false);
  };

  return (
    <div className="bg-red-600 min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-black shadow-2xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-white">
          Audio Recorder
        </h1>

        {/* Recording Section */}
        <div className="mb-6">
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={startRecording}
              disabled={isRecording}
              className={`p-3 rounded-full ${
                isRecording
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isRecording ? <MicOff /> : <Mic />}
            </button>
            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className={`p-3 rounded-full ${
                !isRecording
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              <Square />
            </button>
          </div>

          {recordedUrl && (
            <div className="flex items-center justify-center">
              <audio controls src={recordedUrl} className="w-full mb-4" />
            </div>
          )}
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div className="flex items-center justify-center mb-4">
            {uploadStatus === "Upload successful" ? (
              <div className="flex items-center text-green-600">
                <Check className="mr-2" />
                {uploadStatus}
              </div>
            ) : uploadStatus === "Upload failed" ? (
              <div className="flex items-center text-red-600">
                <X className="mr-2" />
                {uploadStatus}
              </div>
            ) : (
              <div className="text-white">{uploadStatus}</div>
            )}
          </div>
        )}

        {/* TTS Controls */}
        {backendResponse && (
          <div className="mt-4">
            <div className="bg-white p-3 rounded-lg mb-4 text-center">
              {backendResponse}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handlePlay}
                className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full"
              >
                <Play />
              </button>
              <button
                onClick={handlePause}
                className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-full"
              >
                <Pause />
              </button>
              <button
                onClick={handleStop}
                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full"
              >
                <Square />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
