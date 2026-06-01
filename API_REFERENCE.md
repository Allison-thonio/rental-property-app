# PropertyHub API Reference

## Authentication

All authenticated endpoints require a valid Supabase JWT token in the Authorization header.

**Header:**
```
Authorization: Bearer [jwt_token]
```

User authentication is handled via Supabase Auth. Tokens are automatically set in cookies after login.

## Base URL

Development: `http://localhost:3000/api`
Production: `https://yourdomain.com/api`

## Endpoints

### Favorites Management

#### Toggle Property Favorite
```
POST /api/favorites/toggle
```

**Request Body:**
```json
{
  "property_id": "uuid",
  "action": "add" | "remove"
}
```

**Response (Success):**
```json
{
  "success": true,
  "isFavorite": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "property_id": "uuid",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Response (Error):**
```json
{
  "error": "Failed to toggle favorite"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error

---

### Messages

#### Send Message
```
POST /api/messages/send
```

**Request Body:**
```json
{
  "receiver_id": "uuid",
  "message_text": "Your message here",
  "property_id": "uuid" (optional)
}
```

**Response:**
```json
{
  "id": "uuid",
  "sender_id": "uuid",
  "receiver_id": "uuid",
  "message_text": "Your message here",
  "property_id": "uuid",
  "is_read": false,
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 400: Missing required fields
- 500: Server error

#### Get Conversation
```
GET /api/messages/get-conversation?other_user_id=uuid
```

**Query Parameters:**
- `other_user_id` (required): UUID of the other user

**Response:**
```json
[
  {
    "id": "uuid",
    "sender_id": "uuid",
    "receiver_id": "uuid",
    "message_text": "Message content",
    "is_read": false,
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 400: Missing other_user_id parameter
- 500: Server error

---

### Inquiries

#### Submit Inquiry
```
POST /api/inquiries/submit
```

**Request Body:**
```json
{
  "property_id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "08012345678",
  "message": "I'm interested in this property",
  "inquiry_type": "general" | "viewing_request" | "offer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "property_id": "uuid",
    "sender_id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "08012345678",
    "message": "I'm interested in this property",
    "inquiry_type": "general",
    "status": "new",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Status Codes:**
- 200: Success
- 400: Missing required fields
- 500: Server error

#### Reply to Inquiry
```
POST /api/inquiries/[id]/reply
```

**URL Parameters:**
- `id` (required): Inquiry UUID

**Request Body:**
```json
{
  "reply_message": "Thank you for your interest. I'd be happy to discuss..."
}
```

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 400: Missing reply_message
- 500: Server error

---

### Investments

#### Create Investment Proposal
```
POST /api/investments/create
```

**Request Body:**
```json
{
  "property_id": "uuid",
  "investment_amount": 5000000,
  "investment_type": "fixed_return" | "equity" | "negotiated",
  "expected_return": 15, // Only for fixed_return
  "investment_term_months": 24
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "property_id": "uuid",
    "investor_id": "uuid",
    "seller_id": "uuid",
    "investment_amount": 5000000,
    "investment_type": "fixed_return",
    "expected_return": 15,
    "investment_term_months": 24,
    "status": "proposed",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 400: Missing required fields
- 500: Server error

#### Send Investment Message
```
POST /api/investments/[id]/message
```

**URL Parameters:**
- `id` (required): Investment UUID

**Request Body:**
```json
{
  "message_text": "Let's discuss the investment terms..."
}
```

**Response:**
```json
{
  "id": "uuid",
  "investment_id": "uuid",
  "property_id": "uuid",
  "sender_id": "uuid",
  "message_text": "Let's discuss the investment terms...",
  "is_read": false,
  "flagged_by_admin": false,
  "admin_flag_reason": null,
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Notes:**
- Messages containing suspicious keywords are automatically flagged
- Flagged messages still send but are reviewed by admin
- Possible flag reasons: "Suspicious keywords: western union, money transfer"

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 400: Missing message_text
- 500: Server error

#### Get Investment Conversation
```
GET /api/investments/[id]/message
```

**URL Parameters:**
- `id` (required): Investment UUID

**Response:**
```json
[
  {
    "id": "uuid",
    "investment_id": "uuid",
    "sender_id": "uuid",
    "message_text": "Message content",
    "flagged_by_admin": false,
    "admin_flag_reason": null,
    "sender": {
      "first_name": "John",
      "last_name": "Doe",
      "id": "uuid"
    },
    "created_at": "2025-01-15T10:30:00Z"
  }
]
```

**Status Codes:**
- 200: Success
- 401: Unauthorized
- 500: Server error

---

### Fraud Detection

#### Trigger Fraud Detection
```
POST /api/fraud/detect
```

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "flags": [
    "multiple_rejected_docs",
    "rapid_escalation"
  ],
  "count": 2
}
```

**Available Flags:**
- `multiple_rejected_docs` - User has 2+ rejected documents
- `rapid_escalation` - 3+ investment proposals in 7 days
- `unverified_claims` - Investor with 0 documents
- `payment_anomaly` - Multiple failed transactions
- `fake_identity` - Document verification failed

**Status Codes:**
- 200: Success
- 401: Unauthorized (must be admin)
- 500: Server error

---

### Properties (Database Only - No Custom API)

Properties are managed directly via Supabase queries, but here's the schema:

**Create Property:**
```sql
INSERT INTO properties (
  seller_id,
  title,
  description,
  address,
  city,
  state,
  postal_code,
  price,
  property_type,
  listing_type,
  bedrooms,
  bathrooms,
  area_sqft,
  amenities,
  images,
  featured_image,
  status
) VALUES (...)
```

**Property Fields:**
- `id` (uuid) - Auto-generated
- `seller_id` (uuid) - Who listed it
- `title` (text) - Property name
- `description` (text) - Full description
- `address` (text) - Street address
- `city` (text) - City name
- `state` (text) - State name
- `postal_code` (text) - ZIP code
- `price` (decimal) - In Naira
- `property_type` (enum) - house|apartment|condo|townhouse|land
- `listing_type` (enum) - rent|buy|shortlet
- `bedrooms` (integer)
- `bathrooms` (decimal)
- `area_sqft` (integer)
- `amenities` (array) - List of amenities
- `images` (array) - Image URLs
- `featured_image` (text) - Main image URL
- `status` (enum) - available|sold|rented
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

### Documents (Database Only)

**Upload Document via UI:**
File is uploaded to Supabase Storage, then:
```sql
INSERT INTO documents (
  user_id,
  document_type,
  document_url,
  verification_status
) VALUES (...)
```

**Document Fields:**
- `id` (uuid)
- `user_id` (uuid)
- `property_id` (uuid) - Optional
- `document_type` (enum) - national_id|title_deed|proof_of_ownership|utility_bill|certificate_of_occupancy|survey_plan
- `document_url` (text) - Storage URL
- `verification_status` (enum) - pending|approved|rejected
- `admin_notes` (text) - Feedback if rejected
- `verified_by` (uuid) - Admin who verified
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Errors

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Missing required fields | Incomplete request body |
| 401 | Unauthorized | No valid auth token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not found | Resource doesn't exist |
| 500 | Internal server error | Server-side issue |

---

## Rate Limiting

Current limits (per user):
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users
- File uploads: Max 5MB per file

---

## Data Types

### UUID Format
All IDs are UUIDs: `550e8400-e29b-41d4-a716-446655440000`

### Timestamps
All timestamps are ISO 8601 format: `2025-01-15T10:30:00Z`

### Currency
All monetary values in Nigerian Naira (₦), stored as DECIMAL(12,2)

### Enums

**User Types:**
- `buyer`
- `seller`
- `investor`
- `both`

**Property Types:**
- `house`
- `apartment`
- `condo`
- `townhouse`
- `land`

**Listing Types:**
- `buy`
- `rent`
- `shortlet`

**Property Status:**
- `available`
- `sold`
- `rented`

**Verification Status:**
- `unverified`
- `pending`
- `verified`
- `rejected`

**Inquiry Types:**
- `general`
- `viewing_request`
- `offer`

**Investment Types:**
- `fixed_return`
- `equity`
- `negotiated`

**Investment Status:**
- `proposed`
- `accepted`
- `active`
- `completed`

---

## Testing the API

### Using cURL

**Example: Send message**
```bash
curl -X POST http://localhost:3000/api/messages/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "receiver_id": "550e8400-e29b-41d4-a716-446655440000",
    "message_text": "Hello!",
    "property_id": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

### Using Postman

1. Set Authorization header with Bearer token
2. Set Content-Type to application/json
3. Use the request examples above

### Using fetch (JavaScript)

```javascript
const response = await fetch('/api/messages/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    receiver_id: 'uuid-here',
    message_text: 'Hello!',
  }),
});

const data = await response.json();
```

---

## WebSockets / Real-time

Currently using polling with client-side refresh. For real-time features:

1. Use Supabase Realtime subscriptions directly
2. Example:
```typescript
const subscription = supabase
  .from('messages')
  .on('*', payload => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

---

## Webhooks

Future enhancement. Currently, all data is pulled via API endpoints.

---

## SDK Usage

### Client-side (Browser)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Get user
const { data: { user } } = await supabase.auth.getUser()

// Query data
const { data, error } = await supabase
  .from('properties')
  .select('*')
  .eq('city', 'Lagos')
```

### Server-side (Next.js)
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()

const { data, error } = await supabase
  .from('properties')
  .select('*')
```

---

## Version History

**v1.0 (Current)**
- All endpoints listed above
- Authentication via Supabase
- Real-time ready (polling only)
- Fraud detection active
- Admin moderation functional

---

## Support

For API issues:
1. Check error message and status code
2. Verify authentication token is valid
3. Check request body for missing fields
4. Review this documentation
5. Check Supabase logs for details

Last updated: December 2025
