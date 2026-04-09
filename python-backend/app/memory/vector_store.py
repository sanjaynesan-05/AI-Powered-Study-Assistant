import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config import settings
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class VectorStore:
    """Enterprise Vector Store using ChromaDB for RAG capabilities"""
    
    def __init__(self):
        # We default to local persistence for highest stability in this environment
        self.persist_directory = getattr(settings, "CHROMA_PERSIST_DIRECTORY", "./chroma_db_enterprise")
        
        try:
            self.client = chromadb.PersistentClient(
                path=self.persist_directory,
                settings=ChromaSettings(anonymized_telemetry=False)
            )
            logger.info(f"Initialized Local ChromaDB at {self.persist_directory}")
        except Exception as e:
            logger.error(f"Critical failure initializing ChromaDB: {e}")
            raise

    def get_or_create_collection(self, name: str):
        """Get or create a collection for a specific subject or user"""
        return self.client.get_or_create_collection(name=name)

    async def add_documents(self, collection_name: str, documents: List[str], metadatas: List[Dict[str, Any]], ids: List[str]):
        """Add documents to the vector store"""
        collection = self.get_or_create_collection(collection_name)
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

    async def query(self, collection_name: str, query_texts: List[str], n_results: int = 3) -> Dict[str, Any]:
        """Query the vector store for similar documents"""
        collection = self.get_or_create_collection(collection_name)
        return collection.query(
            query_texts=query_texts,
            n_results=n_results
        )

vector_store = VectorStore()
