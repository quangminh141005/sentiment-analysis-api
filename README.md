# Sentiment Analysis API

A serverless, production-ready API for sentiment analysis powered by machine learning. Built with AWS Lambda, TypeScript, Python, and HuggingFace Transformers.

## Overview

This project provides a high-performance sentiment analysis service that classifies text into three sentiments:
- **Positive** 
- **Neutral**  
- **Negative** 

The API uses a fine-tuned DistilBERT model for accurate, fast predictions with confidence scores.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  API Gateway / HTTP                      │
└────────────────────────��────────────────────────────────┘
                         │
                    ▼
┌─────────────────────────────────────────────────────────┐
│            Lambda API Layer (TypeScript)                 │
│              - Request validation                        │
│              - Response formatting                       │
│              - Error handling                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│         Lambda Inference (Python/Docker)                 │
│              - Model inference                           │
│              - Label mapping                             │
│              - Confidence scoring                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │  ML Model      │
        │ DistilBERT     │
        │ (3 labels)     │
        └────────────────┘
```

## Project Structure

```
sentiment-analysis-api/
├── lambda-api/                 # REST API Lambda function
│   ├── index.ts               # Handler for API requests
│   ├── package.json           # TypeScript dependencies
│   └── tsconfig.json          # TypeScript configuration
│
├── lambda-inference/           # ML inference Lambda function
│   ├── app.py                 # Inference handler
│   ├── Dockerfile             # Container image definition
│   └── requirements.txt        # Python dependencies
│
├── ml-model/                   # Model training code
│   └── train.py               # Training script with HuggingFace
│
└── infrastructure/             # AWS CDK (Infrastructure as Code)
    ├── package.json           # CDK dependencies
    └── bin/app.js             # CDK stack definition
```

## Key Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| API | TypeScript + AWS Lambda | REST endpoint |
| Inference | Python + PyTorch | ML model inference |
| Model | DistilBERT (HuggingFace) | Sentiment classification |
| Container | Docker | Lambda custom runtime |
| Infrastructure | AWS CDK | Infrastructure automation |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- AWS CLI configured with credentials
- Docker (for building inference Lambda)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/quangminh141005/sentiment-analysis-api.git
   cd sentiment-analysis-api
   ```

2. **Install dependencies**
   ```bash
   # API Lambda
   cd lambda-api
   npm install

   # Infrastructure
   cd ../infrastructure
   npm install

   # Model training (optional)
   cd ../ml-model
   pip install torch transformers datasets
   ```

### Local Development

#### Running the API Lambda Locally

```bash
cd lambda-api
npm run build
# Use AWS SAM or local testing with mock events
```

#### Training the Model

```bash
cd ml-model
python train.py
```

This will:
- Load the tweet_eval sentiment dataset
- Fine-tune DistilBERT for 3 labels (positive, negative, neutral)
- Save the model to `./saved_model`

## API Usage

### Request

```bash
curl -X POST https://your-api-endpoint/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "I absolutely love this product!"}'
```

### Request Body

```json
{
  "text": "Your text to analyze here"
}
```

### Response (Success)

```json
{
  "text": "I absolutely love this product!",
  "sentiment": "positive",
  "confidence": 0.9876,
  "model_version": "1.0.0"
}
```

### Response (Error)

```json
{
  "error": "Missing text field"
}
```

## Sentiment Labels

- **Positive**: Confident positive sentiment
- **Neutral**: Neutral or mixed sentiment
- **Negative**: Confident negative sentiment

Confidence scores range from 0 to 1, where 1.0 is highest confidence.

## Deployment

### Deploy to AWS

1. **Build the inference Lambda image**
   ```bash
   cd lambda-inference
   docker build -t sentiment-inference:latest .
   # Push to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URI
   docker tag sentiment-inference:latest YOUR_ECR_URI/sentiment-inference:latest
   docker push YOUR_ECR_URI/sentiment-inference:latest
   ```

2. **Deploy infrastructure with CDK**
   ```bash
   cd infrastructure
   npm run build
   npx cdk deploy
   ```

3. **Set environment variables**
   - Set `ML_LAMBDA_NAME` in the API Lambda to point to the inference Lambda

## Performance

- **Model**: DistilBERT (lightweight, 66M parameters)
- **Inference Latency**: ~100-200ms per request
- **Cold Start**: ~3-5 seconds (containerized Lambda)
- **Throughput**: Scales automatically with AWS Lambda

## Development

### Technology Stack Details

**TypeScript (65.8%)**
- Type-safe API handler
- AWS SDK integration
- Strict compiler settings

**Python (26.3%)**
- PyTorch/Transformers for ML
- Lambda handler
- Model training

**JavaScript (6.1%)**
- CDK infrastructure definitions

**Docker (1.8%)**
- Custom Lambda runtime

### Code Quality

- Type safety with TypeScript strict mode
- Error handling and validation
- CORS enabled for web integration
- Proper HTTP status codes

## Model Details

**Pre-trained Model**: DistilBERT base uncased
- **Training Data**: tweet_eval sentiment dataset
- **Labels**: 3 (Positive, Neutral, Negative)
- **Max Sequence Length**: 128 tokens
- **Training Epochs**: 2
- **Batch Size**: 16 (train), 32 (eval)

## Contributing

Contributions welcome! Areas for improvement:

- [ ] Add comprehensive test suite
- [ ] Implement CI/CD pipeline (GitHub Actions)
- [ ] Add request/response logging
- [ ] Performance optimizations
- [ ] Multi-language support
- [ ] Batch inference endpoint

## License

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Author

**Quang Minh** - [GitHub](https://github.com/quangminh141005)

## Support

For issues, questions, or suggestions, please open a GitHub issue.

---

## Quick Stats

- **Languages**: TypeScript, Python, JavaScript, Dockerfile
- **AWS Services**: Lambda, ECR (implied), API Gateway
- **ML Framework**: HuggingFace Transformers
- **Deployment**: Serverless (AWS Lambda)