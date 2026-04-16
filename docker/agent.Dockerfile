FROM python:3.10-alpine AS builder

WORKDIR /app

RUN apk add --no-cache gcc musl-dev python3-dev

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.10-alpine

WORKDIR /app

RUN apk --no-cache add ca-certificates

COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
