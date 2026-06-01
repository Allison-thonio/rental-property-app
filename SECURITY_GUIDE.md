# PropertyHub Security & Compliance Guide

## Overview

PropertyHub implements multiple layers of security to protect all users - buyers, sellers, landlords, and investors. This guide outlines security practices and how the platform prevents fraud specifically in the Nigerian real estate market.

## User Verification System

### Document Requirements

**Mandatory Documents:**
1. **National ID (Valid for 5+ years)**
   - Must be government-issued
   - Photo must be clear and recent
   - No fake or altered IDs accepted

2. **Title Deed (For Sellers/Landlords)**
   - Official property ownership document
   - Must match property location
   - No forged documents

3. **Proof of Ownership**
   - Official receipt or documentation
   - Must verify legitimate ownership
   - Cross-referenced with title deed

**Optional but Highly Recommended:**
- Recent utility bill (proof of residence)
- Certificate of Occupancy
- Survey plan
- Tax clearance certificate

### Verification Process

1. User uploads documents through secure upload form
2. Documents stored in encrypted Supabase storage
3. Admin reviews within 24 hours
4. Approval or rejection with detailed feedback
5. Rejected documents can be resubmitted
6. Multiple rejections trigger fraud investigation

### Verification Statuses

- **Unverified**: No documents uploaded
- **Pending**: Documents uploaded, awaiting review
- **Verified**: All documents approved, trusted user
- **Rejected**: Documents failed verification, cannot be a seller

## Fraud Detection System

### Automated Detection

The system automatically flags accounts showing these patterns:

**Pattern 1: Multiple Rejected Documents**
- Severity: HIGH
- Trigger: 2+ rejected documents
- Action: Account flagged for manual review

**Pattern 2: Rapid Investment Escalation**
- Severity: MEDIUM
- Trigger: 3+ investment proposals in 7 days
- Action: Account flagged, monitored for scams

**Pattern 3: Unverified Claims**
- Severity: MEDIUM
- Trigger: Investor role without approved documents
- Action: Conversation restricted until verified

**Pattern 4: Suspicious Keywords in Chat**
- Severity: MEDIUM
- Trigger: Messages containing:
  - "Western Union"
  - "Money transfer"
  - "Bitcoin" or "Crypto"
  - "Upfront payment"
  - "Bank details"
  - Similar payment-related terms
- Action: Conversation flagged for admin review

**Pattern 5: Multiple Failed Transactions**
- Severity: HIGH
- Trigger: Multiple investment proposals rejected by sellers
- Action: Account monitored, pattern analysis

### Admin Review Process

When an account is flagged:

1. **Immediate Actions:**
   - Account added to fraud flags table
   - Conversations marked for review
   - Notification sent to admin team

2. **Investigation (within 24 hours):**
   - Review uploaded documents
   - Check conversation history
   - Verify claimed credentials
   - Contact references if needed

3. **Decision:**
   - **Approve**: Remove flag, send welcome message
   - **Investigate Further**: Request additional info
   - **Ban**: Remove account, contact authorities if needed

## Account Banning

### Banning Criteria

An account can be banned for:

**Definite Bans (Immediate):**
- Forged national ID
- Fake property documents
- Explicit scam attempts
- Harassment or threats
- Money laundering activity
- Sexual harassment
- Hate speech

**Conditional Bans (After Review):**
- Multiple document rejections
- Suspicious payment patterns
- Unresponsive to verification requests
- Multiple complaints from other users
- Impersonation attempts

### Ban Process

1. Admin reviews evidence
2. Account marked as `is_banned = true`
3. Ban reason documented
4. Ban date recorded
5. User notified of ban and reason
6. All conversations archived (for evidence)
7. No new listings or messages from banned account

### Ban Appeals

Users can appeal bans within 30 days by:
1. Providing additional verification documents
2. Explaining the misunderstanding
3. Admin reviews appeal within 5 business days
4. Decision communicated to user

## Chat Monitoring

### How It Works

- Every message in investment conversations is scanned
- Real-time flagging for suspicious keywords
- Flagged messages marked in admin dashboard
- Admin can review full conversation context

### What Triggers a Flag

