"""
Simple test script for IDP plugin
Run this after starting the test server
"""

import requests
import json
import time
import sys
from pathlib import Path

BASE_URL = "http://localhost:8000/idp"


def test_health():
    """Test health endpoint"""
    print("1. Testing health endpoint...")
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("   ✓ Health check passed")
            return True
        else:
            print(f"   ✗ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ✗ Health check failed: {e}")
        print("   Make sure the server is running: python idp_plugin/test_server.py")
        return False


def test_upload():
    """Test document upload"""
    print("\n2. Testing document upload...")
    
    # Check if test file exists
    test_files = [
        "test_document.pdf",
        "sample.pdf",
        "../test_document.pdf"
    ]
    
    test_file = None
    for f in test_files:
        if Path(f).exists():
            test_file = f
            break
    
    if not test_file:
        print("   ⚠ No test PDF found. Create a test_document.pdf file to test upload.")
        print("   Skipping upload test...")
        return None
    
    try:
        with open(test_file, "rb") as f:
            files = {"file": f}
            data = {
                "document_type": "trf_jrf",
                "metadata": json.dumps({"test": True})
            }
            response = requests.post(f"{BASE_URL}/upload", files=files, data=data)
            
            if response.status_code == 201:
                doc = response.json()
                print(f"   ✓ Document uploaded: {doc['id']}")
                print(f"   Status: {doc['status']}")
                return doc["id"]
            else:
                print(f"   ✗ Upload failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return None
    except Exception as e:
        print(f"   ✗ Upload failed: {e}")
        return None


def test_process(document_id):
    """Test document processing"""
    if not document_id:
        print("\n3. Skipping process test (no document uploaded)")
        return
    
    print(f"\n3. Testing document processing for {document_id}...")
    print("   This may take 30-60 seconds...")
    
    try:
        response = requests.post(f"{BASE_URL}/process/{document_id}")
        
        if response.status_code == 202:
            result = response.json()
            print(f"   ✓ Processing started")
            print(f"   Status: {result.get('status', 'processing')}")
            
            # Wait a bit for processing
            print("   Waiting for processing to complete...")
            time.sleep(5)
            
            return True
        else:
            print(f"   ✗ Processing failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"   ✗ Processing failed: {e}")
        return False


def test_extraction(document_id):
    """Test extraction retrieval"""
    if not document_id:
        print("\n4. Skipping extraction test (no document)")
        return
    
    print(f"\n4. Testing extraction retrieval for {document_id}...")
    
    try:
        response = requests.get(f"{BASE_URL}/{document_id}/extraction")
        
        if response.status_code == 200:
            extraction = response.json()
            print(f"   ✓ Extraction retrieved")
            print(f"   Valid: {extraction.get('is_valid', 'unknown')}")
            
            # Show sample of extracted data
            extracted_data = extraction.get("extracted_data", {})
            if extracted_data:
                print("   Sample extracted data:")
                for key, value in list(extracted_data.items())[:3]:
                    if isinstance(value, dict):
                        print(f"     {key}: {{...}}")
                    else:
                        print(f"     {key}: {str(value)[:50]}")
            
            return True
        elif response.status_code == 404:
            print("   ⚠ Extraction not found (processing may still be in progress)")
            return None
        else:
            print(f"   ✗ Extraction retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ✗ Extraction retrieval failed: {e}")
        return False


def test_confidence(document_id):
    """Test confidence scores"""
    if not document_id:
        print("\n5. Skipping confidence test (no document)")
        return
    
    print(f"\n5. Testing confidence scores for {document_id}...")
    
    try:
        response = requests.get(f"{BASE_URL}/{document_id}/confidence")
        
        if response.status_code == 200:
            confidence = response.json()
            print(f"   ✓ Confidence scores retrieved")
            print(f"   Average confidence: {confidence.get('average_confidence', 0):.2%}")
            print(f"   Total fields: {confidence.get('total_fields', 0)}")
            return True
        elif response.status_code == 404:
            print("   ⚠ Confidence not found (extraction may not be complete)")
            return None
        else:
            print(f"   ✗ Confidence retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ✗ Confidence retrieval failed: {e}")
        return False


def test_mapping(document_id):
    """Test mapping to LMS schema"""
    if not document_id:
        print("\n6. Skipping mapping test (no document)")
        return
    
    print(f"\n6. Testing mapping to LMS schema for {document_id}...")
    
    try:
        response = requests.post(f"{BASE_URL}/{document_id}/map?target=LMS")
        
        if response.status_code == 200:
            mapped = response.json()
            print(f"   ✓ Mapping successful")
            print(f"   Target schema: {mapped.get('target_schema', 'LMS')}")
            
            mapped_data = mapped.get("mapped_data", {})
            if mapped_data:
                print("   Sample mapped data:")
                for key, value in list(mapped_data.items())[:3]:
                    print(f"     {key}: {str(value)[:50]}")
            
            return True
        elif response.status_code == 404:
            print("   ⚠ Mapping failed (extraction may not be complete)")
            return None
        else:
            print(f"   ✗ Mapping failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"   ✗ Mapping failed: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("IDP Plugin Test Suite")
    print("=" * 60)
    
    # Test health
    if not test_health():
        print("\n✗ Server is not running. Start it with:")
        print("  python idp_plugin/test_server.py")
        sys.exit(1)
    
    # Test upload
    document_id = test_upload()
    
    # Test process
    if document_id:
        test_process(document_id)
    
    # Test extraction
    if document_id:
        test_extraction(document_id)
    
    # Test confidence
    if document_id:
        test_confidence(document_id)
    
    # Test mapping
    if document_id:
        test_mapping(document_id)
    
    print("\n" + "=" * 60)
    print("Test suite complete!")
    print("=" * 60)
    print("\nNote: Some tests may be skipped if:")
    print("  - No test PDF file is available")
    print("  - Processing is still in progress")
    print("  - OpenAI API key is not configured")


if __name__ == "__main__":
    main()





