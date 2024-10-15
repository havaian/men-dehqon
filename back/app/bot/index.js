const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Implement main menu
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to Men dehqon! Please choose an option:', {
    reply_markup: {
      keyboard: [
        ['List Product', 'View Listings'],
        ['Change Language', 'Help']
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });
});

// Handle button clicks
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  
  switch(msg.text) {
    case 'List Product':
      bot.sendMessage(chatId, 'Please select a category:', {
        reply_markup: {
          keyboard: [
            ['Fruits', 'Vegetables'],
            ['Others', 'Back to Main Menu']
          ],
          resize_keyboard: true,
          one_time_keyboard: false
        }
      });
      break;
    case 'View Listings':
      bot.sendMessage(chatId, 'Here\'s a link to view all listings: [Your website URL]');
      break;
    case 'Change Language':
      bot.sendMessage(chatId, 'Language options will be implemented soon.');
      break;
    case 'Help':
      bot.sendMessage(chatId, 'For assistance, please contact: [Your contact information]');
      break;
    case 'Back to Main Menu':
      bot.sendMessage(chatId, 'Returning to main menu...').then(() => {
        bot.emit('text', {text: '/start', chat: {id: chatId}});
      });
      break;
  }
});

console.log('✅ BOT');