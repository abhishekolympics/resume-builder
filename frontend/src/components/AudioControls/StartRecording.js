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
  setIsRecording,
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
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunksRef.current = [];

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorder.start(100);
    setRecordingTime(0);

    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    const currentMaxTime = maxRecordingTimes[currentQuestionRef.current];
    currentMaxTimeRef.current = currentMaxTime;
    recordingStartedRef.current= false;
    recordingStoppedRef.current = true;
    maxRecordingTimeoutRef.current = setTimeout(() => {
      stopRecording(
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
        currentQuestion,
        currentMaxTimeRef,
        recordingStartedRef,
        recordingStoppedRef
      );
    }, currentMaxTime);
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(2048, 1, 1);
    const analyser = audioContext.createAnalyser();

    source.connect(analyser);
    analyser.connect(processor);
    processor.connect(audioContext.destination);
  } catch (error) {
    console.error("Error starting recording:", error);
  }
};

export default startRecording;
