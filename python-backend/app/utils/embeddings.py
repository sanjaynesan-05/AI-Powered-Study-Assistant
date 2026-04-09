from langchain_community.embeddings import OllamaEmbeddings
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class EmbeddingEngine:
    """Engine for generating localized vector embeddings using Ollama"""
    
    def __init__(self):
        self.base_url = getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434")
        self.model = "nomic-embed-text"
        self._engine = None

    def get_engine(self):
        if self._engine is None:
            logger.info(f"Initializing OllamaEmbeddings with model: {self.model}")
            self._engine = OllamaEmbeddings(
                base_url=self.base_url,
                model=self.model
            )
        return self._engine

    async def embed_query(self, text: str):
        """Generate embedding for a single query string"""
        engine = self.get_engine()
        return await engine.aembed_query(text)

    async def embed_documents(self, texts: list):
        """Generate embeddings for a list of documents"""
        engine = self.get_engine()
        return await engine.aembed_documents(texts)

embedding_engine = EmbeddingEngine()
