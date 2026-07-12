#!/usr/bin/env python3

# Simple test script for the app
import sys
import json

print("Testing app import...")

try:
    from app import app
    print("✅ App imported successfully")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

# Test with Flask test client
print("Testing API endpoints...")

try:
    with app.test_client() as client:
        # Test API info
        response = client.get('/api/info')
        print(f"API info response: {response.status_code}")
        if response.status_code == 200:
            data = json.loads(response.data)
            print(f"API version: {data['version']}")
            print(f"Endpoints: {list(data['endpoints'].keys())}")
        
        # Test render spec endpoint
        test_payload = {
            "canvas_width": 200,
            "canvas_height": 150,
            "hue": "purple",
            "cell_size": 20
        }
        
        response = client.post('/api/render-spec', 
                             json=test_payload,
                             content_type='application/json')
        print(f"Render spec response: {response.status_code}")
        if response.status_code == 200:
            data = json.loads(response.data)
            print(f"Canvas size: {data['canvas']['width']}x{data['canvas']['height']}")
            print(f"Number of blocks: {len(data['blocks'])}")
            print(f"First block: {data['blocks'][0] if data['blocks'] else 'None'}")
        else:
            print(f"Error response: {response.data}")

except Exception as e:
    print(f"❌ Test error: {e}")
    import traceback
    traceback.print_exc()

print("Test completed.")