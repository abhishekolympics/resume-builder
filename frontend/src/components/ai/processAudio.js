const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

const processAudio = async (audioBlob,question) => {
    try {
      // Convert speech to text using Whisper
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("model", "whisper-1");
      const transcriptionResponse = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
          body: formData,
        }
      );

      const transcriptionData = await transcriptionResponse.json();
      const text = transcriptionData.text;
      const chatGPTResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "Extract and summarize key information from the user's response.",
              },
              {
                role: "user",
                content: `Question: ${
                    question
                }\nAnswer: ${text}\nPlease extract and summarize the key information.`,
              },
            ],
          }),
        }
      );

      const chatGPTData = await chatGPTResponse.json();
      return {
        text,
        processed: chatGPTData.choices[0].message.content,
      };
    } catch (error) {
      console.error("Error processing audio:", error);
      return { text: "", processed: "Error processing response" };
    }
  };

  export default processAudio;