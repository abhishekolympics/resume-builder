// src/vad.js
export const loadVAD = () => {
    return new Promise((resolve, reject) => {
      // Dynamically load ONNX Runtime script
      const onnxScript = document.createElement('script');
      onnxScript.src = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.js';
      onnxScript.onload = () => {
        // Load VAD library after ONNX Runtime
        const vadScript = document.createElement('script');
        vadScript.src = 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/dist/bundle.min.js';
        vadScript.onload = () => resolve(window.vad);
        vadScript.onerror = reject;
        document.body.appendChild(vadScript);
      };
      onnxScript.onerror = reject;
      document.body.appendChild(onnxScript);
    });
  };
  