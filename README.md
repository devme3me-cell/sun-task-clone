# Sun Task Clone - Weekly Task Application System

A full-stack task management and submission system cloned from [sun-task.zeabur.app](https://sun-task.zeabur.app/), built with Next.js, Tailwind CSS, and Supabase.

## Features

### User Features
- 📋 **4-Step Wizard Flow**: Account confirmation → Task selection → Photo upload → Completion
- 🗓️ **Weekly Period Tracking**: Automatic ISO week number calculation
- 📸 **Drag-and-Drop Upload**: Multiple image support with preview and delete controls
- 📜 **Application History**: Query past submissions by username
- 🌐 **Fully Responsive**: Works on mobile, tablet, and desktop
- 🎨 **Dark Theme**: Modern gradient UI with Noto Sans TC typography

### Admin Features
- 🔐 **Secure Login**: Password-protected admin dashboard
- ➕ **Mission Management**: Create, edit, delete, and toggle missions
- 📅 **Date-Based Expiry**: Set start/end dates for automatic mission expiry
- 📊 **Submissions Dashboard**: Review all user applications with photos
- 🗂️ **Tab Navigation**: Separate views for missions and submissions

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Font**: Noto Sans TC (Google Fonts)
- **Package Manager**: Bun
- **Deployment**: Zeabur (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- A Supabase account (free tier works)
- A Zeabur account (for deployment)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd sun-task-clone
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Set up Supabase**:
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the schema from `supabase-schema.sql`
   - Copy your project URL and anon key

4. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Run the development server**:
   ```bash
   bun run dev
   ```

6. **Open in browser**:
   - Main app: http://localhost:3000
   - Admin dashboard: http://localhost:3000/admin

### Admin Login

Default credentials:
- Username: `chitu`
- Password: `1234567890`

**⚠️ Important**: Change these credentials in production!

## Project Structure

```
sun-task-clone/
├── src/
│   ├── app/
│   │   ├── api/              # API routes for Supabase
│   │   │   ├── missions/     # Mission CRUD endpoints
│   │   │   └── submissions/  # Submission endpoints
│   │   ├── admin/            # Admin dashboard page
│   │   │   └── page.tsx
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main application
│   └── lib/
│       ├── supabase.ts       # Supabase client setup
│       └── utils.ts          # Utility functions
├── supabase-schema.sql       # Database schema
├── DEPLOYMENT.md             # Detailed deployment guide
└── README.md                 # This file
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions to Zeabur with Supabase.

**Quick steps:**
1. Set up Supabase project and run schema
2. Push code to GitHub
3. Deploy to Zeabur
4. Add environment variables in Zeabur
5. Done! 🎉

## Database Schema

The application uses two main tables:

### Missions Table
- `id` (UUID): Primary key
- `title` (TEXT): Mission title
- `type` (TEXT): Task type (儲值任務/託售任務/流水任務)
- `desc` (TEXT): Mission description
- `active` (BOOLEAN): Active status
- `start_date` (TIMESTAMPTZ): Start date (optional)
- `end_date` (TIMESTAMPTZ): End date (optional)
- `created_at` (TIMESTAMPTZ): Creation timestamp

### Submissions Table
- `id` (UUID): Primary key
- `username` (TEXT): Applicant username
- `mission_id` (UUID): Reference to mission
- `mission_title` (TEXT): Mission title snapshot
- `mission_type` (TEXT): Mission type snapshot
- `photos` (JSONB): Array of base64-encoded photos
- `photos_count` (INTEGER): Number of photos
- `week` (INTEGER): ISO week number
- `year` (INTEGER): Year
- `created_at` (TIMESTAMPTZ): Submission timestamp

## API Routes

### Missions
- `GET /api/missions` - List all missions
- `POST /api/missions` - Create a new mission
- `PUT /api/missions/[id]` - Update a mission
- `DELETE /api/missions/[id]` - Delete a mission

### Submissions
- `GET /api/submissions` - List all submissions
- `POST /api/submissions` - Create a new submission

## Features in Detail

### Auto-Expiry
Missions with `start_date` and `end_date` are automatically filtered:
- Missions before `start_date` won't appear
- Missions after `end_date` won't appear
- Admin sees "已過期" label on expired missions

### Photo Handling
- Photos are converted to base64 before storage
- Stored in JSONB field in Supabase
- Displayed in both user history and admin dashboard
- Drag-and-drop upload with visual feedback

### Week Calculation
Uses ISO 8601 week date system:
- Week 1 is the week with the year's first Thursday
- Matches original sun-task.zeabur.app behavior

## Security Notes

**Current State** (Development):
- Admin auth is client-side only (localStorage)
- RLS policies allow public read/write access
- Suitable for demo/testing only

**For Production**:
- Implement Supabase Auth
- Update RLS policies for user-based access
- Use server-side session management
- Add role-based access control
- Change admin credentials

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This project was created as a clone of sun-task.zeabur.app for educational purposes.

## License

MIT

## Support

For deployment issues:
- Zeabur: https://zeabur.com/docs
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs
