import processAudio from "../AI/processAudio";

const stopRecording = async (
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
) => {
  if (myvad.audioNodeVAD && typeof myvad.audioNodeVAD.pause === "function") {
    myvad.audioNodeVAD.pause();
    console.log("VAD paused");
  } else {
    console.error("Pause method is not available on audioNodeVAD.");
  }
  cleanup(maxRecordingTimeoutRef, recordingTimerRef);

  try {
    cleanup(maxRecordingTimeoutRef, recordingTimerRef);
    if (mp3Blob && mp3Blob.size > 0) {
      // Process the MP3 audio data
      const { text, processed } = await processAudio(
        mp3Blob,
        questions[currentQuestionRef.current]
      );

      // Save the result
      const newResult = {
        question: questions[currentQuestionRef.current],
        answer: text,
        processed,
      };

      processingResultsRef.current.push(newResult);
      setProcessingResults([...processingResultsRef.current]);

      // Check if there are more questions
      if (currentQuestionRef.current < questions.length - 1) {
        // Proceed to the next question
        setCurrentQuestion((prev) => {
          const nextQuestion = prev + 1;
          currentQuestionRef.current = nextQuestion;
          return nextQuestion;
        });

        // Wait a moment before asking the next question
        setTimeout(() => {
          speakQuestion(
            questions[currentQuestionRef.current],
            setIsBotSpeaking,
            startRecording,
            audioChunksRef,
            mediaRecorderRef, // Remove reference in future
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
        }, 500); // Adjust delay as needed
      } else {
        // End conversation if it's the last question
        await handleCompleteConversation(processingResultsRef);
      }
    } else {
      console.error("No valid audio blob received.");
    }
  } catch (error) {
    console.error("Error in stopRecording:", error);
  }
};

export default stopRecording;
