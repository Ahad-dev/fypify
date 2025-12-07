# FYPIFY Backend - Render Deployment Guide

## 🚀 Quick Deploy to Render

### Prerequisites
- GitHub account
- Render account (free tier works)
- Your code pushed to GitHub

### Deployment Steps

#### 1. Push Code to GitHub
```bash
cd backend
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

#### 2. Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `fypify-backend`
   - **Environment**: `Docker`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend` (if monorepo)

#### 3. Set Environment Variables

Add these in Render dashboard under "Environment":

```bash
# Database (NeonDB)
SPRING_DATASOURCE_URL=jdbc:postgresql://ep-solitary-mountain-ade09kl7-pooler.c-2.us-east-1.aws.neon.tech/neondb?user=neondb_owner&password=npg_FTtZwKx0chn4&sslmode=require&channelBinding=require
SPRING_DATASOURCE_USERNAME=neondb_owner
SPRING_DATASOURCE_PASSWORD=npg_FTtZwKx0chn4

# JWT Secret (generate a secure random string)
JWT_SECRET=your-secure-secret-key-minimum-256-bits

# Token Expiration
JWT_ACCESS_EXPIRATION=900000
JWT_REFRESH_EXPIRATION=604800000

# Frontend URL (update after deploying frontend to Vercel)
FRONTEND_URL=https://your-frontend.vercel.app

# Spring Profile
SPRING_PROFILES_ACTIVE=prod

# Logging
LOGGING_LEVEL_COM_FYPIFY_BACKEND=INFO
```

#### 4. Deploy

Click **"Create Web Service"** - Render will:
- Build your Docker image
- Deploy to a free `.onrender.com` domain
- Provide HTTPS automatically
- Deploy on every git push

### 📍 Your API URL

After deployment, your API will be available at:
```
https://fypify-backend.onrender.com
```

### Health Check

Test your deployment:
```bash
curl https://fypify-backend.onrender.com/actuator/health
```

Expected response:
```json
{
  "status": "UP"
}
```

### 🔧 Update Frontend

Update your frontend `.env`:
```env
NEXT_PUBLIC_API_URL=https://fypify-backend.onrender.com/api
```

### Important Notes

1. **Free Tier Limitations**:
   - Spins down after 15 minutes of inactivity
   - First request after spin-down takes ~30 seconds
   - Upgrade to Starter ($7/mo) for always-on

2. **Database Connection**:
   - Already configured with your NeonDB
   - Connection pooling enabled
   - SSL/TLS encryption active

3. **CORS**:
   - Update `FRONTEND_URL` environment variable
   - Backend will automatically allow requests

4. **Swagger UI**:
   - Available at: `https://fypify-backend.onrender.com/swagger-ui.html`

### Troubleshooting

**Build fails?**
- Check Docker logs in Render dashboard
- Ensure Java 21 is specified in Dockerfile

**502 Bad Gateway?**
- Wait 30-60 seconds for cold start
- Check health endpoint
- Review environment variables

**Database connection fails?**
- Verify NeonDB connection string
- Check if NeonDB allows connections from Render IPs
- Test connection locally first

### Advanced: Custom Domain

1. Go to Settings → Custom Domain
2. Add your domain (e.g., `api.fypify.com`)
3. Update DNS records as instructed
4. Update `FRONTEND_URL` in both environments

## 🎉 Done!

Your Spring Boot API is now live on Render with:
- ✅ Automatic HTTPS
- ✅ Docker containerization
- ✅ Health monitoring
- ✅ Auto-deploy on git push
- ✅ Free tier available
