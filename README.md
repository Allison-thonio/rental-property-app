<div align="center">
  <img src="public/icon.svg" alt="PropertyHub Logo" width="120" height="120" />

  # 🏡 PropertyHub
  
  **The Secure Real Estate Marketplace for Nigeria**

  [![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  
  <br />
</div>

PropertyHub is a comprehensive, modern real estate marketplace built to seamlessly connect buyers, renters, sellers, landlords, and investors. Built with a specialized focus on the Nigerian market, it integrates robust fraud detection, complete document verification, and specialized real estate investment systems.

---

## ✨ Why PropertyHub?

PropertyHub isn't just another listing site—it's a complete ecosystem designed to foster trust and transparency in real estate transactions:

- 🛡️ **Built-in Fraud Prevention:** Automated detection of suspicious activities, unverified claims, and common scam patterns.
- 🔐 **Rigorous Verification:** Complete multi-document verification workflow for properties and users.
- 💼 **Innovative Investment Models:** Support for Fixed Returns, Equity Partnerships, and Custom Negotiated terms directly on the platform.
- 💬 **Integrated Communications:** Direct, secure context-aware messaging between all parties.

---

## 🚀 Key Features

### 🏢 For Buyers & Renters
* **Advanced Search:** Find properties using intelligent filtering by location, type, and price.
* **Property Watchlists:** Save and organize favorite properties effortlessly.
* **Direct Connections:** Real-time chat with sellers and tracking of property inquiries.

### 🏠 For Sellers & Landlords
* **Intuitive Dashboards:** Complete overview of active listings, engagement, and messages.
* **Rich Listings:** Support for multi-image galleries, detailed amenities, and dynamic mapping.
* **Investment Opportunities:** Receive and negotiate investment proposals for your properties directly.

### 💰 For Investors
* **Flexible Portfolios:** Engage in fixed-return, equity, or negotiated investment models.
* **Direct Negotiations:** Real-time multi-party chat capabilities to hash out investment terms.
* **Transparent Verification:** Invest with confidence knowing properties and sellers undergo stringent verification.

### ⚙️ For Administrators
* **Moderation Powerhouse:** Robust dashboard for document verification, user management, and detailed audit logging.
* **Proactive Security:** Review automatically flagged conversations and user anomalies to maintain platform integrity.

---

## 🛠️ Tech Stack

PropertyHub is engineered with modern, performant web technologies to ensure a scalable and secure experience:

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Styling:** Tailwind CSS + shadcn/ui
- **Language:** TypeScript

### Backend & Infrastructure
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth (RLS protected)
- **Storage:** Supabase Storage (Encrypted Document Management)
- **Security:** Built-in SQL injection prevention, Row Level Security (RLS) policies

---

## 🚦 Getting Started

### Prerequisites
Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Git](https://git-scm.com/)
* A [Supabase](https://supabase.com/) account for database and authentication

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Allison-thonio/rental-property-app.git
   cd rental-property-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
   ```

4. **Initialize Database:**
   Run the SQL scripts provided in the `scripts/` directory inside your Supabase SQL editor in the following order:
   - `001_create_tables.sql`
   - `002_profile_trigger.sql`
   - `003_investor_documents_admin.sql`

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Fraud Detection

Security is a primary feature of PropertyHub:
- **Strict Row Level Security (RLS):** ensures users only access their own sensitive data.
- **Automated Scam Detection:** The system actively scans chat messages for keywords (e.g., "Western Union", "Upfront payment") and flags them for admin review.
- **Account Health Monitoring:** Multiple failed verifications or suspicious surges in investment proposals automatically trigger restrictions.

---

## 📚 Documentation Reference

For deeper dives into specific components of the platform, check out our internal documentation:
- 📖 [Full Features Summary](FEATURES_SUMMARY.md)
- 🔌 [API Reference](API_REFERENCE.md)
- 🛡️ [Security Guidelines](SECURITY_GUIDE.md)

---

## 🤝 Contributing

We welcome contributions! Please review our contribution guidelines before submitting pull requests. Ensure all code adheres to our TypeScript standard and passes existing ESLint checks.

---

## 📄 License

This project is licensed under the MIT License.

---
<div align="center">
  <b>Built with ❤️ for the Nigerian Real Estate Ecosystem.</b>
</div>
