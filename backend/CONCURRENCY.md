# Concurrent Request Processing

This FastAPI application is optimized for handling multiple simultaneous requests efficiently. Here's how it works and how to configure it.

## 🚀 How It Works

### 1. **Async/Await Architecture**
- All endpoints use `async def` for non-blocking I/O operations
- FastAPI runs on ASGI (Asynchronous Server Gateway Interface)
- Multiple requests can be processed concurrently without blocking each other

### 2. **Multi-Worker Process Model**
- Uses multiple worker processes (default: CPU count)
- Each worker can handle multiple concurrent requests
- Automatic worker restart after processing limit reached

### 3. **Concurrency Controls**
- **Rate Limiting**: Prevents overwhelming the system
- **Semaphores**: Control access to limited resources (LLM API, file I/O)
- **Connection Limits**: Prevent too many simultaneous connections

## 📊 Configuration

### Environment Variables

```bash
# Worker processes (default: CPU count)
export WORKERS=4

# Maximum concurrent connections per worker
export MAX_CONCURRENT_CONNECTIONS=1000

# Maximum requests per worker before restart
export MAX_REQUESTS_PER_WORKER=1000

# Rate limiting (requests per minute per client)
export RATE_LIMIT_REQUESTS_PER_MINUTE=200

# Batch processing concurrency
export MAX_CONCURRENT_BATCH_REQUESTS=10

# LLM API concurrency
export MAX_CONCURRENT_LLM_REQUESTS=5

# File I/O concurrency
export MAX_CONCURRENT_FILE_OPERATIONS=50
```

### Default Configuration

```python
# From config/concurrency.py
WORKERS = CPU count
MAX_CONCURRENT_CONNECTIONS = 1000
RATE_LIMIT_REQUESTS_PER_MINUTE = 200
MAX_CONCURRENT_BATCH_REQUESTS = 10
MAX_CONCURRENT_LLM_REQUESTS = 5
```

## 🔧 Running with Concurrency

### Development
```bash
python main.py
```

### Production (Recommended)
```bash
# Using uvicorn directly with optimized settings
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4 --limit-concurrency 1000
```

### Using Gunicorn (Alternative)
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 📈 Performance Monitoring

### Health Check Endpoints

1. **Basic Health**: `GET /health`
2. **Concurrency Health**: `GET /health/concurrency`

The concurrency health endpoint provides:
- Active async tasks
- Semaphore utilization (LLM, File I/O)
- System metrics (CPU, Memory)
- Current configuration

### Example Response
```json
{
  "status": "healthy",
  "concurrency": {
    "active_tasks": 15,
    "llm_semaphore": {
      "available": 3,
      "total": 5,
      "utilization": "40.0%"
    },
    "file_semaphore": {
      "available": 45,
      "total": 50,
      "utilization": "10.0%"
    }
  },
  "system": {
    "cpu_percent": 25.5,
    "memory_percent": 45.2,
    "memory_available_gb": 8.5
  }
}
```

## 🧪 Testing Concurrency

### Run the Test Script
```bash
# Install test dependencies
pip install -r requirements_concurrency.txt

# Run concurrency tests
python test_concurrency.py
```

### Manual Testing with curl
```bash
# Test multiple concurrent requests
for i in {1..10}; do
  curl -s "http://localhost:8000/health" &
done
wait

# Test batch credentialing
curl -X POST "http://localhost:8000/batch-credential" \
  -H "Content-Type: application/json" \
  -d '{"provider_ids": ["provider_001", "provider_002", "provider_003"]}'
```

## 🎯 Concurrent Endpoints

### High Concurrency Endpoints
- `GET /health` - Basic health check
- `GET /health/concurrency` - Concurrency monitoring
- `GET /providers` - Provider listing

### Medium Concurrency Endpoints
- `GET /stats/*` - Statistics endpoints
- `GET /results/*` - Credentialing results
- `GET /logs/*` - Logging endpoints

### Controlled Concurrency Endpoints
- `POST /credential/{provider_id}` - Individual credentialing
- `POST /batch-credential` - Batch credentialing (max 10 concurrent)
- `POST /chat` - Chat interface (LLM semaphore controlled)

## 🔒 Rate Limiting

### How It Works
- Per-client IP rate limiting
- Configurable requests per minute
- Automatic cleanup of old requests
- 429 status code when limit exceeded

### Example Rate Limit Response
```json
{
  "detail": "Too many requests. Please try again later."
}
```

## 🚨 Best Practices

### 1. **Resource Management**
- Use semaphores for limited resources (LLM API, database connections)
- Implement proper error handling for concurrent operations
- Monitor resource utilization

### 2. **Database Operations**
- Use connection pooling for database operations
- Implement retry logic for transient failures
- Consider read replicas for high-read workloads

### 3. **External API Calls**
- Implement circuit breakers for external services
- Use timeouts to prevent hanging requests
- Cache responses when appropriate

### 4. **Monitoring**
- Monitor active task count
- Track response times and throughput
- Set up alerts for high resource utilization

## 🔧 Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Reduce `MAX_CONCURRENT_CONNECTIONS`
   - Lower `MAX_REQUESTS_PER_WORKER`
   - Monitor for memory leaks

2. **Slow Response Times**
   - Check LLM API rate limits
   - Monitor database connection pool
   - Review external service dependencies

3. **Rate Limit Errors**
   - Increase `RATE_LIMIT_REQUESTS_PER_MINUTE`
   - Implement client-side retry logic
   - Consider using multiple client IPs

### Performance Tuning

```bash
# Monitor system resources
htop
iotop
netstat -tulpn | grep :8000

# Check application logs
tail -f logs/app.log

# Monitor concurrency health
curl http://localhost:8000/health/concurrency
```

## 📊 Expected Performance

### Typical Performance Metrics
- **Requests per second**: 100-500 (depending on endpoint complexity)
- **Concurrent connections**: 1000+ per worker
- **Response time**: 50-200ms for simple endpoints
- **Memory usage**: 100-500MB per worker

### Scaling Considerations
- Horizontal scaling: Add more workers/servers
- Vertical scaling: Increase CPU/memory
- Load balancing: Use nginx or similar
- Database scaling: Read replicas, connection pooling 