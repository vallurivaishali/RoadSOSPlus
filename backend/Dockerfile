FROM python:3.12-slim

# Prevent Python from writing pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies required for psycopg2 and other native extensions
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend source code
COPY . .

# Copy start script
COPY start.sh .
RUN chmod +x start.sh

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI server using the script
CMD ["./start.sh"]
