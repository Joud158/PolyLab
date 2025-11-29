FROM python:3.11-slim

WORKDIR /app

# Copy requirements.txt from Backend folder
COPY Backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend code
COPY Backend /app/Backend

# Copy services folder
COPY services /app/services

# Create uploads folder
RUN mkdir -p /app/uploads

EXPOSE 8000

COPY Backend/start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
