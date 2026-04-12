"""
Memory Management - Uses ChromaDB for local conversational memory and RAG context.
"""
import chromadb
import uuid
import logging
import os
from typing import List, Dict, Any, Optional
from app.utils.ollama_client import ollama_client

# Ensure telemetry is disabled consistently
os.environ["ANONYMIZED_TELEMETRY"] = "False"

logger = logging.getLogger(__name__)

# Constants
CHROMA_DATA_PATH = "./chroma_db"
COLLECTION_NAME = "conversation_memory"
EMBEDDING_MODEL = "nomic-embed-text"
TOP_K = 3
SIMILARITY_THRESHOLD = 1.5 # Lower means more similar for L2 distance

class ConversationMemory:
    """Manages conversational memory using a local vector database."""

    def __init__(self, persist_path: str = CHROMA_DATA_PATH):
        self.client = chromadb.PersistentClient(path=persist_path)
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "l2"} # Using L2 distance
        )
        logger.info(f"[Memory] Initialized ChromaDB at {persist_path}")

    async def store(self, prompt: str, response: str, metadata: Optional[Dict] = None):
        """
        Embed and store a prompt-response pair in the vector database.
        """
        try:
            combined_text = f"User: {prompt}\nAI: {response}"
            embedding = await ollama_client.get_embedding(combined_text, model=EMBEDDING_MODEL)
            
            # Generate a unique ID for the memory entry
            memory_id = str(uuid.uuid4())
            
            self.collection.add(
                ids=[memory_id],
                embeddings=[embedding],
                documents=[combined_text],
                metadatas=[metadata or {"timestamp": str(uuid.uuid1())}]
            )
            logger.info(f"[Memory] Stored new interaction. ID: {memory_id}")
            
        except Exception as e:
            logger.error(f"[Memory] Failed to store interaction: {str(e)}")
            # Don't crash the system if memory storage fails

    async def retrieve(self, query: str) -> str:
        """
        Find relevant past interactions based on semantic similarity.
        Returns a combined context string.
        """
        try:
            query_embedding = await ollama_client.get_embedding(query, model=EMBEDDING_MODEL)
            
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=TOP_K
            )
            
            # Filter by threshold and build context
            context_parts = []
            if results and results['documents']:
                for doc, dist in zip(results['documents'][0], results['distances'][0]):
                    if dist < SIMILARITY_THRESHOLD:
                        context_parts.append(doc)
            
            if not context_parts:
                logger.info(f"[Memory] No relevant memories found for: '{query[:30]}...'")
                return ""
            
            logger.info(f"[Memory] Retrieved {len(context_parts)} relevant memories.")
            return "\n\n---\n\n".join(context_parts)
            
        except Exception as e:
            logger.error(f"[Memory] Failed to retrieve context: {str(e)}")
            return ""

# Singleton Instance
memory_store = ConversationMemory()
