from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import base64
import os
import json
from PIL import Image
import pytesseract
import io
from openai import OpenAI

# Set Tesseract path for Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = Flask(__name__)
CORS(app)

# Set your OpenAI API key
os.environ['OPENAI_API_KEY'] = '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'

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

def process_bill_image(base64_image):
    try:
        # Decode base64 image
        image_data = base64.b64decode(base64_image.split(',')[1])
        image = Image.open(io.BytesIO(image_data))
        
        # Extract text using OCR
        text = pytesseract.image_to_string(image)
        
        # Process with GPT-4
        prompt = f"""Analyze this bill text and extract expenses:
        {text}

        Return JSON format with:
        - description (item/service name)
        - amount (numeric value)
        - category (groceries/dining/utilities/shopping/entertainment/other)"""
        
        client = OpenAI()
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        
        items = json.loads(response.choices[0].message.content)
        return items
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return []

@app.route('/process-bills', methods=['POST'])
def process_bills():
    try:
        data = request.json
        images = data.get('images', [])
        
        all_expenses = []
        for image in images:
            items = process_bill_image(image)
            all_expenses.extend(items)
        
        # Categorize expenses
        categories = {
            'groceries': 0.0,
            'dining': 0.0,
            'utilities': 0.0,
            'shopping': 0.0,
            'entertainment': 0.0,
            'other': 0.0
        }
        
        for item in all_expenses:
            cat = item['category'].lower()
            if cat in categories:
                categories[cat] += float(item['amount'])
            else:
                categories['other'] += float(item['amount'])
        
        return jsonify({
            'raw_expenses': all_expenses,
            'category_totals': categories
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 