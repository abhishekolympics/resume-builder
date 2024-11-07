import processAudio from "../ai/processAudio";

const stopRecording = async (
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
  if (mediaRecorderRef.current) {
    cleanup(maxRecordingTimeoutRef, recordingTimerRef);
    setIsRecording(false);

    mediaRecorderRef.current.stop();

    // Check and reset audioChunksRef
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      audioChunksRef.current = []; // Clear chunks after each recording
      console.log("inside stop=", audioChunksRef.current);

      // Log blob type and size for debugging
      console.log("Audio blob type:", audioBlob.type);
      console.log("Audio blob size:", audioBlob.size);

      // Process audio if it has the correct type
      if (audioBlob.size > 0 && audioBlob.type === "audio/webm") {
        const { text, processed } = await processAudio(
          audioBlob,
          questions[currentQuestionRef.current]
        ); // Pass currentQuestion

        console.log(
          "current question before processing=",
          questions[currentQuestionRef.current]
        );

        const newResult = {
          question: questions[currentQuestionRef.current],
          answer: text,
          processed,
        };

        processingResultsRef.current.push(newResult);

        setProcessingResults([...processingResultsRef.current]);

        if (currentQuestionRef.current < questions.length - 1) {
          setCurrentQuestion((prev) => {
            const newQuestion = prev + 1;
            currentQuestionRef.current = newQuestion; // Update the ref here
            return newQuestion;
          });
          setTimeout(() => {
            speakQuestion(
              questions[currentQuestionRef.current],
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
          }, 1000);
        } else {
          setIsActive(false);
          await handleCompleteConversation(processingResultsRef);
        }
      } else {
        console.error("Invalid audio format detected.");
      }
    } else {
      console.error("No audio data recorded.");
    }
  }
};

export default stopRecording;
