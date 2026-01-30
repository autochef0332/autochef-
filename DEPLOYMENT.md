# Deployment Guide for Vercel

This guide will help you deploy the Restaurant Hub application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier is fine)
2. [Git](https://git-scm.com/) installed on your machine
3. Your Supabase project set up and running
4. Your Cloudinary account configured

## Step 1: Prepare Your Repository

1. Make sure all your changes are committed to Git:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   ```

2. Push to GitHub (or GitLab/Bitbucket):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/restaurant-hub.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Import Project to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js configuration

### Option B: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

## Step 3: Configure Environment Variables

In the Vercel Dashboard for your project:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables (for Production, Preview, and Development):

### Required Environment Variables

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGc...` |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret (server-side only) | `your-secret` |
| `CLOUDINARY_URL` | Complete Cloudinary URL | `cloudinary://key:secret@cloud` |

**Important Notes:**
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Never commit `.env` files to Git
- Use the `.env.example` file as a reference

## Step 4: Deploy

### First Deployment

1. If using the dashboard, Vercel will automatically deploy after importing
2. If using CLI, run:
   ```bash
   vercel --prod
   ```

### Subsequent Deployments

Every push to your `main` branch will trigger an automatic deployment.

For preview deployments, push to any other branch.

## Step 5: Custom Domain (Optional)

1. In Vercel Dashboard → **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Check the build logs in Vercel Dashboard
2. Ensure all environment variables are set correctly
3. Test the build locally:
   ```bash
   npm run build
   ```

### Environment Variables Not Working

- Make sure variables are added for the correct environment (Production/Preview/Development)
- Variables starting with `NEXT_PUBLIC_` are required for client-side code
- Redeploy after adding new environment variables

### Image Loading Issues

If Cloudinary images don't load:
- Verify `next.config.ts` includes Cloudinary in `remotePatterns`
- Check that `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set correctly

## Vercel-Specific Features

### Automatic Previews
- Each pull request gets a unique preview URL
- Test changes before merging to production

### Analytics
- Enable Vercel Analytics in Project Settings for visitor insights

### Serverless Functions
- API routes in `/src/app/api` automatically become serverless functions

## Monitoring

After deployment, monitor your application:
- **Vercel Dashboard**: Check deployment status and logs
- **Supabase Dashboard**: Monitor database performance
- **Cloudinary Dashboard**: Track image usage and bandwidth

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## Support

For deployment issues:
1. Check [Vercel Status](https://www.vercel-status.com/)
2. Review [Vercel Community](https://github.com/vercel/vercel/discussions)
3. Contact Vercel Support through dashboard

---

## Quick Deploy Checklist

- [ ] Code committed to Git
- [ ] Repository pushed to GitHub/GitLab/Bitbucket
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Application tested on Vercel URL
- [ ] Custom domain configured (optional)
