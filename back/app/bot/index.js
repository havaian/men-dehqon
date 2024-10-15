const { Bot, Keyboard } = require('grammy');

// Create a bot using the token from environment variables
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

// Implement main menu
const mainMenuKeyboard = new Keyboard()
  .text("List Product").text("View Listings")
  .row()
  .text("Change Language").text("Help")
  .resized();

bot.command("start", async (ctx) => {
  await ctx.reply("Welcome to Men dehqon! Please choose an option:", {
    reply_markup: mainMenuKeyboard
  });
});

// Handle button clicks
bot.on("message", async (ctx) => {
  const messageText = ctx.message.text;

  switch (messageText) {
    case "List Product":
      const categoryKeyboard = new Keyboard()
        .text("Fruits").text("Vegetables")
        .row()
        .text("Others").text("Back to Main Menu")
        .resized();
      
      await ctx.reply("Please select a category:", {
        reply_markup: categoryKeyboard
      });
      break;

    case "View Listings":
      await ctx.reply("Here's a link to view all listings: [Your website URL]");
      break;

    case "Change Language":
      await ctx.reply("Language options will be implemented soon.");
      break;

    case "Help":
      await ctx.reply("For assistance, please contact: [Your contact information]");
      break;

    case "Back to Main Menu":
      await ctx.reply("Returning to main menu...");
      await ctx.reply("Welcome back to the main menu. Please choose an option:", {
        reply_markup: mainMenuKeyboard
      });
      break;
  }
});

// Start the bot
bot.start();

console.log('✅ BOT');