- Request for pre-payment or deposits
- Pressure to move transactions off-platform
- Inconsistent property details
- Overly good deals (too-good-to-be-true)
- Requests for personal information beyond reasonable
- Attempts to bypass escrow or verification

### Admin Actions

When a flagged conversation is reviewed:

1. **Legitimate Discussion**: Flag removed, conversation continues
2. **Suspicious**: Conversation locked pending investigation
3. **Obvious Scam**: Both accounts banned, case escalated

## Data Protection

### Storage Security

- All documents encrypted at rest using Supabase encryption
- Access controlled via Row Level Security policies
- Document URLs are temporary and expire after 7 days
- No personal data shared with third parties
- Compliance with Nigeria Data Protection Regulation (NDPR)

### Access Control

- Only account owner can view their own documents
- Only admins can view all documents
- Supabase auth handles session management
- Secure cookies with httpOnly flag
- Automatic logout after 24 hours of inactivity

## Investment Safety

### For Sellers

- Verify investor's documents before accepting proposal
- Use platform messaging (don't move to WhatsApp)
- Document all agreements in chat
- Request lawyer review before transfer
- Use escrow for large amounts

### For Investors

- Check seller's document verification status
- Request property verification before investing
- Get lawyer to review investment agreement
- Request title search independently
- Don't send money for "holding fees" or "verification"

### Red Flags to Watch

**For Sellers:**
- Investor pushes to send money immediately
- Request to send to personal account vs. business
- Unwillingness to verify themselves
- Refusal to discuss terms in writing
- Pressure to move off-platform

**For Investors:**
- Seller unwilling to provide verified documents
- "Too good to be true" pricing
- Pressure to decide quickly
- Requests for upfront fees
- No property history or documentation

## Compliance & Regulations

### Nigerian Real Estate Laws

- Comply with Land Use Act 1978
- Follow CAMA 2020 for company requirements
- Adhere to FIRS tax regulations
- Respect tenant rights under Tenancy laws
- Honor Environmental Impact requirements

### Platform Policies

- No unlicensed property developers
- No fractional property sales without regulation
- No schemes violating CAMA
- No money laundering activities
- No Ponzi schemes or investment fraud

## Reporting & Escalation

### Reporting Issues

1. **In-App Reporting:**
   - Use "Report User" button on profile
   - Use "Flag Conversation" in chat
   - Report suspicious listings

2. **Evidence Provided:**
   - Screenshot of suspicious messages
   - Links to specific conversations
   - Description of concern

3. **Admin Review:**
   - Case reviewed within 24 hours
   - Evidence collected and stored
   - Determination made and action taken
   - Reporter notified of outcome (without exposing other user info)

### Escalation to Authorities

Serious cases (money laundering, terrorism financing, etc.) are escalated to:
- Nigeria Police Force Economic and Financial Crimes Division (EFCC)
- Central Bank of Nigeria (CBN) if financial crimes
- National Information Technology Development Agency (NITDA) for data breaches

## Best Practices for All Users

### Before Any Transaction

1. ✅ Verify other party's documents
2. ✅ Check their platform history and reviews
3. ✅ Get everything in writing on the platform
4. ✅ Use secure payment methods
5. ✅ Involve a lawyer for large amounts
6. ✅ Do independent property verification

### Never

1. ❌ Send money to personal accounts
2. ❌ Pay "verification fees" or "holding fees"
3. ❌ Move to WhatsApp or other platforms immediately
4. ❌ Share full national ID numbers in chat
5. ❌ Accept offers that seem too good to be true
6. ❌ Rush important decisions

### Report Suspicious Activity

If you see:
- Fake documents
- Scam attempts
- Harassment
- Unusual payment requests
- Inconsistent information

**Report immediately** through the platform's reporting feature.

## Support & Resources

- **Document Help**: Dashboard → Documents → Help
- **Report Scam**: Click "Report User" on any profile
- **Escalation**: Contact admin@propertyhub.ng
- **Legal Resources**: Links to property lawyers in each state
- **Verification Help**: Email support with document questions

## Continuous Improvement

PropertyHub regularly:
- Updates fraud detection patterns
- Reviews banned accounts for emerging scam types
- Trains admin team on new threats
- Updates security protocols
- Engages with regulatory bodies

Last updated: December 2025
</parameter>
