const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

const speakQuestion = async (
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
  setIsRecording,
  questions,
  processingResultsRef,
  setProcessingResults,
  setCurrentQuestion,
  setIsActive,
  speakQuestion,
  handleCompleteConversation,
  currentQuestion
) => {
  try {
    audioChunksRef.current = [];
    setIsBotSpeaking(true);
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: "alloy",
      }),
    });

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      setIsBotSpeaking(false);
      startRecording(
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
        setIsRecording,
        questions,
        processingResultsRef,
        setProcessingResults,
        setCurrentQuestion,
        setIsActive,
        speakQuestion,
        handleCompleteConversation,
        currentQuestion
      );
    };

    await audio.play();
  } catch (error) {
    console.error("Error in text-to-speech:", error);
    setIsBotSpeaking(false);
  }
};

export default speakQuestion;
