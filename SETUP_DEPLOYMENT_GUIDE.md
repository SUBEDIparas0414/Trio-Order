# Trio Order - Setup & Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Email Service Setup](#email-service-setup)
6. [Payment Integration Setup](#payment-integration-setup)
7. [Running the Application](#running-the-application)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

## Prerequisites

### Required Software

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **MongoDB**: Version 5.0 or higher (or MongoDB Atlas account)
- **Git**: For version control

### Required Accounts

- **MongoDB Atlas**: For cloud database (recommended)
- **Gmail Account**: For email service
- **Stripe Account**: For payment processing

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Trio-Order
```

### 2. Install Dependencies

#### Backend Dependencies

```bash
cd backend
npm install
```

#### Frontend Dependencies

```bash
cd ../frontend
npm install
```

#### Admin Panel Dependencies

```bash
cd ../admin
npm install
```

### 3. Project Structure

```
Trio-Order/
├── backend/           # Express.js API server
├── frontend/          # React customer portal
├── admin/             # React admin panel
├── EMAIL_VERIFICATION_SETUP.md
├── PRODUCT_REQUIREMENTS_DOCUMENT.md
└── SETUP_DEPLOYMENT_GUIDE.md
```

## Environment Configuration

### Backend Environment Variables

Create `backend/.env` file with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/trio-order
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trio-order

# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Frontend Environment Variables

Create `frontend/.env` file:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Admin Environment Variables

Create `admin/.env` file:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. **Create MongoDB Atlas Account**

   - Go to https://www.mongodb.com/atlas
   - Sign up for a free account

2. **Create Cluster**

   - Click "Create Cluster"
   - Choose "Free" tier
   - Select region closest to you
   - Name your cluster (e.g., "trio-order-cluster")

3. **Configure Database Access**

   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password
   - Set privileges to "Read and write to any database"

4. **Configure Network Access**

   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0)

5. **Get Connection String**
   - Go to "Clusters"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### Option 2: Local MongoDB

1. **Install MongoDB**

   ```bash
   # Windows (using Chocolatey)
   choco install mongodb

   # macOS (using Homebrew)
   brew install mongodb

   # Ubuntu/Debian
   sudo apt-get install mongodb
   ```

2. **Start MongoDB Service**

   ```bash
   # Windows
   net start MongoDB

   # macOS/Linux
   sudo systemctl start mongod
   ```

3. **Verify Installation**
   ```bash
   mongod --version
   ```

## Email Service Setup

### Gmail Configuration

1. **Enable 2-Step Verification**

   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**

   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update Environment Variables**
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_16_character_app_password
   ```

### Alternative Email Services

For production, consider these services:

- **SendGrid**: Professional email service
- **AWS SES**: Amazon's email service
- **Mailgun**: Developer-friendly email API

## Payment Integration Setup

### Stripe Configuration

1. **Create Stripe Account**

   - Go to https://stripe.com
   - Sign up for a free account

2. **Get API Keys**

   - Go to "Developers" → "API Keys"
   - Copy "Publishable key" and "Secret key"
   - Use test keys for development

3. **Update Environment Variables**

   ```env
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

4. **Configure Webhooks** (Optional)
   - Go to "Developers" → "Webhooks"
   - Add endpoint: `http://localhost:4000/api/orders/webhook`
   - Select events: `checkout.session.completed`

## Running the Application

### Development Mode

#### 1. Start Backend Server

```bash
cd backend
npm start
```

Server will run on http://localhost:4000

#### 2. Start Frontend (Customer Portal)

```bash
cd frontend
npm run dev
```

Frontend will run on http://localhost:5173

#### 3. Start Admin Panel

```bash
cd admin
npm run dev
```

Admin panel will run on http://localhost:5174

### Production Build

#### Build Frontend

```bash
cd frontend
npm run build
```

#### Build Admin Panel

```bash
cd admin
npm run build
```

#### Start Production Server

```bash
cd backend
NODE_ENV=production npm start
```

## Production Deployment

### Option 1: Vercel (Recommended for Frontend)

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**

   ```bash
   cd frontend
   vercel
   ```

3. **Deploy Admin Panel**
   ```bash
   cd admin
   vercel
   ```

### Option 2: Netlify

1. **Connect Repository**

   - Go to https://netlify.com
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

### Option 3: Heroku (For Backend)

1. **Install Heroku CLI**

   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**

   ```bash
   heroku create trio-order-api
   ```

3. **Set Environment Variables**

   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set EMAIL_USER=your_email
   heroku config:set EMAIL_PASSWORD=your_password
   heroku config:set STRIPE_SECRET_KEY=your_stripe_key
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. **Create App**

   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"

2. **Configure Services**

   - Add backend service
   - Add frontend service
   - Configure environment variables

3. **Deploy**
   - Connect GitHub repository
   - Configure build settings
   - Deploy

## Database Migration

### Initial Data Setup

1. **Create Admin User**

   ```bash
   # Use MongoDB Compass or CLI
   use trio-order
   db.admins.insertOne({
     username: "admin",
     email: "admin@trioorder.com",
     password: "$2b$10$hashed_password_here",
     isVerified: true,
     isApproved: true,
     createdAt: new Date()
   })
   ```

2. **Add Sample Menu Items**
   ```bash
   db.items.insertMany([
     {
       name: "Chicken Biryani",
       description: "Aromatic basmati rice with tender chicken",
       price: 250,
       category: "Main Course",
       imageUrl: "/uploads/chicken-biryani.jpg",
       rating: 4.5,
       hearts: 120,
       createdAt: new Date()
     },
     // Add more items...
   ])
   ```

## Monitoring & Logging

### Application Monitoring

1. **Error Tracking**

   - Implement error logging
   - Use services like Sentry or LogRocket

2. **Performance Monitoring**

   - Monitor API response times
   - Track database query performance
   - Monitor memory usage

3. **Uptime Monitoring**
   - Use services like UptimeRobot
   - Set up alerts for downtime

### Logging Configuration

```javascript
// backend/utils/logger.js
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.Console(),
  ],
});

export default logger;
```

## Security Considerations

### Production Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Database backup strategy

### SSL Certificate Setup

1. **Let's Encrypt (Free)**

   ```bash
   sudo apt-get install certbot
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Cloudflare SSL**
   - Add domain to Cloudflare
   - Enable SSL/TLS encryption
   - Set SSL mode to "Full (strict)"

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string
echo $MONGODB_URI

# Test connection
mongosh "your_connection_string"
```

#### 2. Email Service Issues

```bash
# Check email credentials
node -e "console.log(process.env.EMAIL_USER)"

# Test email sending
node backend/utils/testEmail.js
```

#### 3. Payment Issues

```bash
# Check Stripe keys
node -e "console.log(process.env.STRIPE_SECRET_KEY)"

# Test Stripe connection
stripe balance retrieve
```

#### 4. Port Conflicts

```bash
# Check port usage
netstat -tulpn | grep :4000
netstat -tulpn | grep :5173
netstat -tulpn | grep :5174

# Kill process using port
sudo kill -9 $(lsof -t -i:4000)
```

### Error Logs

#### Backend Errors

```bash
# Check backend logs
cd backend
npm start 2>&1 | tee logs/backend.log
```

#### Frontend Errors

```bash
# Check browser console
# Check network tab for API errors
# Check build errors
npm run build
```

## Maintenance

### Regular Maintenance Tasks

#### Daily

- [ ] Check application logs
- [ ] Monitor error rates
- [ ] Check payment success rates

#### Weekly

- [ ] Update dependencies
- [ ] Check database performance
- [ ] Review user feedback

#### Monthly

- [ ] Security updates
- [ ] Database optimization
- [ ] Performance analysis
- [ ] Backup verification

### Backup Strategy

#### Database Backup

```bash
# MongoDB backup
mongodump --uri="your_connection_string" --out=backup/

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="backup/backup_$DATE"
```

#### File Backup

```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/
```

### Performance Optimization

#### Database Optimization

```javascript
// Add indexes for better performance
db.orders.createIndex({ user: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });
db.items.createIndex({ category: 1 });
db.users.createIndex({ email: 1 });
```

#### Caching Strategy

```javascript
// Implement Redis caching
import Redis from "redis";
const redis = Redis.createClient();

// Cache frequently accessed data
const cacheKey = `menu_items_${category}`;
const cachedData = await redis.get(cacheKey);
if (cachedData) {
  return JSON.parse(cachedData);
}
```

## Support & Documentation

### Additional Resources

- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Getting Help

- Check error logs first
- Review this documentation
- Search for similar issues online
- Contact development team

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Prepared By**: Development Team  
**Status**: Active
