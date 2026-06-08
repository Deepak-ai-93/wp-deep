import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import axios from "axios";
import * as cheerio from "cheerio";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

/**
 * MCP Server Implementation
 */
const server = new Server(
  {
    name: "dynamic-site-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

/**
 * Tool Definitions
 */
const TOOLS: Tool[] = [
  {
    name: "get_help",
    description: "Returns detailed instructions on how to use this MCP server and its tools.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "fetch_site_metadata",
    description: "Scrapes basic metadata, open-graph tags, and sitemap information from a given URL.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL of the website to scrape.",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "execute_site_action",
    description: "Executes a generic action on a website (placeholder for API/webhook interactions).",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The target URL or API endpoint.",
        },
        action: {
          type: "string",
          description: "The action to perform (e.g., 'submit_form', 'get_data').",
        },
        params: {
          type: "object",
          description: "Dynamic parameters for the action.",
        },
      },
      required: ["url", "action"],
    },
  },
];

const HELP_TEXT = `
# Dynamic Site MCP Server Help

This server allows you to interact with any website dynamically via the internet.

## Available Tools:

1. **fetch_site_metadata**: Provide a 'url' to get SEO and OpenGraph data.
2. **execute_site_action**: Provide a 'url', 'action', and optional 'params' to simulate or trigger interactions.
3. **get_help**: Displays this message.

## How it Works:
- This server uses **SSE (Server-Sent Events)** for remote connectivity.
- It bypasses local network restrictions by being deployed on a public cloud.
- It uses **Cheerio** for HTML parsing and **Axios** for network requests.

## Connection Info:
- **Endpoint**: /sse
- **Auth**: None (Publicly accessible).
`;

/**
 * Resource Handlers
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "mcp://help",
      name: "Help Documentation",
      description: "Instructions and connection guide for this MCP server",
      mimeType: "text/markdown",
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "mcp://help") {
    return {
      contents: [
        {
          uri: "mcp://help",
          mimeType: "text/markdown",
          text: HELP_TEXT,
        },
      ],
    };
  }
  throw new Error(`Resource not found: ${request.params.uri}`);
});

/**
 * Request Handlers
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_help": {
        return {
          content: [
            {
              type: "text",
              text: HELP_TEXT,
            },
          ],
        };
      }
      case "fetch_site_metadata": {
        const { url } = z.object({ url: z.string().url() }).parse(args);
        const response = await axios.get(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
          timeout: 10000,
        });

        const $ = cheerio.load(response.data);
        const metadata = {
          title: $("title").text() || $('meta[property="og:title"]').attr("content"),
          description: $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content"),
          keywords: $('meta[name="keywords"]').attr("content"),
          ogImage: $('meta[property="og:image"]').attr("content"),
          favicon: $('link[rel="icon"]').attr("href") || $('link[rel="shortcut icon"]').attr("href"),
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(metadata, null, 2),
            },
          ],
        };
      }

      case "execute_site_action": {
        const { url, action, params } = z.object({
          url: z.string().url(),
          action: z.string(),
          params: z.record(z.any()).optional(),
        }).parse(args);

        // Scaffolding for dynamic site actions
        // In a real scenario, this might call a webhook or a specific REST API
        const result = {
          status: "success",
          message: `Action '${action}' executed on ${url}`,
          receivedParams: params,
          notice: "This is a scaffolding result. Implement specific logic for your target sites here.",
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Database Scaffolding (Template)
 * Uncomment and configure if you use Supabase/PostgreSQL
 */
/*
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const db = createClient(supabaseUrl, supabaseKey)
*/

// Express Server Setup
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

let transport: SSEServerTransport | null = null;

app.get("/sse", async (req, res) => {
  console.log("New SSE connection established");
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  if (!transport) {
    return res.status(400).json({ error: "SSE connection not established" });
  }
  await transport.handlePostMessage(req, res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP Server running on port ${PORT}`);
  console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`Message endpoint: http://localhost:${PORT}/messages`);
});
