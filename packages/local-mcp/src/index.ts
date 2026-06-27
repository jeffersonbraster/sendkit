#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { sendTelegramMessage, telegramMessageInputSchema } from "@oiesooujeje/sendkit-core";

const server = new McpServer({
  name: "sendkit-local",
  version: "1.0.0",
});

function getTelegramBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN environment variable is not set");
  }

  return token;
}

server.registerTool(
  "telegram",
  {
    title: "Telegram",
    description: "Send messages to a Telegram bot",
    inputSchema: telegramMessageInputSchema.shape,
  },
  async (input) => {
    const result = await sendTelegramMessage({
      ...input,
      botToken: getTelegramBotToken(),
    });

    return {
      content: [
        {
          type: "text",
          text: `Message sent to Telegram bot with message ID: ${result.messageId} to chat ID: ${result.chatId}`,
        },
      ],
      structuredContent: result,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
