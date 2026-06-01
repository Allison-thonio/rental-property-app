# PropertyHub Setup & Deployment Guide

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Supabase account (free tier works fine for testing)
- Vercel account (optional, for deployment)

## Step 1: Database Setup

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database to initialize (~5 minutes)
4. Copy your project URL and API keys

### Run Migration Scripts

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy contents of `scripts/001_create_tables.sql` and run it
4. Create another query
5. Copy contents of `scripts/002_profile_trigger.sql` and run it
6. Create another query
7. Copy contents of `scripts/003_investor_documents_admin.sql` and run it

### Create Storage Bucket

In Supabase dashboard:

1. Go to **Storage** → **Buckets**
2. Create new bucket named `documents`
3. Set to **Private** (not public)
4. Add policy to allow authenticated users to upload:
   ```sql
   CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'documents');
   ```

## Step 2: Environment Configuration

### Local Development

Create `.env.local` in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
POSTGRES_URL=your_postgres_connection_string

# Development redirect (localhost for testing)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/sign-up-success
```

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `POSTGRES_URL`

Note: For production, update `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` to your Vercel domain.

## Step 3: First Admin User

After creating your Supabase project:

1. **Sign up** through the app at `http://localhost:3000/auth/sign-up`
2. Use email: `admin@yourdomain.com` (or any email)
3. Complete sign-up process

In Supabase:

1. Go to **SQL Editor**
2. Run this query:
   ```sql
   UPDATE profiles
   SET is_admin = true
   WHERE email = 'admin@yourdomain.com';
   ```

Now you have admin access! Check your Navigation bar - you'll see an "Admin" button.

## Step 4: Test the Platform

### Create Test Accounts

Sign up with different roles:
1. Buyer/Renter
2. Seller/Landlord
3. Investor
4. Another Buyer/Renter (for messaging testing)

### Test User Flow

**As Seller:**
1. Log in with seller account
2. Go to Dashboard → Properties
3. Click "Create New Property"
4. Fill in property details
5. Upload property images
6. Save listing

**As Buyer:**
1. Log in with buyer account
2. Go to home page (/)
3. Browse properties
4. Click on a property
5. Click "Save Property" (favorite)
6. Click "Contact Seller"
7. Fill inquiry form and submit

**As Admin:**
1. Log in with admin account
2. Click "Admin" button in navigation
3. Review dashboard statistics
4. Go through document verification process
5. Test user management features

## Step 5: Verification Documents

### Upload Documents

For testing fraud detection:

1. **As Buyer/Seller:**
   - Go to Dashboard → Documents
   - Click "Upload" on each document type
   - Upload test images (or use placeholders)

2. **As Admin:**
   - Go to Admin → Document Verification
   - Review pending documents
   - Click "Approve" or "Reject"
   - View logs in Admin → Logs

### Create Test Investment

1. **As Seller:**
   - Create a property listing
   - Share property ID with investor

2. **As Investor:**
   - Go to property page
   - Click "Invest in this Property"
   - Choose investment type
   - Enter amount and terms
   - Submit proposal

3. **As Seller:**
   - Go to Dashboard → Investments
   - See investment proposal
   - Click "Chat"
   - Start negotiation

4. **As Admin:**
   - Go to Admin → Chat Monitoring
   - Review flagged conversations
   - Go to Admin → Investments
   - See all active investments

## Step 6: Production Checklist

Before going live:

- [ ] Verify all environment variables are set
- [ ] Test authentication (sign-up, login, logout)
- [ ] Test property creation and editing
- [ ] Test messaging system
- [ ] Test document upload and verification
- [ ] Test investment proposals
- [ ] Verify admin access works
- [ ] Check that emails are being sent (if enabled)
- [ ] Test on mobile device
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Set up analytics (Vercel Analytics)
- [ ] Review security.txt and SECURITY_GUIDE.md
- [ ] Configure rate limiting (if needed)
- [ ] Set up backups (Supabase has automatic daily backups)

## Step 7: Deployment

### Deploy to Vercel

```bash
# Connect GitHub repo
vercel --prod

# Or through Vercel dashboard:
# 1. Go to vercel.com/new
# 2. Import GitHub repo
# 3. Add env variables
# 4. Deploy
```

### Configure Custom Domain

1. In Vercel: Settings → Domains
2. Add your domain
3. Follow DNS setup instructions
4. Wait for SSL certificate (usually 24 hours)

## Monitoring & Maintenance

### Daily Tasks

- Check admin dashboard for new signups
- Review fraud flags
- Approve pending documents
- Monitor message volume

### Weekly Tasks

- Review audit logs
- Check system statistics
- Monitor storage usage
- Review user feedback

### Monthly Tasks

- Database backup verification
- Security update checks
- Performance analysis
- User retention analysis

## Troubleshooting

### Issue: "Unauthorized" error on admin pages

**Solution:** Verify `is_admin = true` in profiles table:
```sql
SELECT id, email, is_admin FROM profiles WHERE email = 'your@email.com';
```

### Issue: Document upload fails

**Solution:** Check storage bucket:
1. Verify bucket is named "documents"
2. Check bucket is private
3. Verify storage policies are set correctly
4. Check file size (max 5MB)

### Issue: Emails not sending

**Solution:** 
- Check Supabase email settings
- Verify email templates are configured
- Check spam folder
- Test with admin email first

### Issue: Performance is slow

**Solution:**
- Check Supabase database query performance
- Optimize RLS policies
- Clear old logs (keep 90 days)
- Enable caching for static assets

## Database Maintenance

### Backup Data

Supabase automatically backs up daily. To export:

1. Supabase Dashboard → Settings → Backups
2. Download latest backup
3. Store securely

### Clear Old Records

Periodically clean old data:

```sql
-- Archive old fraud flags (older than 90 days)
DELETE FROM fraud_flags 
WHERE created_at < NOW() - INTERVAL '90 days' 
AND resolved = true;

-- Archive old logs (older than 180 days)
DELETE FROM admin_logs 
WHERE created_at < NOW() - INTERVAL '180 days';
```

## Support & Resources

- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **TypeScript Docs:** [typescriptlang.org](https://typescriptlang.org)

## Next Steps

After successful deployment:

1. Add payment processing (Stripe, Flutterwave)
2. Set up email notifications
3. Add SMS notifications (Vonage, Twilio)
4. Implement video verification for high-value investments
5. Add insurance integration
6. Create mobile app using React Native
7. Implement property inspection workflow
8. Add legal document templates

---

Happy deploying! 🚀
