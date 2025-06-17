# Bill Management System

A modern web application for processing and analyzing bills using OCR and AI. The system extracts information from bill images, categorizes expenses, and provides visual analytics.

## Features

- Drag and drop interface for bill uploads
- OCR-powered bill text extraction
- AI-powered expense categorization
- Interactive expense visualization
- Real-time expense analysis and alerts
- Responsive design for all devices

## Prerequisites

- Python 3.8 or higher
- Tesseract OCR
- Node.js (optional, for development)

## Installation

1. Install Tesseract OCR:
   - Windows: Download and install from [Tesseract GitHub](https://github.com/UB-Mannheim/tesseract/wiki)
   - Linux: `sudo apt install tesseract-ocr`
   - Mac: `brew install tesseract`

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up your OpenAI API key:
   - Create a `.env` file in the project root
   - Add your API key: `OPENAI_API_KEY=your_api_key_here`

## Usage

1. Start the Flask server:
   ```bash
   python app.py
   ```

2. Open `index.html` in your web browser

3. Upload bill images by either:
   - Dragging and dropping them onto the upload zone
   - Clicking the "Choose Files" button

4. View the analysis results:
   - Total expenditure
   - Category breakdown
   - Visual charts
   - Spending alerts

## Development

The project structure:
```
.
├── app.py              # Flask backend server
├── index.html         # Main HTML file
├── styles.css         # CSS styles
├── script.js          # Frontend JavaScript
└── requirements.txt   # Python dependencies
```

## Security Notes

- Never commit your OpenAI API key to version control
- Use environment variables for sensitive data
- Implement proper input validation and sanitization
- Add rate limiting for production use

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 