import React, { useState, useEffect } from "react";
import Groq from "groq-sdk";
import * as pdfjsLib from "pdfjs-dist";


const apiKey = import.meta.env.VITE_GROQ_API_KEY;
// import Tesseract from "tesseract.js"; 
//Uncomment this if you need OCR
import "./App.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = `node_modules/pdfjs-dist/build/pdf.worker.min.mjs`

const groq = new Groq({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true,
});

function App() {
  const [text, setText] = useState("");
  const [voicesOptions, setVoicesOptions] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speech] = useState(new SpeechSynthesisUtterance());

  useEffect(() => {
    // Load voices when available
    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      setVoicesOptions(voices);
      setSelectedVoice(voices[0]);
    };

    speech.lang = "en";
    speech.volume = volume;
    speech.rate = rate;
    speech.pitch = pitch;
  }, [speech, volume, rate, pitch]);

  useEffect(() => {
    speech.voice = selectedVoice;
  }, [selectedVoice]);

  // Function to process raw PDF text with Groq API
  async function processTextWithGroq(rawText) {
    try {
      const stream = await getGroqChatStream(rawText);
      let processedText = "";
      console.log("Processing text with Groq...");

      for await (const chunk of stream) {
        processedText += chunk.choices[0]?.delta?.content || "";
      }

      return processedText;
    } catch (error) {
      console.error("Error processing text with Groq:", error);
      return rawText; // Fallback to raw text
    }
  }

  // Function to get the Groq chat stream
  async function getGroqChatStream(rawText) {
    return groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a highly detailed and attentive text-to-description assistant. Your job is to transform raw text, such as content extracted from PDFs, into an easily understandable, vivid narration for a blind person. When you receive a text, explain it clearly without any introductory or transition phrases like \"Here is...\" or \"Let me explain...\" You should directly start narrating and explaining everything in the text, with a focus on maintaining the integrity of all content. Ensure that no details are omitted, and describe any visuals, graphs, or complex structures in a way that makes them comprehensible. The goal is to convey the content with vividness, clarity, and accuracy, providing an understanding of how the content appears, feels, and unfolds.",
        },
        {
          role: "user",
          content: `Here is the raw text from the PDF. Please read it and start narrating the content, explaining all the details, structures, and visual elements as they would be understood by a blind person. Provide an explanation that leaves no content behind, illustrating everything described in the text and focusing entirely on conveying the information vividly and accurately. 
          RAW TEXT :\n\n${rawText}`,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
      stream: true,
    });
  }

  async function extractTextFromPdf(pdfData) {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    let fullText = "";
  
    // Extract text from each page directly
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(' ') + "\n";
    }
  
    return fullText;
  }

  // // Extract text from PDF using OCR
  // async function extractTextWithOCRFromPdf(pdfData) {
  //   const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
  //   let fullText = "";

  //   for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
  //     const page = await pdf.getPage(pageNum);
  //     const scale = 1.5;
  //     const viewport = page.getViewport({ scale });
  //     const canvas = document.createElement("canvas");
  //     const context = canvas.getContext("2d");
  //     canvas.height = viewport.height;
  //     canvas.width = viewport.width;

  //     const renderContext = {
  //       canvasContext: context,
  //       viewport: viewport,
  //     };
  //     await page.render(renderContext).promise;

  //     const imageData = canvas.toDataURL();
  //     const {
  //       data: { text },
  //     } = await Tesseract.recognize(imageData, "eng");
  //     fullText += text + "\n";
  //   }

  //   return fullText;
  // }

  // File upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.name.split(".").pop().toLowerCase();

    try {
      if (fileType === "txt") {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const rawText = e.target.result;
          const structuredText = await processTextWithGroq(rawText);
          setText(structuredText);
        };
        reader.readAsText(file);
      } else if (fileType === "pdf") {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const pdfData = new Uint8Array(e.target.result);
          const fullText = await extractTextFromPdf(pdfData);
          //Uncomment to run in OCR mode
          //const fullText = await extractTextWithOCRFromPdf(pdfData);
          const structuredText = await processTextWithGroq(fullText);
          setText(structuredText);
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      console.error("Error reading or processing file:", error);
      alert("Error processing file. Please try again.");
    }
  };

  // Playback controls
  const handlePlay = () => {
    speech.text = text;
    window.speechSynthesis.speak(speech);
    setIsPlaying(true);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
  };

  const handleResume = () => {
    window.speechSynthesis.resume();
    setIsPlaying(true);
  };

  const handleReset = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="container">
      <div className="wrapper">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="input_field">
            <label>Upload Text/PDF File or Write Text</label>
            <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your text here or upload a file"
            />
          </div>

          <div className="input_field">
            <label>Select voices</label>
            <select
              onChange={(e) => setSelectedVoice(voicesOptions[e.target.value])}
            >
              {voicesOptions.map((voice, index) => (
                <option key={index} value={index}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          <div className="input_field input_field_row">
            <div className="input_col">
              <label>Volume</label>
              <input
                type="range"
                max="1"
                min="0"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
              />
              <span>{volume}</span>
            </div>
            <div className="input_col">
              <label>Rate</label>
              <input
                type="range"
                max="3"
                min="0"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
              <span>{rate}</span>
            </div>
            <div className="input_col">
              <label>Pitch</label>
              <input
                type="range"
                max="1"
                min="0"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
              />
              <span>{pitch}</span>
            </div>
          </div>

          <div className="input_field input_field_row">
            <div className="input_col">
              <button type="button" onClick={handlePlay}>
                Play
              </button>
            </div>
            <div className="input_col">
              <button type="button" onClick={handlePause}>
                Pause
              </button>
            </div>
            <div className="input_col">
              <button type="button" onClick={handleResume}>
                Resume
              </button>
            </div>
            <div className="input_col">
              <button type="button" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
