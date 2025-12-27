# PropertyHub - Secure Real Estate Marketplace for Nigeria

A comprehensive, secure real estate marketplace connecting buyers, sellers, landlords, and investors with built-in document verification and fraud detection specifically designed for the Nigerian market.

## ✨ Key Features

### 🏠 Property Listings
- Create, edit, and delete property listings
- Support for multiple property types (House, Apartment, Condo, Townhouse, Land)
- Multiple listing types (Buy, Rent, Shortlet)
- Property details including bedrooms, bathrooms, area, amenities
- Featured image and image gallery
- Property status tracking (Available, Sold, Rented)

### 👥 User Roles
- **Buyers/Renters** - Browse properties, submit inquiries, save favorites, invest in properties
- **Sellers/Landlords** - List properties, manage inquiries, accept investments, negotiate with investors
- **Investors** - Make investment proposals using 3 flexible models, negotiate terms, track portfolio
- **Administrators** - Moderate platform, verify documents, detect fraud, manage users

### 📋 Document Verification System
- Added comprehensive verification with 6 document types
- National ID, Title Deed, Proof of Ownership (required)
- Utility Bill, Certificate of Occupancy, Survey Plan (optional)
- Admin approval/rejection with feedback
- Automatic fraud detection for unverified claims

### 💼 Investment System
- Three investment models for maximum flexibility:
  - **Fixed Return** - Investor gets fixed % annual return over specified period
  - **Equity Partnership** - Investor becomes co-owner with % share
  - **Negotiated Terms** - Custom arrangement agreed between parties
- Direct chat-based negotiation with sellers
- Investment proposal tracking (proposed → accepted → active → completed)
- Investor portfolio management
- Secure transaction documentation

### 🛡️ Fraud Detection & Prevention
- Automated detection system triggers on:
  - Multiple rejected documents (HIGH severity)
  - Rapid investment escalation (3+ proposals in 7 days)
  - Unverified investor claims
  - Suspicious keywords in chat (Western Union, crypto, upfront payments)
  - Multiple failed transactions
- Manual admin review and investigation
- Account banning with documented reasons
- Complete audit trail of all admin actions
- Chat monitoring for scam prevention

### 👨‍💼 Admin Dashboard
- Complete moderation platform with:
  - Real-time statistics (users, verifications, fraud alerts)
  - Document verification center
  - User management and banning system
  - Fraud alert monitoring and resolution
  - Investment conversation monitoring
  - Audit logging of all admin actions
  - Investment tracking and oversight

## Features

### Authentication & User Management
- Email/password authentication via Supabase
- User role selection: Buyer, Seller, Investor, or Admin
- User profiles with contact information
- Automatic profile creation on signup

### Buyer Features
- Browse all available properties
- Search properties by city, address, or name
- Filter by listing type and property type
- Save favorite properties to personalized lists
- Submit inquiries and contact requests
- Real-time messaging with sellers
- Track inquiries with status updates

### Seller Features
- Dashboard to manage all listings
- View and respond to property inquiries
- Message directly with interested buyers
- Track inquiry status
- Property performance overview
- Delete or archive listings

### Messaging System
- Direct messaging between buyers and sellers
- Conversation history
- Context-aware messaging linked to properties
- Message timestamps and read status

### Saved Properties
- Bookmark favorite listings
- Organize saved properties
- Quick access from dashboard
- Remove from favorites easily

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Security**: Row Level Security (RLS) policies
- **Document Storage**: Supabase Storage
- **Fraud Detection Algorithms**: Included
- **Investment Management System**: Included
- **Admin Moderation Tools**: Included

## Database Schema

### Tables (Updated)
- `profiles` - User accounts with verification status and admin flags
- `properties` - Property listings
- `messages` - Direct messages between users
- `inquiries` - Property inquiry tracking
- `favorites` - Saved properties
- `documents` - Document verification system
- `investments` - Investment proposals and tracking
- `investor_conversations` - Multi-party investment chats
- `fraud_flags` - Automated fraud detection records
- `admin_logs` - Audit trail of all admin actions

