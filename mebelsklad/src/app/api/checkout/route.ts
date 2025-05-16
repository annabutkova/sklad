// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// This function will be used to send the order to Telegram in the future
async function sendOrderToTelegram(order: any) {
  // This is a placeholder for the future Telegram integration
  // You'll need to implement this using Telegram Bot API
  console.log('Order would be sent to Telegram:', order);

  // The actual implementation would look something like:
  /*
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error('Telegram configuration missing');
  }
  
  // Format message
  const message = formatOrderForTelegram(order);
  
  // Send to Telegram
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send to Telegram: ${error}`);
  }
  
  return response.json();
  */

  // For now, just return true to simulate success
  return true;
}

// Function to format the order message for Telegram
// function formatOrderForTelegram(order: any) {
//   const { customer, items, subtotal, notes, createdAt } = order;

//   let message = `<b>🛒 NEW ORDER</b>\n\n`;

//   // Add customer information
//   message += `<b>📋 Customer Information:</b>\n`;
//   message += `Name: ${customer.name}\n`;
//   message += `Phone: ${customer.phone}\n`;
//   message += `Address: ${customer.address}\n\n`;

//   // Add order items
//   message += `<b>🛍️ Order Items:</b>\n`;
//   items.forEach((item: any, index: number) => {
//     message += `${index + 1}. ${item.name} (${item.type}) × ${item.quantity}\n`;
//   });

//   // Add order total
//   message += `\n<b>💰 Total Amount:</b> ${subtotal} UZS\n\n`;

//   // Add notes if available
//   if (notes) {
//     message += `<b>📝 Notes:</b> ${notes}\n\n`;
//   }

//   // Add date
//   message += `<b>📅 Order Date:</b> ${new Date(createdAt).toLocaleString()}\n`;

//   return message;
// }

// Save order to a JSON file (temporary storage)
async function saveOrder(order: any) {
  try {
    // Create orders directory if it doesn't exist
    const ordersDir = path.join(process.cwd(), 'data', 'orders');
    await fs.mkdir(ordersDir, { recursive: true });

    // Generate a unique filename based on timestamp and a random string
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `order-${timestamp}-${randomStr}.json`;

    // Save the order to a JSON file
    await fs.writeFile(
      path.join(ordersDir, filename),
      JSON.stringify(order, null, 2)
    );

    return { success: true, filename };
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const order = await request.json();

    // Validate the order data
    if (!order.customer || !order.items || order.items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      );
    }

    // Save the order to a file (temporary storage solution)
    await saveOrder(order);

    // Send the order to Telegram (will be implemented in the future)
    try {
      await sendOrderToTelegram(order);
    } catch (telegramError) {
      console.error('Error sending to Telegram:', telegramError);
      // We'll continue processing even if Telegram fails
    }

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing checkout:', error);
    return NextResponse.json(
      { error: 'Failed to process order' },
      { status: 500 }
    );
  }
}