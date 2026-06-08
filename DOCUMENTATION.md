# Dynamic Site Python MCP Server: Comprehensive Guide

## 1. Overview
This is a production-ready Model Context Protocol (MCP) server built with Python 3.11+, FastAPI, and the FastMCP SDK. It allows AI clients (like Cursor or Claude) to interact with any website dynamically over the internet using SSE (Server-Sent Events).

---

## 2. Core Tools
The server exposes the following tools to the AI:

### `fetch_site_metadata`
- **Purpose**: Scrapes a URL for SEO, Title, Description, and Open Graph tags.
- **Input**: `{ "url": "https://example.com" }`
- **Benefit**: Allows the AI to "see" what a website is about instantly.

### `execute_site_action`
- **Purpose**: A scaffolding tool for custom API/Webhook interactions.
- **Input**: `{ "url": "...", "action": "...", "params": {} }`
- **Benefit**: Extensible for form submissions or data queries.

### `get_help`
- **Purpose**: Returns this documentation directly to the AI.

---

## 3. Deployment Guide

### Vercel (Serverless)
1. Push your code to GitHub.
2. Import the project into the [Vercel Dashboard](https://vercel.com).
3. Vercel will automatically detect `vercel.json` and use the `@vercel/python` runtime.
4. **Endpoint**: `https://your-project.vercel.app/mcp/sse`

### Render (Web Service)
1. Create a "Web Service" on [Render](https://render.com).
2. Connect your repository.
3. Use the following:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Endpoint**: `https://your-project.onrender.com/mcp/sse`

### Railway
1. New Project -> Deploy from GitHub.
2. Railway will use the `Dockerfile`.
3. **Endpoint**: `https://your-project.up.railway.app/mcp/sse`

---

## 4. Connecting AI Clients

### Cursor / Claude Desktop (SSE Config)
Add a new MCP server with these settings:
- **Type**: `SSE`
- **Name**: `Python Dynamic MCP`
- **URL**: `https://your-deployed-url.com/mcp/sse`

### Manual JSON Config
```json
{
  "mcpServers": {
    "dynamic-python": {
      "url": "https://your-deployed-url.com/mcp/sse"
    }
  }
}
```

---

## 5. Local Development Commands
| Task | Command |
|---|---|
| Install Deps | `pip install -r requirements.txt` |
| Start Server | `python main.py` |
| Health Check | `curl http://localhost:3000/` |
| SSE Check | `curl http://localhost:3000/mcp/sse` |

---

## 6. Project Structure
- `main.py`: Main logic and tool definitions.
- `requirements.txt`: Python dependencies.
- `vercel.json`: Vercel-specific config.
- `render.yaml`: Render blueprint.
- `Dockerfile`: Containerization.
