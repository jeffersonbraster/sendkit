import { Command } from 'commander'

type TelegramResponse = {
  ok: boolean
  result?: {
    message_id?: number
  }
  description?: string
}

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

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    })

    const data: TelegramResponse = await response.json()

    if(!response.ok || !data.ok) {
      const details = data.description ?? response.statusText
      console.error(`Telegram API request failed: ${details}`)
      process.exit(1)
    }

    const messageId = data.result?.message_id
    console.log(`Message sent successfully! Chat ID: ${chatId}`)

    if(messageId !== undefined) {
      console.log(`Telegram Message ID: ${messageId}`)
    }
  })

  program.parseAsync(process.argv)

  /**
   * Pegar o id do chat do telegram
   * 
   * https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates
   */