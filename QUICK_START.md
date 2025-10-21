# 🚀 Quick Start Guide - Intelligent Chatbot

Get the chatbot running in 5 minutes!

## Step 1: Environment Variables (2 min)

Create `.env.local` file in the root directory:

```bash
# Required for chatbot to work
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb+srv://username:password@agri-delivery-cluster.xxxxx.mongodb.net/agridelivery

# Required for payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Required for auth
JWT_SECRET=any_random_string_min_32_chars
```

### Where to get API keys:

1. **Gemini API Key**: https://makersuite.google.com/app/apikey
2. **MongoDB**: https://cloud.mongodb.com/ (Use cluster: agri-delivery-cluster)
3. **Razorpay**: https://dashboard.razorpay.com/app/keys (Use test mode)

## Step 2: Start Development Server (1 min)

```bash
npm run dev
```

Server should start at `http://localhost:3000`

## Step 3: Seed Database (1 min)

In a new terminal:

```bash
# Seed products, categories, and users
curl -X POST http://localhost:3000/api/seed

# Seed website knowledge (FAQ, policies)
curl -X POST http://localhost:3000/api/seed/website-knowledge
```

Expected output:
```json
{"message":"Database seeded successfully!","data":{"categories":4,"products":6,"users":2}}
{"message":"Website knowledge seeded successfully!","count":8}
```

## Step 4: Test the Chatbot (1 min)

1. Open `http://localhost:3000` in your browser
2. Click the green chatbot icon in the bottom-right corner
3. Try these messages:

```
👤 "Show me tomato seeds"
👤 "Add NPK fertilizer to cart"
👤 "What's your shipping policy?"
```

## That's it! 🎉

Your intelligent chatbot is now running with:
- ✅ Product search
- ✅ Shopping cart
- ✅ Payment integration
- ✅ Chat history
- ✅ FAQ support

## Test Payment (Optional)

1. Add products to cart
2. Click cart icon → "Proceed to Payment"
3. Use test card: **4111 1111 1111 1111**
4. CVV: Any 3 digits
5. Expiry: Any future date
6. Complete payment

## Need Help?

- **Chatbot not responding**: Check GEMINI_API_KEY in `.env.local`
- **No products showing**: Run seed script again
- **Payment failing**: Verify Razorpay keys are correct

## Next Steps

- Read [README_CHATBOT.md](./README_CHATBOT.md) for full documentation
- See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for testing scenarios
- Check [CHATBOT_SETUP.md](./CHATBOT_SETUP.md) for detailed setup

## Quick Commands Reference

```bash
# Start server
npm run dev

# Seed products
curl -X POST http://localhost:3000/api/seed

# Seed knowledge base
curl -X POST http://localhost:3000/api/seed/website-knowledge

# Test chat API
curl -X POST http://localhost:3000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","userId":"test_user"}'
```

---

**Happy Coding! 🌾🤖**

