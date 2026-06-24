import {Hono} from 'hono';
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {WebStandardStreamableHTTPServerTransport} from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { telegramMessageInputSchema, sendTelegramMessage } from 'sendkit-core';

function createServer(botToken: string) {
  const server = new McpServer({
    name: "sendkit-remote",
    version: "1.0.0",
  });

  server.registerTool(
    "telegram",
    {
      title: "Telegram",
      description: "Send messages to a Telegram bot",
      inputSchema: telegramMessageInputSchema.shape
    },
    async (input) => {
      const result = await sendTelegramMessage({
        ...input,
        botToken
      })
  
      return {
        content: [
          {
            type: "text",
            text: `Message sent to Telegram bot with message ID: ${result.messageId} to chat ID: ${result.chatId}`
          }
        ],
        structuredContent: result
      }
    }
  )

  return server;
}

const app = new Hono();

app.post('/:botToken/mcp', async (c) => {
  const botToken = c.req.param('botToken');

  const server = createServer(botToken);

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);

  try {
    return await transport.handleRequest(c.req.raw);
  } finally {
    await server.close()
  }
})

app.notFound((c) => c.json({ error: 'Not Found' }, 404));

const port = Number(process.env.PORT) || 3000;

export default {
  port,
  fetch: app.fetch,
}