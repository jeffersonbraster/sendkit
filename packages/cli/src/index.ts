import { Command } from 'commander'
import {z} from 'zod'
import {homedir} from 'node:os'
import {dirname, join} from 'node:path'
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {sendTelegramMessage} from 'sendkit-core'

const program = new Command()
const configPath = join(homedir(), ".config", "sendkit", "config.json")
const cliConfigSchema = z.object({
  telegramBotToken: z.string().min(1).optional()
})

function writeTelegramBotToken(token: string) {
  mkdirSync(dirname(configPath), { recursive: true })
  writeFileSync(configPath, `${JSON.stringify({ telegramBotToken: token }, null, 2)}\n`, {
    mode: 0o600
  })
}

function getTelegramBotToken() {
  if(!existsSync(configPath)) {
    throw new Error(`Config file not found at ${configPath}. Please run 'sendkit config telegram <botToken>' to set your Telegram bot token.`)
  }

  const config = cliConfigSchema.parse(JSON.parse(readFileSync(configPath, 'utf-8')))
  const token = config.telegramBotToken

  if(!token) {
    throw new Error(`Telegram bot token not found in config file at ${configPath}. Please run 'sendkit config telegram <botToken>' to set your Telegram bot token.`)
  }

  return token
}

program
  .name('sendkit')
  .description('SendKit CLI backed by JEJE')

program
  .command("init")
  .description("Initialize SendKit CLI configuration")
  .requiredOption("--telegram-bot-token <botToken>", "Telegram bot token")
  .action(async (options: {telegramBotToken: string}) => {
    writeTelegramBotToken(options.telegramBotToken)
    console.log(`Telegram bot token saved to ${configPath}`)
  })

program
  .command('telegram')
  .argument("<chatId>", "Telegram chat ID to send the message to")
  .argument("<message>", "Message to send to the specified chat ID")  
  .action(async (chatId: string, message: string) => {   
      const result = await sendTelegramMessage({
        botToken: getTelegramBotToken(),
        chatId,
        message
      })

      console.log(JSON.stringify(result, null, 2))
  })

  await program.parseAsync(process.argv).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })

  /**
   * Pegar o id do chat do telegram
   * 
   * https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates
   */