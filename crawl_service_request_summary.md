# Crawl Service Request Summary

This document summarizes how to make different types of requests to the crawl service and the expected structured data for each one.

## 1. Basic Crawl Request

### Request

```python
import requests
import json

url = "https://crawl4ai-app.azurewebsites.net/crawl"
payload = {
    "urls": ["https://www.example.com"],
    "extraction_strategy": "NoExtractionStrategy",
    "chunking_strategy": "RegexChunking",
    "include_raw_html": False,
    "bypass_cache": True,
    "extract_blocks": True,
    "word_count_threshold": 5,
    "verbose": True
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
```

### Expected Response Structure

```json
{
  "results": [
    {
      "url": "https://www.example.com",
      "html": null,
      "success": true,
      "cleaned_html": "...",
      "media": {
        "images": [...],
        "videos": [...],
        "audios": [...]
      },
      "links": {
        "internal": [...],
        "external": [...]
      },
      "screenshot": null,
      "markdown": "...",
      "extracted_content": "...",
      "metadata": {...},
      "error_message": ""
    }
  ]
}
```

## 2. Image-focused Extraction (Cosine Strategy)

### Request

```python
import requests
import json

url = "https://crawl4ai-app.azurewebsites.net/crawl"
payload = {
    "urls": ["https://nomadlist.com"],
    "extraction_strategy": "CosineStrategy",
    "chunking_strategy": "RegexChunking",
    "include_raw_html": False,
    "bypass_cache": True,
    "extract_blocks": True,
    "word_count_threshold": 5,
    "verbose": True,
    "extraction_strategy_args": {
        "semantic_filter": "image photo picture",
        "word_count_threshold": 10,
        "max_dist": 0.2,
        "top_k": 3,
        "sim_threshold": 0.3
    }
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
```

### Expected Response Structure

The response structure is similar to the basic crawl request, but the `extracted_content` field will contain image-related information:

```json
{
  "results": [
    {
      ...
      "extracted_content": [
        {
          "alt": "Image description",
          "src": "https://example.com/image.jpg"
        },
        ...
      ],
      ...
    }
  ]
}
```

## 3. Semantic Content Extraction (Cosine Strategy)

### Request

```python
import requests
import json

url = "https://crawl4ai-app.azurewebsites.net/crawl"
payload = {
    "urls": ["https://nomadlist.com"],
    "extraction_strategy": "CosineStrategy",
    "chunking_strategy": "RegexChunking",
    "include_raw_html": False,
    "bypass_cache": True,
    "word_count_threshold": 5,
    "verbose": True,
    "js": ["window.scrollTo(0, document.body.scrollHeight);"],
    "extraction_strategy_args": {
        "semantic_filter": "city name cost of living digital nomad score",
        "top_k": 10,
        "sim_threshold": 0.3
    }
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
```

### Expected Response Structure

The response structure is similar to the basic crawl request, but the `extracted_content` field will contain semantically relevant information:

```json
{
  "results": [
    {
      ...
      "extracted_content": [
        {
          "index": 1,
          "tags": ["category1", "category2"],
          "content": "Relevant extracted content..."
        },
        ...
      ],
      ...
    }
  ]
}
```

## 4. LLM-based Extraction (LLMExtractionStrategy)

### Request

```python
import requests
import json
import os

url = "https://crawl4ai-app.azurewebsites.net/crawl"
payload = {
    "urls": ["https://openai.com/api/pricing/"],
    "extraction_strategy": "LLMExtractionStrategy",
    "chunking_strategy": "RegexChunking",
    "include_raw_html": False,
    "bypass_cache": True,
    "word_count_threshold": 1,
    "verbose": True,
    "extraction_strategy_args": {
        "provider": "openai/gpt-4o-mini",
        "api_token": os.getenv('OPENAI_API_KEY'),
        "schema": {
            "type": "object",
            "properties": {
                "model_name": {"type": "string", "description": "Name of the OpenAI model."},
                "input_fee": {"type": "string", "description": "Fee for input token for the OpenAI model."},
                "output_fee": {"type": "string", "description": "Fee for output token for the OpenAI model."}
            },
            "required": ["model_name", "input_fee", "output_fee"]
        },
        "extraction_type": "schema",
        "instruction": "From the crawled content, extract all mentioned model names along with their fees for input and output tokens."
    }
}

headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
```

### Expected Response Structure

The response structure is similar to the basic crawl request, but the `extracted_content` field will contain structured data according to the provided schema:

```json
{
  "results": [
    {
      ...
      "extracted_content": [
        {
          "model_name": "GPT-4",
          "input_fee": "US$10.00 / 1M tokens",
          "output_fee": "US$30.00 / 1M tokens"
        },
        ...
      ],
      ...
    }
  ]
}
```

## Summary

1. **Basic Crawl**: Use `NoExtractionStrategy` for general webpage information.
2. **Image-focused Extraction**: Use `CosineStrategy` with image-related semantic filters.
3. **Semantic Content Extraction**: Use `CosineStrategy` with custom semantic filters for targeted content.
4. **LLM-based Extraction**: Use `LLMExtractionStrategy` for complex, structured data extraction tasks.

Each strategy returns a similar overall response structure, with the `extracted_content` field varying based on the extraction method used. Adjust the payload parameters to fine-tune the extraction process for your specific needs.