# Deployment Guide - Zeabur + Supabase

This guide will help you deploy the Sun Task Clone application to Zeabur with Supabase as the database backend.

## Prerequisites

- A [Supabase](https://supabase.com) account
- A [Zeabur](https://zeabur.com) account
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Set Up Supabase

### 1.1 Create a New Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: sun-task-clone
   - **Database Password**: (generate a strong password and save it)
   - **Region**: Choose closest to your users
4. Click "Create new project"

### 1.2 Run Database Schema

1. Wait for your project to finish setting up
2. Go to the "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase-schema.sql` from this repository
5. Paste it into the SQL editor
6. Click "Run" to execute the schema

This will create:
- `missions` table
- `submissions` table
- Indexes for performance
- Row Level Security policies

### 1.3 Get Your Supabase Credentials

1. Go to "Project Settings" (gear icon in sidebar)
2. Click on "API" section
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

## Step 2: Prepare Your Repository

### 2.1 Create Environment Variables File

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 2.2 Test Locally

1. Install dependencies:
   ```bash
   bun install
   ```

2. Run the development server:
   ```bash
   bun run dev
   ```

3. Test the application:
   - Visit `http://localhost:3000`
   - Go to `/admin` and login (chitu / 1234567890)
   - Create a test mission
   - Submit a test application
   - Verify data appears in Supabase dashboard

### 2.3 Push to Git

1. Commit your changes (but **NOT** `.env.local`):
   ```bash
   git add .
   git commit -m "Add Supabase integration"
   git push origin main
   ```

## Step 3: Deploy to Zeabur

### 3.1 Create New Project

1. Go to [Zeabur Dashboard](https://dash.zeabur.com)
2. Click "Create Project"
3. Choose a region (same as Supabase for best performance)

### 3.2 Deploy Your Application

1. Click "Deploy New Service"
2. Choose "Git" as the source
3. Connect your GitHub/GitLab account if needed
4. Select your repository
5. Zeabur will auto-detect Next.js and configure build settings

### 3.3 Configure Environment Variables

1. In your Zeabur service, go to "Variables" tab
2. Add these environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Click "Redeploy" to apply the changes

### 3.4 Get Your Domain

1. Go to "Domains" tab
2. Zeabur will provide a free domain: `xxx.zeabur.app`
3. (Optional) Add your custom domain if you have one

## Step 4: Verify Deployment

1. Visit your Zeabur domain
2. Test the full workflow:
   - Login to admin (`/admin`)
   - Create missions
   - Submit applications
   - View submissions dashboard
3. Check Supabase dashboard to verify data is being stored

## Step 5: Post-Deployment Configuration

### 5.1 Supabase Security (Production)

For production use, you should implement proper authentication:

1. Enable Supabase Auth in your project
2. Update RLS policies to restrict access based on user roles
3. Create an admin role/table
4. Update the login logic to use Supabase Auth

### 5.2 Zeabur Custom Domain (Optional)

1. Go to "Domains" tab in Zeabur
2. Click "Add Domain"
3. Enter your domain name
4. Follow the DNS configuration instructions
5. Wait for SSL certificate to be issued

### 5.3 Monitoring

- **Zeabur**: Monitor deployment logs and performance
- **Supabase**: Check database usage and API requests
- Set up alerts for errors or high usage

## Troubleshooting

### Build Fails on Zeabur

1. Check build logs in Zeabur dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Node.js version compatibility

### Database Connection Issues

1. Verify environment variables are set correctly
2. Check Supabase project is active
3. Ensure RLS policies allow public access (or implement auth)

### Images Not Displaying

1. Verify base64 conversion is working
2. Check browser console for errors
3. Ensure Supabase JSONB field size is sufficient

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGc...` |

## Support

- Zeabur Docs: https://zeabur.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

## Admin Credentials

Default admin login:
- Username: `chitu`
- Password: `1234567890`

**Important**: Change these credentials in production by implementing proper authentication!
