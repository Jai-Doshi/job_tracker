FROM python:3.10-slim

# Create user with UID 1000 (standard for Hugging Face Spaces to avoid permission issues)
RUN useradd -m -u 1000 user
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Ensure the app files are owned by the non-root user
RUN chown -R user:user /app

# Switch to non-root user
USER user

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Run the app using gunicorn on port 7860
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "app:app"]
