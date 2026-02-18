# Supabase Integration Guide

This guide will help you connect your Papaya Academy dashboard to Supabase for real-time data management.

## Prerequisites

- Node.js installed
- Supabase account (free tier is sufficient)
- Your existing React application

## Step 1: Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Project Name**: `papaya-academy-dashboard`
   - **Database Password**: Choose a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxxxxx.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role** key (keep this secret!)

## Step 3: Set Up Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and replace with your actual Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## Step 4: Set Up Database Schema

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste it into the SQL Editor
5. Click "Run" to execute the schema creation

This will create all the necessary tables for your application.

## Step 5: Set Up Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Site URL**, add: `http://localhost:5173`
3. Under **Redirect URLs**, add: `http://localhost:5173/**`
4. Enable **Email/Password** authentication if not already enabled

## Step 6: Create Admin User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click "Add user"
3. Enter admin credentials:
   - **Email**: `admin@papaya.com`
   - **Password**: `admin123`
4. Click "Save"

## Step 7: Update Your Application Code

### Option A: Replace Current Login System (Recommended)

1. Wrap your App component with AuthProvider in `main.jsx` or `index.jsx`:
   ```jsx
   import { AuthProvider } from './hooks/useAuth'
   
   ReactDOM.createRoot(document.getElementById('root')).render(
     <React.StrictMode>
       <AuthProvider>
         <App />
       </AuthProvider>
     </React.StrictMode>
   )
   ```

2. Update your App.jsx to use the new auth system:
   ```jsx
   import { useAuth } from './hooks/useAuth'
   import { useSupabaseData } from './hooks/useSupabaseData'
   
   function App() {
     const { user, signIn, signOut, loading: authLoading } = useAuth()
     const { donations, campaigns, donors, partners, messages, loading } = useSupabaseData()
     
     // Replace your existing login logic with:
     const handleLogin = async (event) => {
       event.preventDefault()
       const result = await signIn(email, password)
       if (result.success) {
         // Login successful
         setActivePage('dashboard')
       } else {
         setError(result.error)
       }
     }
     
     // Replace your logout logic with:
     const handleLogout = async () => {
       const result = await signOut()
       if (result.success) {
         // Logout successful
         setActivePage('dashboard')
       }
     }
   ```

### Option B: Gradual Migration

Keep your current login system and gradually replace data sources:

1. Import the Supabase hooks:
   ```jsx
   import { useSupabaseData } from './hooks/useSupabaseData'
   ```

2. Replace mock data with Supabase data:
   ```jsx
   function App() {
     const { donations, campaigns, donors, partners, messages } = useSupabaseData()
     
     // Use these instead of your initial* states
     // const [donations, setDonations] = useState(initialDonations)
     // becomes:
     // const { donations } = useSupabaseData()
   }
   ```

## Step 8: Test Your Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try logging in with:
   - **Email**: `admin@papaya.com`
   - **Password**: `admin123`

3. Navigate through different sections to verify data loads correctly

## Step 9: Migrate Existing Data (Optional)

If you have existing data you want to migrate:

1. Export your current data from the application
2. In Supabase dashboard, go to **Table Editor**
3. Select each table and use "Insert" → "Import from CSV"
4. Or use the SQL Editor with INSERT statements

## Features You Now Have

✅ **Real-time updates** - Data automatically refreshes when changed
✅ **Authentication** - Secure user management
✅ **Database persistence** - Data is stored permanently
✅ **Row Level Security** - Data access control
✅ **File storage** - For media uploads (via Supabase Storage)
✅ **Edge functions** - For serverless backend logic

## Next Steps

1. **Set up Supabase Storage** for file uploads (images, documents)
2. **Configure Edge Functions** for payment processing
3. **Set up database backups** in Supabase settings
4. **Configure custom domains** for production
5. **Set up monitoring** and alerts

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your localhost URL is added to CORS settings
2. **Auth Errors**: Check that your redirect URLs are correct
3. **Permission Errors**: Verify RLS policies are properly set up
4. **Connection Issues**: Check that your environment variables are correct

### Debug Tips

- Use browser DevTools to check network requests
- Check Supabase dashboard logs for errors
- Enable console logging in your Supabase client
- Test queries directly in Supabase SQL Editor

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.gg/supabase)
- [React + Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react)

## Security Notes

- Never expose your service_role key on the client side
- Use Row Level Security (RLS) policies to protect data
- Enable Multi-Factor Authentication for admin users
- Regularly rotate your API keys
- Use environment variables for all secrets
