import asyncio
from typing import List, Dict, Any
from .fetchers import fetch_remoteok_jobs, fetch_indeed_mock, fetch_linkedin_mock

async def aggregate_jobs(query: str, location: str = None, remote_only: bool = False) -> List[Dict[str, Any]]:
    """
    Orchestrates pulling from different platforms asynchronously and unifies the results.
    """
    
    # We run the fetchers concurrently to save time.
    # Note: Indeed and LinkedIn are mocked/lightweight to avoid immediate blocking,
    # while RemoteOK is a public feed example to show a real network request.
    
    tasks = [
        fetch_remoteok_jobs(query),
        fetch_linkedin_mock(query, location),
        fetch_indeed_mock(query, location),
    ]
    
    results_lists = await asyncio.gather(*tasks, return_exceptions=True)
    
    unified_results = []
    
    for i, res in enumerate(results_lists):
        if isinstance(res, Exception):
            print(f"Error in fetcher index {i}: {res}")
            continue
            
        if res:
            unified_results.extend(res)
            
    # Sort or format unified_results if needed (e.g. prioritize newest)
    # Right now, we'll just return them as they are appended.
    return unified_results
