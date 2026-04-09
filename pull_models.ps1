# AI Study Assistant - Model Rollout Script
# This script ensures all required localized models are pulled into Ollama.

Write-Host "🧠 Pulling Required Local AI Models..." -ForegroundColor Cyan

# Models to pull
$models = @(
    "llama3.2:3b",      # Fast Conversational / Orchestration
    "nomic-embed-text",  # High-performance local embeddings for RAG
    "qwen2.5:3b-instruct" # Precise structural generator
)

foreach ($model in $models) {
    Write-Host "📥 Pulling $model..." -ForegroundColor Yellow
    ollama pull $model
}

Write-Host "`n✅ All models are ready!" -ForegroundColor Green
Write-Host "Now you can enjoy high-speed, localized AI with RAG capabilities." -ForegroundColor Gray
