# Text to Voice with PDF and Groq Integration

This project allows users to upload text or PDF files, process the raw text using Groq's API for structuring and cleaning, and then convert the processed text into speech using the Web Speech API. The goal is to create a fully functional audiobook-like experience by transforming raw text into narrated audio.

## Features

- **Text Upload:** Upload `.txt` or `.pdf` files.
- **Groq Integration:** Use Groq's API to structure and clean the text for audiobook narration.
- **Speech Synthesis:** Convert the cleaned text into speech with customizable voice, volume, rate, and pitch.
- **File Processing:** PDFs are processed using `pdfjs-dist`, with optional OCR extraction if needed.

## Setup Instructions

### Prerequisites

- Node.js installed (v14.x or higher).
- Git installed (for cloning the repository).

### Steps to Run Locally

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/rachan2005/text-to-voice.git
   cd text-to-voice
   ```

2. **Install Dependencies:**

   Install the required npm packages by running the following command:

   ```bash
   npm install
   ```

3. **Set Up the `.env` File:**

   Create a `.env` file in the root directory and add the following:

   ```plaintext
   VITE_GROQ_API_KEY=your-groq-api-key
   ```

   Replace `your-groq-api-key` with your actual Groq API key.

4. **Start the Development Server:**

   To run the application locally, use the following command:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

### How to Use

1. **Upload a File:**
   - Upload a `.txt` or `.pdf` file using the file input field.
   - The system will process the file, extract the text, and use Groq API to clean and structure it.

2. **Text to Speech:**
   - Use the text box to either type or edit the text.
   - Select a voice from the dropdown list and adjust the volume, rate, and pitch using the respective sliders.
   - Click the play button to start the narration.

3. **Control Playback:**
   - Pause, resume, or reset the narration as needed using the respective buttons.


### API Usage

The project interacts with the Groq API using the key stored in the `.env` file.

1. **`processTextWithGroq(rawText)`**: Sends the raw text to the Groq API to clean and structure it for audiobook narration.
2. **`renderPdfPageToImage(pdfData, pageNum)`**: Renders each page of the PDF as an image for OCR (if necessary).
3. **`extractTextWithOCRFromPdf(pdfData)`**: Uses `pdfjs-dist` and `Tesseract.js` for OCR to extract text from PDF files.

### Environment Variables

Ensure that your `.env` file contains your Groq API key:

```plaintext
VITE_GROQ_API_KEY=your-groq-api-key
```

### Technologies Used

- **React** - Frontend framework for building the user interface.
- **Vite** - Fast build tool and development server.
- **Groq API** - Text structuring and cleaning API.
- **Web Speech API** - Used for converting text to speech.
- **pdfjs-dist** - Library for parsing PDF files.
- **Tesseract.js (Optional)** - For OCR if the PDF is image-based.

### Troubleshooting

- If you face issues with the API key, make sure the `.env` file is correctly configured and located in the root directory.
- If the text-to-speech feature doesn't work, check the browser's support for the Web Speech API.
- Ensure all dependencies are installed correctly by running `npm install` again.

---