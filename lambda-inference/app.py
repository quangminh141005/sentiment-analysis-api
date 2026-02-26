import json
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline

# Load model at cold start
MODEL_PATH = "/opt/ml/model" 
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
classifier = pipeline("sentiment_analysis", model=model, tokenizer=tokenizer)

# Label mapping
LABEL_MAP = {
    "LABEL_0": "negative",
    "LABEL_1": "neutral",
    "LABEL_2": "positive"
}

def lambda_handler(event, context):
    try:
        # parse input
        body = json.loads(event.get('body', {}))
        text = body.get('text', '')

        if not text: # if text don't exist
            return {
                'statusCode': 400,
                'body': json.dump({'error': 'Missing text field'})
            }
        
        # run inference
        text = classifier(text)[0]

        # format response
        response = {
            'text': text,
            'sentiment': LABEL_MAP.get(result['label'], result['label']),
            'confidence': round(result['score'], 4),
            'model_version': '1.0.0'
        }

        return {
            'statusCode': 200,
            'headers': {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response)
        }
    
    except Exception as e:
        print(f"Error: {str(e)}") #Cloudwatch log
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error...'})
        } 