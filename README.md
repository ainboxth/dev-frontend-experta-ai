# Experta Project V2
## Production Deployment 
```bash
docker run -p 3000:3000 \
  -e REPLICATE_API_TOKEN=your_replicate_token \
  -e FAL_KEY=your_fal_key \
  -e OPENAI_API_KEY=your_openai_key \
  Experta
```