"""
Mapping service for IDP plugin
Converts canonical JSON to target schema (e.g., LMS form schema)
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
import json
import os
from pathlib import Path

from idp_plugin.models.extractions import Extraction
from idp_plugin.models.audit_logs import AuditLog, AuditAction
from idp_plugin.core.exceptions import MappingError
import uuid


class MappingService:
    """
    Service for mapping canonical JSON to target schemas
    Uses config-driven mapping rules
    """
    
    def __init__(self, db: Session):
        """
        Initialize mapping service
        
        Args:
            db: Database session
        """
        self.db = db
        self.mapping_configs = self._load_mapping_configs()
    
    def map_to_target(
        self,
        extraction: Extraction,
        target_schema: str
    ) -> Dict[str, Any]:
        """
        Map extraction to target schema
        
        Args:
            extraction: Extraction object
            target_schema: Target schema identifier (e.g., "LMS")
        
        Returns:
            Mapped data dictionary
        
        Raises:
            MappingError: If mapping fails
        """
        # Get mapping config
        mapping_key = f"{extraction.document_type}_{target_schema}"
        mapping_config = self.mapping_configs.get(mapping_key)
        
        if not mapping_config:
            raise MappingError(
                f"No mapping configuration found for {extraction.document_type} -> {target_schema}"
            )
        
        # Perform mapping
        try:
            mapped_data = self._apply_mapping(
                source_data=extraction.extracted_data,
                mapping_config=mapping_config
            )
            
            # Create audit log
            self._create_audit_log(
                document_id=extraction.document_id,
                extraction_id=extraction.id,
                action=AuditAction.MAPPING_APPLIED,
                metadata={
                    "target_schema": target_schema,
                    "document_type": extraction.document_type,
                    "mapping_config": mapping_key
                }
            )
            
            return mapped_data
        
        except Exception as e:
            raise MappingError(f"Mapping failed: {str(e)}")
    
    def _apply_mapping(
        self,
        source_data: Dict[str, Any],
        mapping_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Apply mapping rules to source data
        
        Args:
            source_data: Source data dictionary
            mapping_config: Mapping configuration
        
        Returns:
            Mapped data dictionary
        """
        mapped_data = {}
        
        # Process field mappings
        field_mappings = mapping_config.get("field_mappings", {})
        
        for target_field, mapping_rule in field_mappings.items():
            try:
                mapped_value = self._map_field(
                    source_data=source_data,
                    mapping_rule=mapping_rule
                )
                
                # Set value in mapped data (handle nested paths)
                self._set_nested_value(mapped_data, target_field, mapped_value)
            
            except Exception as e:
                # Log error but continue with other fields
                print(f"Warning: Failed to map field {target_field}: {str(e)}")
                continue
        
        # Apply transformations if any
        transformations = mapping_config.get("transformations", [])
        for transformation in transformations:
            mapped_data = self._apply_transformation(mapped_data, transformation)
        
        return mapped_data
    
    def _map_field(
        self,
        source_data: Dict[str, Any],
        mapping_rule: Dict[str, Any]
    ) -> Any:
        """
        Map a single field using mapping rule
        
        Args:
            source_data: Source data dictionary
            mapping_rule: Mapping rule dictionary
        
        Returns:
            Mapped value
        """
        # Get source path
        source_path = mapping_rule.get("source_path")
        if not source_path:
            return None
        
        # Get value from source
        source_value = self._get_nested_value(source_data, source_path)
        
        # Apply transformation if specified
        transformation = mapping_rule.get("transformation")
        if transformation:
            source_value = self._apply_field_transformation(source_value, transformation)
        
        # Apply default if value is None
        if source_value is None:
            default_value = mapping_rule.get("default")
            if default_value is not None:
                return default_value
        
        return source_value
    
    def _get_nested_value(self, data: Dict[str, Any], path: str) -> Any:
        """
        Get value from nested dictionary using dot notation path
        
        Args:
            data: Dictionary to search
            path: Dot notation path (e.g., "customer.name")
        
        Returns:
            Value at path or None
        """
        parts = path.split(".")
        current = data
        
        for part in parts:
            # Handle array indices
            if "[" in part and "]" in part:
                field_name, index_str = part.split("[")
                index = int(index_str.rstrip("]"))
                if isinstance(current, dict) and field_name in current:
                    current = current[field_name]
                    if isinstance(current, list) and 0 <= index < len(current):
                        current = current[index]
                    else:
                        return None
                else:
                    return None
            else:
                if isinstance(current, dict) and part in current:
                    current = current[part]
                else:
                    return None
        
        return current
    
    def _set_nested_value(self, data: Dict[str, Any], path: str, value: Any) -> None:
        """
        Set value in nested dictionary using dot notation path
        
        Args:
            data: Dictionary to modify
            path: Dot notation path
            value: Value to set
        """
        parts = path.split(".")
        current = data
        
        for i, part in enumerate(parts[:-1]):
            if part not in current:
                current[part] = {}
            current = current[part]
        
        current[parts[-1]] = value
    
    def _apply_field_transformation(self, value: Any, transformation: Dict[str, Any]) -> Any:
        """
        Apply transformation to a field value
        
        Args:
            value: Value to transform
            transformation: Transformation configuration
        
        Returns:
            Transformed value
        """
        transform_type = transformation.get("type")
        
        if transform_type == "format_date":
            # Format date (simplified - in production, use proper date parsing)
            return value  # TODO: Implement date formatting
        
        elif transform_type == "concat":
            # Concatenate multiple fields
            fields = transformation.get("fields", [])
            values = [str(value)]  # Start with current value
            # TODO: Get other field values and concatenate
            return " ".join(values)
        
        elif transform_type == "lookup":
            # Lookup value in mapping table
            lookup_table = transformation.get("lookup_table", {})
            return lookup_table.get(str(value), value)
        
        elif transform_type == "split":
            # Split string value
            delimiter = transformation.get("delimiter", " ")
            if isinstance(value, str):
                return value.split(delimiter)
            return value
        
        else:
            return value
    
    def _apply_transformation(
        self,
        data: Dict[str, Any],
        transformation: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Apply transformation to entire mapped data
        
        Args:
            data: Mapped data dictionary
            transformation: Transformation configuration
        
        Returns:
            Transformed data dictionary
        """
        transform_type = transformation.get("type")
        
        if transform_type == "flatten_arrays":
            # Flatten array fields (simplified)
            # TODO: Implement array flattening logic
            pass
        
        elif transform_type == "add_metadata":
            # Add metadata fields
            metadata = transformation.get("metadata", {})
            data["_metadata"] = metadata
        
        return data
    
    def _load_mapping_configs(self) -> Dict[str, Dict[str, Any]]:
        """
        Load mapping configurations from files
        
        Returns:
            Dictionary of mapping configurations
        """
        configs = {}
        config_dir = Path(__file__).parent.parent / "config" / "mappings"
        
        if not config_dir.exists():
            # Return default empty configs
            return configs
        
        # Load mapping config files
        for config_file in config_dir.glob("*.json"):
            try:
                with open(config_file, "r") as f:
                    config_data = json.load(f)
                    config_key = config_file.stem  # Filename without extension
                    configs[config_key] = config_data
            except Exception as e:
                print(f"Warning: Failed to load mapping config {config_file}: {str(e)}")
        
        return configs
    
    def _create_audit_log(
        self,
        document_id: str,
        extraction_id: str,
        action: AuditAction,
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Create an audit log entry"""
        audit_log = AuditLog(
            id=str(uuid.uuid4()),
            document_id=document_id,
            extraction_id=extraction_id,
            action=action,
            performed_by="system",
            performed_by_type="system",
            audit_metadata=metadata or {}
        )
        self.db.add(audit_log)
        self.db.commit()


