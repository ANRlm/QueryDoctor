# Build stage
FROM python:3.10-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev python3-dev

# Copy requirements
COPY agent/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.10-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk --no-cache add ca-certificates

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY agent/ ./agent/

# Expose port
EXPOSE 8000

# Run
CMD ["uvicorn", "agent.main:app", "--host", "0.0.0.0", "--port", "8000"]
