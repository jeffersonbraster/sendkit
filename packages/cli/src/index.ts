import { Command } from 'commander'
import {sendTelegramMessage} from 'sendkit-core'

const program = new Command()

program
  .name('sendkit')
  .description('CLI tool for sending messages via Telegram Bot API')
  .command('telegram')
  .argument("<chatId>", "Telegram chat ID to send the message to")
  .argument("<message>", "Message to send to the specified chat ID")  
  .action(async (chatId: string, message: string) => {
    const token = process.env.TELEGRAM_BOT_TOKEN

    if(!token) {
      console.error('Error: TELEGRAM_BOT_TOKEN environment variable is not set.')
      process.exit(1)
    }

    if(!chatId) {
      console.error('Error: Chat ID is required.')
      process.exit(1)
    }

    if(!message) {
      console.error('Error: Message is required.')
      process.exit(1)
    }

    try {
      const result = await sendTelegramMessage({
        botToken: token,
        chatId,
        message
      })
      console.log(`Message sent successfully! Chat ID: ${chatId}`)
      if(result.messageId !== undefined) {
        console.log(`Telegram Message ID: ${result.messageId}`)
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      console.error(`Error sending message: ${detail}`)
      process.exit(1)
    }

  })

  program.parseAsync(process.argv)

  /**
   * Pegar o id do chat do telegram
   * 
   * https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates
   */