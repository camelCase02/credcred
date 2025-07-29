#!/usr/bin/env python3
"""
Test script to demonstrate concurrent request handling.
"""

import asyncio
import aiohttp
import time
import json
from typing import List, Dict
import statistics

# Configuration
BASE_URL = "http://localhost:8000"
CONCURRENT_REQUESTS = 20
TOTAL_REQUESTS = 100

async def make_request(session: aiohttp.ClientSession, endpoint: str, request_id: int) -> Dict:
    """Make a single request and return timing information."""
    start_time = time.time()
    
    try:
        async with session.get(f"{BASE_URL}{endpoint}") as response:
            response_time = time.time() - start_time
            status = response.status
            content = await response.text()
            
            return {
                "request_id": request_id,
                "endpoint": endpoint,
                "status": status,
                "response_time": response_time,
                "success": status == 200,
                "content_length": len(content)
            }
    except Exception as e:
        response_time = time.time() - start_time
        return {
            "request_id": request_id,
            "endpoint": endpoint,
            "status": 0,
            "response_time": response_time,
            "success": False,
            "error": str(e)
        }

async def test_concurrent_requests(endpoint: str, concurrent_limit: int = 10):
    """Test concurrent requests to a specific endpoint."""
    print(f"\n🧪 Testing concurrent requests to {endpoint}")
    print(f"📊 Concurrent limit: {concurrent_limit}")
    
    # Create semaphore to limit concurrent requests
    semaphore = asyncio.Semaphore(concurrent_limit)
    
    async def limited_request(session: aiohttp.ClientSession, request_id: int):
        async with semaphore:
            return await make_request(session, endpoint, request_id)
    
    async with aiohttp.ClientSession() as session:
        # Create tasks for all requests
        tasks = [
            limited_request(session, i) 
            for i in range(TOTAL_REQUESTS)
        ]
        
        # Execute all requests
        start_time = time.time()
        results = await asyncio.gather(*tasks)
        total_time = time.time() - start_time
        
        # Analyze results
        successful_requests = [r for r in results if r["success"]]
        failed_requests = [r for r in results if not r["success"]]
        
        response_times = [r["response_time"] for r in successful_requests]
        
        print(f"✅ Total requests: {TOTAL_REQUESTS}")
        print(f"✅ Successful: {len(successful_requests)}")
        print(f"❌ Failed: {len(failed_requests)}")
        print(f"⏱️  Total time: {total_time:.2f}s")
        print(f"🚀 Requests per second: {TOTAL_REQUESTS / total_time:.2f}")
        
        if response_times:
            print(f"📈 Response time stats:")
            print(f"   - Average: {statistics.mean(response_times):.3f}s")
            print(f"   - Median: {statistics.median(response_times):.3f}s")
            print(f"   - Min: {min(response_times):.3f}s")
            print(f"   - Max: {max(response_times):.3f}s")
            print(f"   - Std Dev: {statistics.stdev(response_times):.3f}s")
        
        return {
            "endpoint": endpoint,
            "total_requests": TOTAL_REQUESTS,
            "successful": len(successful_requests),
            "failed": len(failed_requests),
            "total_time": total_time,
            "requests_per_second": TOTAL_REQUESTS / total_time,
            "avg_response_time": statistics.mean(response_times) if response_times else 0
        }

async def test_batch_credentialing():
    """Test the batch credentialing endpoint with concurrent processing."""
    print(f"\n🧪 Testing batch credentialing endpoint")
    
    # Sample provider IDs (adjust based on your data)
    provider_ids = [f"provider_{i:03d}" for i in range(1, 21)]  # 20 providers
    
    async with aiohttp.ClientSession() as session:
        start_time = time.time()
        
        payload = {"provider_ids": provider_ids}
        async with session.post(f"{BASE_URL}/batch-credential", json=payload) as response:
            response_time = time.time() - start_time
            status = response.status
            content = await response.text()
            
            print(f"✅ Status: {status}")
            print(f"⏱️  Response time: {response_time:.2f}s")
            print(f"📊 Providers processed: {len(provider_ids)}")
            print(f"🚀 Providers per second: {len(provider_ids) / response_time:.2f}")
            
            if status == 200:
                try:
                    result = json.loads(content)
                    successful_results = sum(1 for r in result.get("batch_results", {}).values() if r.get("success"))
                    print(f"✅ Successful credentialing: {successful_results}/{len(provider_ids)}")
                except:
                    pass

async def check_health():
    """Check the health and concurrency status of the service."""
    print(f"\n🏥 Checking service health and concurrency status")
    
    async with aiohttp.ClientSession() as session:
        # Basic health check
        async with session.get(f"{BASE_URL}/health") as response:
            if response.status == 200:
                print("✅ Basic health check: PASSED")
            else:
                print("❌ Basic health check: FAILED")
        
        # Concurrency health check
        async with session.get(f"{BASE_URL}/health/concurrency") as response:
            if response.status == 200:
                data = await response.json()
                print("✅ Concurrency health check: PASSED")
                print(f"📊 Active tasks: {data.get('concurrency', {}).get('active_tasks', 'N/A')}")
                print(f"🖥️  CPU usage: {data.get('system', {}).get('cpu_percent', 'N/A')}%")
                print(f"💾 Memory usage: {data.get('system', {}).get('memory_percent', 'N/A')}%")
            else:
                print("❌ Concurrency health check: FAILED")

async def main():
    """Run all concurrency tests."""
    print("🚀 Starting concurrency tests...")
    print(f"🌐 Base URL: {BASE_URL}")
    
    # Check service health first
    await check_health()
    
    # Test different endpoints with different concurrency levels
    endpoints_to_test = [
        ("/health", 50),  # High concurrency for health endpoint
        ("/providers", 20),  # Medium concurrency for data endpoints
        ("/stats/credentialing", 30),  # Medium concurrency for stats
    ]
    
    results = []
    
    for endpoint, concurrent_limit in endpoints_to_test:
        try:
            result = await test_concurrent_requests(endpoint, concurrent_limit)
            results.append(result)
        except Exception as e:
            print(f"❌ Error testing {endpoint}: {e}")
    
    # Test batch credentialing
    try:
        await test_batch_credentialing()
    except Exception as e:
        print(f"❌ Error testing batch credentialing: {e}")
    
    # Summary
    print(f"\n📋 Test Summary:")
    for result in results:
        print(f"   {result['endpoint']}: {result['requests_per_second']:.2f} req/s, "
              f"{result['avg_response_time']:.3f}s avg response")

if __name__ == "__main__":
    asyncio.run(main()) 