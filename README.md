# Dynamic Site Python MCP Server

A robust, production-ready Model Context Protocol (MCP) server built with **Python**, **FastAPI**, and **BeautifulSoup4**.

## Features

- **Language:** Python 3.11+
- **Transport:** HTTP with SSE (FastAPI implementation).
- **Tools:** `fetch_site_metadata`, `execute_site_action`, `get_help`.
- **Resources:** `mcp://help` documentation.
- **Dockerized:** Optimized multi-stage build.

## Deployment

### 1. Vercel (Serverless)
1. Install [Vercel CLI](https://vercel.com/download) or connect your GitHub.
2. The `vercel.json` is already configured to use the `@vercel/python` runtime.
3. Deploy: `vercel --prod`.
4. Your MCP endpoint will be `https://your-project.vercel.app/mcp/sse`.

### 2. Render (Web Service)
1. Create a new **Web Service** on Render.
2. Connect your GitHub repository.
3. Render will automatically detect the `render.yaml` blueprint or use:
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Your MCP endpoint will be `https://your-project.onrender.com/mcp/sse`.

### 3. Railway
...

### 2. Local Installation

```bash
pip install -r requirements.txt
python main.py
```

## AI Client Configuration (SSE)

- **URL:** `https://your-app.railway.app/sse`
- **Method:** `GET` (for SSE) / `POST` (for messages)

### 1. Railway / Render Deployment

1. Fork or push this repository to your GitHub.
2. Connect your repository to **Railway** or **Render**.
3. Set the following Environment Variables:
   - `PORT`: `3000` (automatically handled by most providers).
   - `MCP_AUTH_TOKEN`: A secure random string (e.g., `your-secret-token`).
   - `DATABASE_URL`: (Optional) For database connectivity.
4. Deploy the service.

### 2. Manual Deployment (Node.js)

```bash
npm install
npm run build
MCP_AUTH_TOKEN=your-secret-token npm start
```

## Connecting to AI Clients

### 1. Cursor / Claude Desktop (SSE UI)

Add a new MCP server with type `SSE`:

- **Name:** Dynamic Site MCP
- **URL:** `https://your-deployed-app.vercel.app/mcp/sse`

### 2. Gemini CLI

To use this server with **Gemini CLI**, add it to your configuration:

```bash
gemini config add-mcp dynamic-site https://your-deployed-app.vercel.app/mcp/sse
```

### 3. Claude Code

For **Claude Code**, you can connect via the SSE URL during the login or config phase:

```bash
claude config mcp add dynamic-site https://your-deployed-app.vercel.app/mcp/sse
```

### 4. Manual Configuration (claude_desktop_config.json)
...

```json
{
  "mcpServers": {
    "dynamic-site-mcp": {
      "url": "https://your-deployed-app.railway.app/sse",
      "headers": {
        "Authorization": "Bearer your-secret-token"
      }
    }
  }
}
```

## Tools

### `fetch_site_metadata`
- **Arguments:** `{ "url": "https://example.com" }`
- **Returns:** Metadata like title, description, and Open Graph tags.

### `execute_site_action`
- **Arguments:** `{ "url": "https://api.example.com", "action": "get_data", "params": {} }`
- **Returns:** Scaffolding result for custom integrations.

## Database Integration
The server includes a template for database connectivity in `src/index.ts`. You can uncomment and configure Supabase or any PostgreSQL provider using the `DATABASE_URL` environment variable.
