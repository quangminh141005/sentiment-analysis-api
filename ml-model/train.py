import torch
from transformers import {
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments
}
from datasets import load_dataset

# Load pre-trained model
model_name = "distilbert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(
    model_name,
    num_labels=3 # positive, negative, neutral
)

# Load dataset
dataset = load_dataset("tweet_eval", "sentiment")

# Tokenize
def tokenize_function(examples):
    return tokenizer(
        examples["text"],
        padding="max_length",
        truncation=True
    )
