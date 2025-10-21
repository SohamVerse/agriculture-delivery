# 🧪 Chatbot Testing Guide

## Prerequisites

1. ✅ Development server running: `npm run dev`
2. ✅ Database seeded with products: `curl -X POST http://localhost:3000/api/seed`
3. ✅ Website knowledge seeded: `curl -X POST http://localhost:3000/api/seed/website-knowledge`
4. ✅ Environment variables configured in `.env.local`

## Test Scenarios

### 1. Product Search

#### Test 1.1: Search by Product Name
```
Input: "Show me tomato seeds"
Expected: 
- Bot responds with tomato seed products
- Product cards displayed with images and prices
- "Add to Cart" button visible on each card
```

#### Test 1.2: Search by Category
```
Input: "I need fertilizers"
Expected:
- Bot shows fertilizer products
- Multiple fertilizer options displayed
- Category name shown on cards
```

#### Test 1.3: Search with Keywords
```
Input: "organic products"
Expected:
- Bot shows organic-labeled products
- Products from multiple categories
```

### 2. Cart Management

#### Test 2.1: Add to Cart via Chat
```
Input: "Add NPK fertilizer to cart"
Expected:
- Bot confirms item added
- Cart badge shows count (1)
- Item appears in cart when clicked
```

#### Test 2.2: Add to Cart via Product Card
```
Action: Click "+" button on product card
Expected:
- Item added to cart
- Cart badge updates
- No page reload
```

#### Test 2.3: View Cart
```
Input: "Show my cart"
Expected:
- Cart sidebar opens
- All items listed with images
- Total amount calculated
- "Proceed to Payment" button visible
```

#### Test 2.4: Remove from Cart
```
Action: Click trash icon in cart
Expected:
- Item removed immediately
- Total amount updates
- Cart badge decrements
```

### 3. Chat History

#### Test 3.1: Create New Chat
```
Action: 
1. Send message "Hello"
2. Click history icon
3. Click "New Chat"

Expected:
- Fresh chat window
- Welcome message displayed
- Previous chat saved in sidebar
```

#### Test 3.2: Load Previous Chat
```
Action:
1. Click history icon
2. Select previous chat from list

Expected:
- Full message history loads
- Cart state restored
- Chat title shown
```

### 4. FAQ & Knowledge

#### Test 4.1: Shipping Policy
```
Input: "What's your shipping policy?"
Expected:
- Bot responds with shipping details
- Mentions 3-7 days delivery
- Free shipping threshold mentioned
```

#### Test 4.2: Return Policy
```
Input: "How can I return a product?"
Expected:
- Bot explains return process
- 7-day return window mentioned
- Conditions specified
```

#### Test 4.3: Payment Methods
```
Input: "What payment methods do you accept?"
Expected:
- List of payment options
- Mentions Razorpay
- COD availability
```

### 5. Payment Flow

#### Test 5.1: Checkout Process
```
Steps:
1. Add products to cart
2. Open cart
3. Click "Proceed to Payment"

Expected:
- Razorpay checkout opens
- Correct amount displayed
- Order details shown
```

#### Test 5.2: Successful Payment (Test Mode)
```
Steps:
1. Use test card: 4111 1111 1111 1111
2. Enter any CVV and future expiry
3. Complete payment

Expected:
- Payment success message in chat
- Cart cleared
- Order ID provided
```

#### Test 5.3: Failed Payment
```
Steps:
1. Close Razorpay modal without paying

Expected:
- No order created
- Cart remains intact
- No error message (graceful handling)
```

### 6. Multi-language Support

#### Test 6.1: Hindi Input
```
Input: "मुझे बीज चाहिए"
Expected:
- Bot responds in Hindi
- Products displayed
- Hindi product names shown (if available)
```

### 7. Intent Detection

#### Test 7.1: General Conversation
```
Input: "Hello, how are you?"
Expected:
- Bot responds conversationally
- Offers help
- No product cards shown
```

#### Test 7.2: Agricultural Advice
```
Input: "How do I grow tomatoes?"
Expected:
- Bot provides farming tips
- Mentions relevant products
- Helpful and informative
```

### 8. Context Awareness

#### Test 8.1: Follow-up Questions
```
Conversation:
User: "Show me seeds"
Bot: [Shows seed products]
User: "What about the organic ones?"
Bot: [Shows organic seeds]

Expected:
- Bot remembers context
- Filters for organic seeds
```

#### Test 8.2: Cart Context
```
Conversation:
User: "Add tomato seeds to cart"
Bot: "Added to cart"
User: "How many items do I have?"
Bot: "You have 1 item in your cart"

Expected:
- Bot aware of cart state
- Accurate count provided
```

## API Testing

### Using cURL

