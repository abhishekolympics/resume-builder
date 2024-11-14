import { loadVAD } from "./vad"; // Assuming VAD is available
import * as lame from "@breezystack/lamejs";
import processAudio from "../AI/processAudio";

async function convertToMP3(audioData, sampleRate) {
  // If audioData is empty, return an empty MP3 blob
  if (audioData.length === 0) {
    console.error("Audio data is empty, skipping MP3 conversion.");
    return new Blob([], { type: "audio/mp3" });
  }

  // Log sample rate for debugging purposes
  console.log(`Sample rate: ${sampleRate}`);

  const mp3Encoder = new lame.Mp3Encoder(1, sampleRate, 128); // Mono channel, sample rate, bitrate
  const samples = new Int16Array(audioData.length);

  // Convert Float32Array to Int16Array for MP3 encoding
  for (let i = 0; i < audioData.length; i++) {
    samples[i] = Math.max(-32768, Math.min(32767, audioData[i] * 32767)); // scaling to 16-bit PCM
  }

  const mp3Data = [];
  const maxSamples = 1152; // max samples per frame
  for (let i = 0; i < samples.length; i += maxSamples) {
    const chunk = samples.subarray(i, i + maxSamples);
    const encoded = mp3Encoder.encodeBuffer(chunk);
    mp3Data.push(encoded);
  }

  const end = mp3Encoder.flush();
  mp3Data.push(end);

  const data = new Blob(mp3Data, { type: "audio/mp3" });

  const convertedText = await processAudio(data, "extract the original text");
  console.log("converted text is ", convertedText);
  return new Blob(mp3Data, { type: "audio/mp3" });
}

const startRecording = async (
  text,
  setIsBotSpeaking,
  startRecording,
  audioChunksRef,
  mediaRecorderRef,
  setRecordingTime,
  recordingTimerRef,
  maxRecordingTimes,
  currentQuestionRef,
  maxRecordingTimeoutRef,
  stopRecording,
  cleanup,
  questions,
  processingResultsRef,
  setProcessingResults,
  setCurrentQuestion,
  setIsActive,
  speakQuestion,
  handleCompleteConversation,
  currentQuestion,
  currentMaxTimeRef,
  recordingStartedRef,
  recordingStoppedRef
) => {
  try {
    // Initialize VAD
    const vad = await loadVAD();

    // Set up VAD callbacks
    const myvad = await vad.MicVAD.new({
      onSpeechStart: () => {
        setIsBotSpeaking(true);
      },
      onSpeechEnd: async (audio) => {
        setIsBotSpeaking(false);

        // Convert the captured audio to MP3 after speech ends
        const mp3Blob = await convertToMP3(audio, 16000); // 16000 is a sample rate example

        // Call stopRecording with MP3 blob
        stopRecording(
          myvad,
          mp3Blob,
          text,
          setIsBotSpeaking,
          startRecording,
          audioChunksRef,
          mediaRecorderRef,
          setRecordingTime,
          recordingTimerRef,
          maxRecordingTimes,
          currentQuestionRef,
          maxRecordingTimeoutRef,
          stopRecording,
          cleanup,
          questions,
          processingResultsRef,
          setProcessingResults,
          setCurrentQuestion,
          setIsActive,
          speakQuestion,
          handleCompleteConversation,
          currentQuestion,
          currentMaxTimeRef,
          recordingStartedRef,
          recordingStoppedRef
        );
      },
    });

    if (myvad.audioNodeVAD && typeof myvad.audioNodeVAD.start === "function") {
      myvad.audioNodeVAD.start();
      console.log("VAD started");
    } else {
      console.error("Start method is not available on audioNodeVAD.");
    }
  } catch (error) {
    console.error("Error starting recording:", error);
  }
};

export default startRecording;
