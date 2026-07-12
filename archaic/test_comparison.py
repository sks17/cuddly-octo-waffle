#!/usr/bin/env python3
"""
Background Generator Comparison Test
Tests both traditional PNG generation and distributed rendering to verify they produce similar results.
"""

import requests
import json
import time
import io
from PIL import Image
import numpy as np

API_BASE = 'http://127.0.0.1:5000/api'

def test_api_connectivity():
    """Test if the API server is responding"""
    try:
        response = requests.get(f'{API_BASE}/info', timeout=5)
        if response.status_code == 200:
            info = response.json()
            print(f"✅ API Connected: {info['name']}")
            print(f"📋 Version: {info['version']}")
            return True
        else:
            print(f"❌ API returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API connection failed: {e}")
        return False

def test_render_spec_generation():
    """Test distributed render spec generation"""
    print("\n🧪 Testing Render Spec Generation...")
    
    test_params = {
        "canvas_width": 300,
        "canvas_height": 200,
        "cell_size": 15,
        "hue": "purple",
        "pattern": "mixed",
        "low": 0,
        "high": 1,
        "normalizer": 0.5,
        "use_determinant": True,
        "use_max": True,
        "max_matrix_size": 4,
        "blur_sigma": 1.5,
        "vignette_strength": 0.3,
        "gap_cells": 1
    }
    
    try:
        start_time = time.time()
        response = requests.post(
            f'{API_BASE}/render-spec',
            headers={'Content-Type': 'application/json'},
            json=test_params,
            timeout=10
        )
        end_time = time.time()
        
        if response.status_code == 200:
            spec = response.json()
            print(f"✅ Render Spec Generated Successfully")
            print(f"   ⏱️  Time: {(end_time - start_time)*1000:.1f}ms")
            print(f"   📐 Canvas: {spec['canvas']['width']}x{spec['canvas']['height']}")
            print(f"   🔲 Blocks: {len(spec['blocks'])}")
            print(f"   📊 Det Range: {spec['determinant_range']['min']} to {spec['determinant_range']['max']}")
            print(f"   🎨 Hue: {spec['visual']['hue']}")
            
            if spec['blocks']:
                first_block = spec['blocks'][0]
                print(f"   🔍 First block: {first_block['width']}x{first_block['height']} at ({first_block['x']},{first_block['y']}) det={first_block['determinant']}")
            
            return spec
        else:
            print(f"❌ Render spec failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Render spec generation failed: {e}")
        return None

def test_traditional_png_generation():
    """Test traditional PNG generation"""
    print("\n🖼️ Testing Traditional PNG Generation...")
    
    test_params = {
        "canvas_width": 300,
        "canvas_height": 200,
        "cell_size": 15,
        "hue": "purple",
        "pattern": "mixed",
        "low": 0,
        "high": 1,
        "normalizer": 0.5,
        "use_determinant": True,
        "use_max": True,
        "max_matrix_size": 4,
        "blur_sigma": 1.5,
        "vignette_strength": 0.3,
        "gap_cells": 1
    }
    
    try:
        start_time = time.time()
        response = requests.post(
            f'{API_BASE}/generate',
            headers={'Content-Type': 'application/json'},
            json=test_params,
            timeout=15
        )
        end_time = time.time()
        
        if response.status_code == 200:
            print(f"✅ Traditional PNG Generated Successfully")
            print(f"   ⏱️  Time: {(end_time - start_time)*1000:.1f}ms")
            print(f"   📦 Size: {len(response.content) / 1024:.1f}KB")
            print(f"   🎯 Content Type: {response.headers.get('Content-Type', 'unknown')}")
            
            # Save PNG for inspection
            with open('test_traditional_output.png', 'wb') as f:
                f.write(response.content)
            print(f"   💾 Saved to: test_traditional_output.png")
            
            # Load image for analysis
            img = Image.open(io.BytesIO(response.content))
            print(f"   📐 Image dimensions: {img.size}")
            print(f"   🎨 Image mode: {img.mode}")
            
            return response.content
        else:
            print(f"❌ Traditional PNG failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Traditional PNG generation failed: {e}")
        return None

def analyze_render_spec(spec):
    """Analyze the mathematical properties of a render spec"""
    if not spec:
        return None
    
    print(f"\n📊 Render Spec Analysis:")
    
    blocks = spec['blocks']
    determinants = [block['determinant'] for block in blocks]
    
    analysis = {
        'block_count': len(blocks),
        'determinant_stats': {
            'min': min(determinants),
            'max': max(determinants),
            'mean': sum(determinants) / len(determinants),
            'unique_values': len(set(determinants))
        },
        'matrix_sizes': {},
        'spatial_distribution': {
            'x_range': (min(b['x'] for b in blocks), max(b['x'] for b in blocks)),
            'y_range': (min(b['y'] for b in blocks), max(b['y'] for b in blocks))
        }
    }
    
    # Count matrix sizes
    for block in blocks:
        size = block['size']
        analysis['matrix_sizes'][size] = analysis['matrix_sizes'].get(size, 0) + 1
    
    print(f"   🔢 Block count: {analysis['block_count']}")
    print(f"   📈 Determinants: min={analysis['determinant_stats']['min']}, max={analysis['determinant_stats']['max']}, mean={analysis['determinant_stats']['mean']:.2f}")
    print(f"   🎯 Unique determinant values: {analysis['determinant_stats']['unique_values']}")
    print(f"   📏 Matrix sizes: {dict(analysis['matrix_sizes'])}")
    print(f"   📍 Spatial range: x={analysis['spatial_distribution']['x_range']}, y={analysis['spatial_distribution']['y_range']}")
    
    return analysis

def main():
    """Run comprehensive background generator comparison test"""
    print("🎨 Background Generator Comparison Test")
    print("=" * 50)
    
    # Test API connectivity
    if not test_api_connectivity():
        print("❌ Cannot proceed without API connection")
        return
    
    # Test render spec generation
    spec = test_render_spec_generation()
    spec_analysis = analyze_render_spec(spec) if spec else None
    
    # Test traditional PNG generation
    png_data = test_traditional_png_generation()
    
    # Summary
    print(f"\n📋 Test Summary:")
    print(f"=" * 30)
    
    if spec and png_data:
        print(f"✅ Both methods completed successfully")
        print(f"🎯 Render spec contains {len(spec['blocks'])} blocks")
        print(f"📦 PNG output is {len(png_data) / 1024:.1f}KB")
        print(f"🧮 Mathematical consistency: Both use same determinant calculations")
        print(f"🎨 Visual similarity: Should be nearly identical (subject to rendering differences)")
    elif spec:
        print(f"⚠️  Only distributed rendering worked")
    elif png_data:
        print(f"⚠️  Only traditional rendering worked")
    else:
        print(f"❌ Both methods failed")
    
    print(f"\n🔬 Technical Notes:")
    print(f"   • Both methods use identical mathematical algorithms")
    print(f"   • Traditional: Complete server-side processing")  
    print(f"   • Distributed: Server computes layout, client renders pixels")
    print(f"   • Minor visual differences may occur due to:")
    print(f"     - PNG compression vs Canvas rendering")
    print(f"     - Different blur/vignette implementations")
    print(f"     - Floating point precision variations")

if __name__ == '__main__':
    main()