#### Test Chat API
```bash
curl -X POST http://localhost:3000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me tomato seeds",
    "userId": "test_user_123",
    "cart": []
  }'
```

#### Test Sessions API
```bash
curl http://localhost:3000/api/chatbot/sessions?userId=test_user_123
```

#### Test Create Order API
```bash
curl -X POST http://localhost:3000/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "chatId": "test_chat_456",
    "items": [
      {
        "product_id": "product_id_here",
        "name": "Test Product",
        "price": 299,
        "quantity": 1,
        "image_url": "/placeholder.svg"
      }
    ],
    "totalAmount": 299
  }'
```

## Browser Console Testing

Open browser console (F12) and run:

### Test 1: Check Chat State
```javascript
// Open chatbot and send message, then check localStorage
console.log(localStorage.getItem('chatId'))
console.log(localStorage.getItem('userId'))
```

### Test 2: Monitor Network Requests
```javascript
// Watch for API calls
// Network tab → Filter by "chatbot" or "razorpay"
```

### Test 3: Test Razorpay Integration
```javascript
// Check if Razorpay loaded
console.log(typeof window.Razorpay)
// Should log "function"
```

## Performance Testing

### Response Time
```
Expected: < 3 seconds for AI responses
Expected: < 1 second for product searches
Expected: < 500ms for cart operations
```

### Concurrent Users
```bash
# Install Apache Bench
brew install httpd  # macOS

# Test concurrent requests
ab -n 100 -c 10 -p payload.json -T application/json \
  http://localhost:3000/api/chatbot/chat
```

## Error Scenarios

### Test Error 1: Network Failure
```
Action: Disable internet, send message
Expected: 
- Error message displayed
- Chat remains usable
- No crash
```

### Test Error 2: Invalid Product Search
```
Input: "xyz invalid product 123"
Expected:
- Bot responds gracefully
- No products found message
- Suggests alternatives
```

### Test Error 3: Empty Cart Checkout
```
Action: Click "Proceed to Payment" with empty cart
Expected:
- Button disabled
- No Razorpay modal opens
```

## MongoDB Verification

### Check Collections Created
```javascript
// Run in MongoDB Compass or shell
use agridelivery

// Check chat sessions
db.chat_sessions.find().pretty()

// Check orders
db.orders.find().pretty()

// Check website knowledge
db.website_knowledge.find().pretty()
```

### Verify Data Integrity
```javascript
// Check if products have categories
db.products.aggregate([
  {
    $lookup: {
      from: "categories",
      localField: "categoryId",
      foreignField: "_id",
      as: "category"
    }
  },
  { $match: { category: { $size: 0 } } }
])
// Should return empty (all products have categories)
```

## Razorpay Testing

### Test Mode Credentials
```
Key ID: rzp_test_xxxxxxxxxx
Key Secret: xxxxxxxxxxxxxxxx
```

### Test Cards

#### Success Card
- **Number**: 4111 1111 1111 1111
- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **Expected**: Payment succeeds

#### Failure Card
- **Number**: 4000 0000 0000 0002
- **Expected**: Payment fails

## Automated Testing Checklist

- [ ] All products visible
- [ ] Search returns results
- [ ] Cart operations work
- [ ] Chat history persists
- [ ] Payment flow completes
- [ ] FAQ responses accurate
- [ ] No console errors
- [ ] No linter errors
- [ ] MongoDB collections populated
- [ ] Razorpay integration works

## Common Issues & Solutions

### Issue: Bot not responding
**Solution**: 
- Check GEMINI_API_KEY
- Verify MongoDB connection
- Check console for errors

### Issue: Products not showing
**Solution**:
- Run seed script
- Check MongoDB has data
- Verify products have isActive: true

### Issue: Payment failing
**Solution**:
- Use test mode credentials
- Use test card number
- Check Razorpay dashboard

### Issue: Chat history not loading
**Solution**:
- Check userId consistency
- Verify MongoDB connection
- Check chat_sessions collection

## Test Results Template

```
Date: ___________
Tester: ___________

Product Search:        [ PASS / FAIL ]
Cart Management:       [ PASS / FAIL ]
Chat History:          [ PASS / FAIL ]
FAQ Responses:         [ PASS / FAIL ]
Payment Flow:          [ PASS / FAIL ]
Multi-language:        [ PASS / FAIL ]
Context Awareness:     [ PASS / FAIL ]

Notes:
_________________________________
_________________________________
```

## Next Steps After Testing

1. ✅ Fix any identified issues
2. ✅ Document edge cases
3. ✅ Update user documentation
4. ✅ Prepare for production deployment
5. ✅ Set up monitoring and analytics

---

**For more details, see [CHATBOT_SETUP.md](./CHATBOT_SETUP.md)**

