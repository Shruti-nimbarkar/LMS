"""
File storage abstraction for IDP plugin
Supports local filesystem (with S3 abstraction ready)
"""

import os
import shutil
from pathlib import Path
from typing import Optional
from idp_plugin.core.exceptions import StorageError


class StorageService:
    """
    Storage service abstraction for file storage
    Currently supports local filesystem, can be extended for S3
    """
    
    def __init__(self, base_path: Optional[str] = None):
        """
        Initialize storage service
        
        Args:
            base_path: Base directory for file storage (default: ./idp_storage)
        """
        self.base_path = Path(base_path or os.getenv("IDP_STORAGE_PATH", "./idp_storage"))
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def save_file(self, file_content: bytes, filename: str, subdirectory: Optional[str] = None) -> str:
        """
        Save file to storage
        
        Args:
            file_content: File content as bytes
            filename: Original filename
            subdirectory: Optional subdirectory (e.g., "documents/2024/01")
            
        Returns:
            Relative path to stored file
        """
        try:
            # Create subdirectory if specified
            if subdirectory:
                storage_dir = self.base_path / subdirectory
            else:
                storage_dir = self.base_path
            
            storage_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate unique filename to avoid collisions
            file_path = storage_dir / filename
            
            # Write file
            with open(file_path, "wb") as f:
                f.write(file_content)
            
            # Return relative path
            return str(file_path.relative_to(self.base_path))
        
        except Exception as e:
            raise StorageError(f"Failed to save file: {str(e)}")
    
    def get_file_path(self, relative_path: str) -> Path:
        """
        Get full path to stored file
        
        Args:
            relative_path: Relative path from storage base
            
        Returns:
            Full Path object
        """
        full_path = self.base_path / relative_path
        if not full_path.exists():
            raise StorageError(f"File not found: {relative_path}")
        return full_path
    
    def delete_file(self, relative_path: str) -> bool:
        """
        Delete file from storage
        
        Args:
            relative_path: Relative path from storage base
            
        Returns:
            True if deleted, False if not found
        """
        try:
            file_path = self.base_path / relative_path
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception as e:
            raise StorageError(f"Failed to delete file: {str(e)}")
    
    def file_exists(self, relative_path: str) -> bool:
        """
        Check if file exists
        
        Args:
            relative_path: Relative path from storage base
            
        Returns:
            True if exists, False otherwise
        """
        file_path = self.base_path / relative_path
        return file_path.exists()





