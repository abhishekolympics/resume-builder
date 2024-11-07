const cleanup = async (maxRecordingTimeoutRef,recordingTimerRef) => {
    if (maxRecordingTimeoutRef.current) {
      clearTimeout(maxRecordingTimeoutRef.current);
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  export default cleanup;