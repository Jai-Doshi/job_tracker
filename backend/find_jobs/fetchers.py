import json
import asyncio
from typing import List, Dict, Any
import requests
from bs4 import BeautifulSoup
import uuid

# Provide a standard header to simulate a real browser request
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

async def fetch_remoteok_jobs(query: str) -> List[Dict[str, Any]]:
    """
    Fetches real remote jobs from RemoteOK public RSS/JSON API based on query.
    This acts as our "Open Web Search" representation that actually succeeds.
    """
    def _fetch():
        url = "https://remoteok.com/api"
        # RemoteOK API ignores strict query filtering via URL sometimes, we filter locally
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        return response.json()

    try:
        data = await asyncio.to_thread(_fetch)
        jobs = []
        for item in data:
            # Skip the first element which is a legal banner from RemoteOK API
            if 'legal' in item:
                continue
                
            title = item.get('position', '').lower()
            company = item.get('company', '').lower()
            tags = [t.lower() for t in item.get('tags', [])]
            
            q_lower = query.lower()
            if q_lower in title or q_lower in company or q_lower in tags:
                jobs.append({
                    "id": str(uuid.uuid4()),
                    "title": item.get('position', 'Unknown Role'),
                    "company": item.get('company', 'Unknown Company'),
                    "location": item.get('location', 'Remote'),
                    "platform": "RemoteOK",
                    "apply_url": item.get('apply_url') or item.get('url'),
                    "salary": "Varies" if not item.get('salary_min') else f"${item.get('salary_min')}k - ${item.get('salary_max')}k",
                    "type": "Full-time" # Defaulting for RemoteOK
                })
        return jobs
    except Exception as e:
        print(f"RemoteOK fetch failed: {e}")
        return []

async def fetch_linkedin_mock(query: str, location: str = None) -> List[Dict[str, Any]]:
    """
    Simulates fetching from LinkedIn. 
    Direct scraping without login/keys will be blocked, so we use a mock.
    """
    await asyncio.sleep(1.2) # Simulate network delay
    
    loc = location if location else "Remote"
    return [
        {
            "id": str(uuid.uuid4()),
            "title": f"LinkedIn Search: {query}",
            "company": "LinkedIn Corp",
            "location": loc,
            "platform": "LinkedIn",
            "apply_url": "https://www.linkedin.com/jobs",
            "salary": "$100k - $150k",
            "type": "Full-time"
        },
        {
            "id": str(uuid.uuid4()),
            "title": f"Senior {query} Developer",
            "company": "Tech Innovations via LinkedIn",
            "location": loc,
            "platform": "LinkedIn",
            "apply_url": "https://www.linkedin.com/jobs",
            "salary": "$130k - $180k",
            "type": "Contract"
        }
    ]

async def fetch_indeed_mock(query: str, location: str = None) -> List[Dict[str, Any]]:
    """
    Simulates fetching from Indeed.
    Direct scraping requires Cloudflare bypass, so we mock it.
    """
    await asyncio.sleep(0.8) # Simulate network delay
    
    loc = location if location else "Remote"
    return [
        {
            "id": str(uuid.uuid4()),
            "title": f"Indeed Search: {query}",
            "company": "Indeed Gigs",
            "location": loc,
            "platform": "Indeed",
            "apply_url": "https://www.indeed.com",
            "salary": "$90k - $110k",
            "type": "Full-time"
        }
    ]
