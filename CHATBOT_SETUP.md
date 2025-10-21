# AgriDeliver Intelligent Chatbot Setup Guide

## Overview

This is a full-fledged intelligent eCommerce chatbot system built with:
- **LangChain** - For conversational AI and document processing
- **LangGraph** - For multi-node conversation flow and intent routing
- **Google Gemini AI** - For natural language understanding
- **MongoDB** - For data storage and chat history
- **Razorpay** - For secure payment processing

## Features

✅ **Website Knowledge Integration** - Chatbot knows about policies, FAQs, and products  
✅ **Product Search & Discovery** - Search products by name, category, or keyword  
✅ **In-Chat Shopping Cart** - Add/remove items directly from chatbot  
✅ **Secure Payments** - Razorpay integration for checkout  
✅ **Chat History** - Persistent conversations with sidebar navigation  
✅ **Context Awareness** - Remembers previous conversations  
✅ **Rich UI** - Product cards, cart management, payment integration  
✅ **Multi-language Support** - English and Hindi  

## Architecture

### LangGraph Flow

```
User Input → Intent Detection → Route Decision
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
            Fetch Products    Fetch Knowledge   Handle Cart
                    ↓               ↓               ↓
                    └───────────────┼───────────────┘
                                    ↓
                            Generate Response
                                    ↓
                              Update Memory
```

### Intent Types

1. **search_product** - Product search and browsing
2. **add_to_cart** - Add items to cart
3. **remove_from_cart** - Remove items from cart
4. **view_cart** - View cart contents
5. **checkout** - Initiate payment
6. **faq** - Website info, policies, shipping
7. **order_status** - Check order status
8. **general** - General conversation and advice

## Setup Instructions

### 1. Install Dependencies

Already installed:
```bash
npm install @langchain/google-genai @langchain/core @langchain/community langchain @langchain/langgraph razorpay socket.io socket.io-client faiss-node uuid --legacy-peer-deps
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `MONGODB_URI` - MongoDB Atlas connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `JWT_SECRET` - Secret for JWT tokens
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay secret key

### 3. MongoDB Setup

#### 3.1 Create Collections

The following collections are used:
- `users` - User accounts
- `products` - Product catalog
- `categories` - Product categories
- `orders` - Order records
- `cart` - Shopping cart items
- `chat_sessions` - Chat history and context
- `website_knowledge` - FAQ and policy data

#### 3.2 Seed Database

Run these commands in order:

```bash
# Seed products, categories, and users
curl -X POST http://localhost:3000/api/seed

# Seed website knowledge (FAQ, policies)
curl -X POST http://localhost:3000/api/seed/website-knowledge
```

### 4. Razorpay Setup

1. Sign up at [Razorpay](https://razorpay.com/)
2. Go to Dashboard → Settings → API Keys
3. Generate Test/Live keys
4. Add keys to `.env.local`

**Test Card Details:**
- Card Number: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

## API Endpoints

### Chatbot Endpoints

- `POST /api/chatbot/chat` - Send message to chatbot
- `GET /api/chatbot/sessions?userId=xxx` - Get all chat sessions
- `GET /api/chatbot/session/[chatId]?userId=xxx` - Get specific chat session

### Razorpay Endpoints

- `POST /api/razorpay/create-order` - Create payment order
- `POST /api/razorpay/verify-payment` - Verify payment signature

## File Structure

```
lib/
├── types/
│   └── chatbot.ts              # TypeScript interfaces
├── langchain/
│   ├── memory.ts               # MongoDB chat memory
│   ├── retriever.ts            # Product & knowledge retrieval
│   ├── intent-detector.ts      # Intent classification
│   └── langgraph-flow.ts       # LangGraph workflow
├── razorpay.ts                 # Razorpay integration
├── mongodb.ts                  # MongoDB connection
└── gemini.ts                   # Gemini AI setup

app/api/
├── chatbot/
│   ├── chat/route.ts           # Main chat endpoint
│   ├── sessions/route.ts       # List sessions
│   └── session/[chatId]/route.ts # Get session
├── razorpay/
│   ├── create-order/route.ts   # Create order
│   └── verify-payment/route.ts # Verify payment
└── seed/
    └── website-knowledge/route.ts # Seed FAQ data