### Security
All tables are protected with Row Level Security policies ensuring:
- Users can only see public property listings
- Users can only modify their own data
- Sellers can manage their own properties
- Messages are private between participants
- Inquiries are visible to relevant parties only

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Environment variables configured

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd rental-property-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
POSTGRES_URL=your_postgres_url
```

4. Run database migrations
Execute the SQL scripts in the `scripts` folder in this order:
- `001_create_tables.sql` - Create all tables and enable RLS
- `002_profile_trigger.sql` - Create the profile auto-creation trigger
- `003_investor_documents_admin.sql` - Required for investor/admin features!

5. Create Supabase storage bucket named "documents"
6. Start the development server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your app.

## Core Pages

- `/` - Home page with property listings
- `/auth/login` - User login
- `/auth/sign-up` - User registration
- `/property/[id]` - Property details page
- `/dashboard` - Seller dashboard
- `/dashboard/new-property` - Create new listing
- `/dashboard/edit-property/[id]` - Edit property
- `/favorites` - Saved properties
- `/messages` - Direct messaging
- `/inquiries` - Contact inquiries sent
- `/listings` - Search results
- `/property/[id]/invest` - Create investment proposal
- `/dashboard/investments` - Investment portfolio
- `/dashboard/investments/[id]/chat` - Investment negotiations
- `/dashboard/documents` - View verification status
- `/dashboard/documents/upload` - Upload documents
- `/admin/dashboard` - Admin overview
- `/admin/documents` - Document verification center
- `/admin/users` - User management and banning
- `/admin/fraud-alerts` - Fraud detection monitoring
- `/admin/chats` - Investment chat review
- `/admin/logs` - Audit trail
- `/admin/investments` - Investment tracking

## API Routes

### Inquiries
- `POST /api/inquiries/submit` - Submit a new inquiry
- `POST /api/inquiries/[id]/reply` - Reply to an inquiry

### Messages
- `GET /api/messages/get-conversation` - Get messages between two users
- `POST /api/messages/send` - Send a message

### Investments (NEW)
- `POST /api/investments/[id]/message` - Send investment chat message
- `GET /api/investments/[id]/message` - Get investment conversation

### Fraud Detection (NEW)
- `POST /api/fraud/detect` - Trigger fraud detection analysis

## Security Features

✓ Row Level Security (RLS) on all 9 tables
✓ Email/password authentication via Supabase Auth
✓ Data encryption at rest
✓ Document upload with file validation (max 5MB)
✓ Secure password hashing (bcrypt)
✓ Session management with automatic logout (24 hours)
✓ HTTP-only secure cookies
✓ SQL injection prevention
✓ Fraud detection system
✓ Account banning capability
✓ Complete audit logging
✓ GDPR & Nigeria NDPR compliant

## Customization

### Colors & Styling
Edit `app/globals.css` to customize the color scheme and design tokens.

### Property Types
Modify the property type options in `components/property-form.tsx` and the database constraints.

### Listing Types
Add or remove listing types in the database schema and form components.

### Amenities
Customize available amenities in the property form.

## Deployment

Deploy to Vercel with all environment variables configured.

For production:
- Update `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` to your domain
- Configure Supabase backups
- Set up error monitoring (optional)
- Enable rate limiting (recommended)

## Future Enhancements

- Payment processing integration (Stripe/Flutterwave)
- SMS and email notifications
- Video verification for high-value investments
- Property inspection workflow
- Insurance products
- Legal document templates
- Mobile app (React Native)
- AI property recommendations
- Property valuation tools
- Advanced analytics and reporting
- Multi-language support

## Support & Resources

For detailed information, see:
- **Getting Help**: Check relevant documentation file above
- **API Questions**: See API_REFERENCE.md
- **Security Questions**: See SECURITY_GUIDE.md
- **Feature Questions**: See FEATURES_SUMMARY.md
- **Setup Issues**: See SETUP_GUIDE.md

## License

This project is open source and available under the MIT License.

---

**PropertyHub - Building trust in Nigerian real estate, one verified transaction at a time** 🏠✨
