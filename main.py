import os
import json
import httpx
import uvicorn
from bs4 import BeautifulSoup
from mcp.server.fastmcp import FastMCP
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

# Initialize FastMCP - the high-level Python SDK
mcp = FastMCP("Dynamic Site Python MCP")

HELP_TEXT = """
# Dynamic Site Python MCP Server Help

This server allows you to interact with any website dynamically via Python.

## Available Tools:
1. **fetch_site_metadata**: Get SEO and OpenGraph data from a URL.
2. **execute_site_action**: Simulate or trigger interactions (Scaffolding).
3. **get_help**: Displays this message.

## How it Works:
- Built with **Python** and **FastMCP**.
- Uses **HTTPX** for async network requests and **BeautifulSoup4** for parsing.
- Exposes **SSE** transport for remote AI clients.

## Connection Info:
- **Endpoint**: /mcp/sse
- **Auth**: None (Public).
"""

@mcp.tool()
async def get_help() -> str:
    """Returns detailed instructions on how to use this MCP server."""
    return HELP_TEXT

@mcp.tool()
async def fetch_site_metadata(url: str) -> str:
    """Scrapes metadata and OG tags from a given URL.
    
    Args:
        url: The full URL (including http/https) of the website to scrape.
    """
    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
            response = await client.get(
                url, 
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"}
            )
            response.raise_for_status()
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        metadata = {
            "title": soup.title.string if soup.title else (soup.find("meta", property="og:title") or {}).get("content"),
            "description": (soup.find("meta", attrs={"name": "description"}) or {}).get("content") or (soup.find("meta", property="og:description") or {}).get("content"),
            "og_image": (soup.find("meta", property="og:image") or {}).get("content"),
            "favicon": (soup.find("link", rel="icon") or {}).get("href")
        }
        
        return json.dumps(metadata, indent=2)
    except Exception as e:
        return f"Error fetching metadata: {str(e)}"

@mcp.tool()
async def execute_site_action(url: str, action: str, params: dict = None) -> str:
    """Executes a generic action on a website (Scaffolding).
    
    Args:
        url: The target URL.
        action: The action to perform (e.g., 'submit', 'query').
        params: Optional dictionary of parameters for the action.
    """
    result = {
        "status": "success",
        "message": f"Python action '{action}' executed on {url}",
        "received_params": params or {},
        "note": "Python-based scaffolding implementation via FastMCP."
    }
    return json.dumps(result, indent=2)

@mcp.resource("mcp://help")
def help_resource() -> str:
    """Markdown help documentation for this Python MCP server."""
    return HELP_TEXT

# Create a FastAPI app and mount the MCP SSE app
# Exporting as 'app' for Vercel and Render compatibility
app = FastAPI(title="Python MCP SSE Server")
app.mount("/mcp", mcp.sse_app())

@app.get("/")
async def root():
    return {"status": "ok", "message": "Python MCP Server is running. Use /mcp/sse for connection."}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True if os.getenv("ENV") == "dev" else False)
