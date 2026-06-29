# Image Upload Application

A Next.js web application that allows users to upload images and provides an authenticated admin panel to manage and retrieve public links to uploaded images.

## Features

- **Public Upload Page**: Drag-and-drop or click-to-upload interface for images (no login required)
- **Admin Authentication**: Secure login using NextAuth.js with credentials provider
- **Admin Panel**: View all uploaded images, copy public links, and delete images
- **Image Storage**: Images stored in Vercel Blob for production (persistent storage)
- **Database**: PostgreSQL via Prisma for user authentication and image metadata
- **Public Links**: Each uploaded image gets a publicly accessible URL
- **Image Metadata**: Tracks upload date, original filename, size, and generates unique IDs

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js (Credentials provider)
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Vercel Blob
- **Password Hashing**: bcryptjs

## Supported Formats

- JPEG/JPG
- PNG
- GIF
- WebP

## File Size Limit

- Maximum file size: 10MB

## Local Development Setup

### Prerequisites

- Node.js 18+ (recommended)
- PostgreSQL database (local or cloud)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/image_upload_db"
BLOB_READ_WRITE_TOKEN="your_blob_token_here"
NEXTAUTH_SECRET="your_secret_key_here"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

3. Set up the database:
```bash
npx prisma migrate dev --name init
```

4. Seed the admin user:
```bash
npm run seed
```

### Running the App

For development:
```bash
npm run dev
```

For production build:
```bash
npm run build
npm start
```

Access the app at:
- **Upload Page**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin/login
- **Admin Panel**: http://localhost:3000/admin

## API Endpoints

### POST /api/upload
Upload an image file (public, no auth required).

**Request**: FormData with `image` field

**Response**:
```json
{
  "id": "clx123abc",
  "filename": "photo.jpg",
  "originalName": "photo.jpg",
  "url": "https://...",
  "size": 123456,
  "uploadedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/images
Get all uploaded images (admin only).

**Response**: Array of image objects

### DELETE /api/images/[id]
Delete an image by ID (admin only).

**Response**: 
```json
{
  "message": "Image deleted successfully"
}
```

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth handler
│   │   ├── upload/route.ts              # Upload endpoint
│   │   ├── images/route.ts              # List images (admin)
│   │   └── images/[id]/route.ts         # Delete image (admin)
│   ├── admin/
│   │   ├── page.tsx                      # Admin panel
│   │   └── login/page.tsx               # Admin login
│   ├── layout.tsx                       # Root layout
│   ├── page.tsx                         # Public upload page
│   └── globals.css                      # Global styles
├── lib/
│   ├── auth.ts                          # NextAuth config
│   └── prisma.ts                        # Prisma client
├── prisma/
│   ├── schema.prisma                    # Database schema
│   └── seed.ts                          # Admin seed script
├── middleware.ts                        # Route protection
├── next.config.js                       # Next.js config
├── tailwind.config.ts                   # Tailwind config
├── tsconfig.json                        # TypeScript config
├── package.json
└── README.md
```

## Vercel Deployment

### Prerequisites

- GitHub repository with this code
- Vercel account

### Deployment Steps

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Storage**:
   - In Vercel project settings, go to **Storage** tab
   - Create a **Blob** store (this auto-injects `BLOB_READ_WRITE_TOKEN`)
   - Create a **Postgres** database (this auto-injects `DATABASE_URL`)

4. **Add Environment Variables**:
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your Vercel domain (e.g., `https://your-app.vercel.app`)
   - `ADMIN_EMAIL`: Your admin email
   - `ADMIN_PASSWORD`: Your admin password

5. **Configure Build Settings**:
   - Build Command: `prisma generate && prisma migrate deploy && next build`
   - Install Command: `npm install`

6. **Deploy**:
   - Click "Deploy"
   - After deployment, run the seed script to create the admin user:
     - Either run locally with production DB URL: `DATABASE_URL="..." npm run seed`
     - Or create a protected `/api/seed` endpoint for one-time use

7. **Access Your App**:
   - Upload: `https://your-app.vercel.app`
   - Admin Login: `https://your-app.vercel.app/admin/login`

## Notes

- Images are stored in Vercel Blob (persistent, CDN-backed)
- User and image metadata stored in PostgreSQL
- Admin panel is protected by NextAuth.js session
- Public uploads do not require authentication
- For production, consider adding rate limiting to the upload endpoint
