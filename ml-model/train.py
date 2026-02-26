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
        truncation=True,
        max_length=128
    )

tokenized_datasets = dataset.map(tokenize_function, batched=True)

# Training Arguments
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=2, 
    per_device_train_batch_size=16,
    per_device_eval_batch_size=32,
    warmup_step=500,
    weight_decay=0.01,
    logging_dir="./logs",
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
)