components/chatbot/
└── enhanced-chatbot.tsx        # Main chatbot UI component
```

## Usage Examples

### Search Products
```
User: "Show me organic tomato seeds"
Bot: [Displays product cards with prices and add to cart buttons]
```

### Add to Cart
```
User: "Add 2 packets of NPK fertilizer to cart"
Bot: "Added 2 packets of NPK Fertilizer to your cart! Your cart now has 2 items."
```

### View Cart
```
User: "Show my cart"
Bot: [Opens cart sidebar with all items and total]
```

### Checkout
```
User: "I want to checkout"
Bot: [Click cart icon → Proceed to Payment → Razorpay checkout opens]
```

### FAQ
```
User: "What's your return policy?"
Bot: "We accept returns within 7 days of delivery for defective or damaged products..."
```

## MongoDB Collections Schema

### chat_sessions
```json
{
  "_id": ObjectId,
  "user_id": "guest_123",
  "chat_id": "uuid",
  "title": "Chat title",
  "messages": [
    {
      "role": "user|assistant",
      "content": "message text",
      "timestamp": Date
    }
  ],
  "cart": [
    {
      "product_id": "product_id",
      "name": "Product Name",
      "price": 299,
      "quantity": 2,
      "image_url": "url"
    }
  ],
  "createdAt": Date,
  "updatedAt": Date
}
```

### orders
```json
{
  "_id": ObjectId,
  "user_id": "guest_123",
  "chat_id": "uuid",
  "items": [...],
  "total_amount": 598,
  "payment_status": "pending|paid|failed",
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature",
  "timestamp": Date
}
```

### website_knowledge
```json
{
  "_id": ObjectId,
  "page": "about|shipping|returns",
  "title": "Page Title",
  "content": "Page content text",
  "createdAt": Date
}
```

## Key Components

### LangGraph Workflow

The chatbot uses a state graph with these nodes:

1. **process_input** - Detects user intent
2. **fetch_products** - Retrieves product data
3. **fetch_knowledge** - Retrieves FAQ/policy data
4. **handle_cart** - Manages cart operations
5. **generate_response** - Creates AI response

### Memory System

- **Short-term**: LangChain `ConversationBufferMemory`
- **Long-term**: MongoDB `chat_sessions` collection
- **Context**: Last 5 messages passed to AI

### Payment Flow

1. User clicks "Proceed to Payment"
2. Frontend calls `/api/razorpay/create-order`
3. Backend creates Razorpay order
4. Razorpay checkout widget opens
5. User completes payment
6. Frontend calls `/api/razorpay/verify-payment`
7. Backend verifies signature and updates order
8. Stock quantities updated

## Customization

### Add New Intents

Edit `lib/langchain/intent-detector.ts`:
```typescript
export type Intent = 
  | "search_product"
  | "your_new_intent" // Add here
```

### Add New Knowledge

Add to database:
```bash
curl -X POST http://localhost:3000/api/seed/website-knowledge
```

Or manually via MongoDB:
```javascript
db.website_knowledge.insertOne({
  page: "custom_page",
  title: "Title",
  content: "Content",
  createdAt: new Date()
})
```

### Modify AI Behavior

Edit system prompt in `lib/langchain/langgraph-flow.ts` → `generateResponse` function

## Troubleshooting

### Chatbot not responding
- Check `GEMINI_API_KEY` is set correctly
- Verify MongoDB connection
- Check browser console for errors

### Payment failing
- Ensure Razorpay keys are correct
- Use test card details in test mode
- Check Razorpay dashboard for logs

### Products not showing
- Run seed script: `curl -X POST http://localhost:3000/api/seed`
- Verify MongoDB connection
- Check products collection has data

### Chat history not loading
- Verify `chat_sessions` collection exists
- Check userId is being passed correctly
- Ensure MongoDB connection is active

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use Razorpay live keys
- [ ] Hash passwords with bcrypt
- [ ] Add rate limiting
- [ ] Enable CORS properly
- [ ] Add user authentication
- [ ] Set up MongoDB indexes
- [ ] Add error tracking (Sentry)
- [ ] Configure CDN for images
- [ ] Add analytics

## Support

For issues or questions:
- Check MongoDB Atlas logs
- Check Razorpay dashboard
- Review browser console
- Check Next.js server logs

## License

MIT

