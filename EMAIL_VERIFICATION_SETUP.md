# 📧 Email Verification & Password Reset Setup Guide

## ✅ Implementation Complete!

Your Trio Order application now has a complete email verification and password reset system with PIN-based security.

---

## 🎯 Features Implemented

### 1. **Email Verification on Signup**

- ✅ User signs up with username, email, and password
- ✅ 6-digit PIN sent to their email
- ✅ PIN expires in 15 minutes
- ✅ User must verify email before login
- ✅ Can resend PIN if expired or not received

### 2. **Secure Login System**

- ✅ Only verified users can login
- ✅ Unverified users redirected to verification page
- ✅ "Forgot Password?" link in login page

### 3. **Password Reset Flow**

- ✅ Enter registered email
- ✅ Receive 6-digit PIN via email
- ✅ Verify PIN
- ✅ Create new password
- ✅ Old password becomes invalid

### 4. **Security Features**

- ✅ All PINs expire in 15 minutes
- ✅ Email validation
- ✅ Password minimum 8 characters
- ✅ Passwords hashed with bcrypt
- ✅ JWT authentication
- ✅ Email address verification

---

## 🛠️ Setup Instructions

### **Step 1: Install Backend Dependencies** ✅ (Already Done)

```bash
cd backend
npm install nodemailer
```

### **Step 2: Configure Email Service**

You need to add email credentials to your backend `.env` file.

#### **For Gmail (Recommended for Development):**

1. **Enable 2-Step Verification:**

   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password:**

   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Google will generate a 16-character password

3. **Add to `.env` file:**

Create or update `backend/.env`:

```env
# Existing variables...
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=4000

# Email Configuration (Add these)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_character_app_password_here
```

**Example:**

```env
EMAIL_USER=trioorder@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

#### **For Other Email Services:**

If you want to use a different email service (Outlook, Yahoo, etc.), update `backend/utils/emailService.js`:

```javascript
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: "smtp.your-email-provider.com", // e.g., smtp.office365.com for Outlook
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};
```

---

## 📱 How It Works

### **New User Signup Flow:**

```
1. User fills signup form (username, email, password)
   ↓
2. Backend creates unverified account
   ↓
3. Backend sends 6-digit PIN to user's email
   ↓
4. User redirected to verification page
   ↓
5. User enters 6-digit PIN
   ↓
6. If correct: Account verified & user logged in
   If wrong: Error shown
   If expired: Can request new PIN
```

### **Login Flow:**

```
1. User enters email & password
   ↓
2. Backend checks if email is verified
   ↓
3. If verified: Login successful
   If not verified: Redirect to verification page
```

### **Forgot Password Flow:**

```
1. User clicks "Forgot Password?" on login
   ↓
2. Enters registered email
   ↓
3. Backend sends 6-digit PIN to email
   ↓
4. User enters PIN
   ↓
5. If correct: User creates new password
   If wrong/expired: Error shown
   ↓
6. Old password invalidated
   ↓
7. User can login with new password
```

---

## 🎨 Frontend Components

### **New Pages:**

1. **`/verify-email`** - Email verification with 6-digit PIN input
2. **`/forgot-password`** - 3-step password reset process

### **Updated Components:**

1. **`SignUP.jsx`** - Redirects to verification after signup
2. **`Login.jsx`** - Handles unverified users & has "Forgot Password?" link
3. **`App.jsx`** - Added new routes

---

## 🔌 API Endpoints

### **Authentication:**

- `POST /api/user/register` - Sign up (sends verification PIN)
- `POST /api/user/login` - Login (checks verification status)

### **Email Verification:**

- `POST /api/user/verify-email` - Verify email with PIN
- `POST /api/user/resend-verification` - Resend verification PIN

### **Password Reset:**

- `POST /api/user/forgot-password` - Request reset PIN
- `POST /api/user/verify-reset-pin` - Verify reset PIN
- `POST /api/user/reset-password` - Reset password with PIN

---

## 🧪 Testing the System

### **Test Signup & Verification:**

1. Go to `http://localhost:3000/signup`
2. Fill in: `testuser`, `your_test_email@gmail.com`, `password123`
3. Click "Create Account"
4. Check your email for 6-digit PIN
5. Enter PIN on verification page
6. Should be logged in automatically

### **Test Login (Unverified User):**

1. Create account but don't verify
2. Go to `http://localhost:3000/login`
3. Try to login
4. Should show error: "Please verify your email first"
5. Should redirect to verification page

### **Test Forgot Password:**

1. Go to `http://localhost:3000/login`
2. Click "Forgot Password?"
3. Enter registered email
4. Check email for PIN
5. Enter PIN
6. Create new password
7. Try logging in with new password

---

## 🎨 Email Template

The system sends beautiful HTML emails with:

- ✅ Branded with "Trio Order" logo
- ✅ Gradient design matching your app
- ✅ Clear 6-digit PIN display
- ✅ Expiration warning (15 minutes)
- ✅ Security tips
- ✅ Professional footer

---

## 🔒 Security Features

| Feature                               | Status |
| ------------------------------------- | ------ |
| Email validation                      | ✅     |
| Password strength check (min 8 chars) | ✅     |
| Password hashing (bcrypt)             | ✅     |
| JWT token authentication              | ✅     |
| PIN expiration (15 minutes)           | ✅     |
| Unique 6-digit PINs                   | ✅     |
| Email verification required for login | ✅     |
| Old password invalidation on reset    | ✅     |

---

## 📝 Database Changes

### **User Model Updates:**

```javascript
{
  username: String,
  email: String (unique),
  password: String (hashed),
  isVerified: Boolean (default: false),
  verificationPin: String,
  verificationPinExpires: Date,
  resetPin: String,
  resetPinExpires: Date,
  createdAt: Date
}
```

**Existing users in database:** They won't have `isVerified` field, so they'll default to `false`. They'll need to verify their email on next login attempt.

---

## ⚠️ Important Notes

### **Before Going Live:**

1. **Use Professional Email Service:**

   - Gmail has daily sending limits (500-2000 emails/day)
   - For production, use: **SendGrid**, **AWS SES**, **Mailgun**, or **Postmark**
   - These services have higher limits and better deliverability

2. **Update Email Templates:**

   - Replace "Trio Order" with your actual business name
   - Add your company address in footer
   - Customize colors if needed

3. **Environment Variables:**

   - Never commit `.env` file to Git
   - Use different email accounts for dev/staging/production
   - Store credentials securely (use secrets manager in production)

4. **Security:**
   - Consider adding rate limiting for PIN requests
   - Add CAPTCHA for signup/forgot password
   - Monitor for suspicious activity

---

## 🐛 Troubleshooting

### **Emails Not Sending:**

1. **Check `.env` file:**

   ```bash
   cd backend
   cat .env | grep EMAIL
   ```

   Should show your email credentials

2. **Check Gmail App Password:**

   - Make sure 2-Step Verification is enabled
   - Use the 16-character app password, not your regular password

3. **Check server logs:**

   ```bash
   # Backend terminal should show:
   ✅ Verification email sent to user@example.com
   # or
   ❌ Error sending verification email: [error details]
   ```

4. **Test email service:**
   - Try sending a test email from Node.js console
   - Check spam folder

### **PIN Not Working:**

1. **Check expiration:** PINs expire in 15 minutes
2. **Case sensitive:** Make sure PIN is entered correctly
3. **Check database:** PIN should be stored in user document

### **"User already exists" Error:**

- Email is already registered
- If they're not verified, new PIN will be sent automatically

---

## 🚀 Next Steps (Optional Enhancements)

- [ ] Add SMS verification as alternative
- [ ] Add email change verification
- [ ] Add "Remember this device" feature
- [ ] Add account deletion with email confirmation
- [ ] Add login history/activity log
- [ ] Add suspicious login alerts
- [ ] Add 2FA (Two-Factor Authentication)

---

## 📞 Support

If you encounter any issues:

1. Check backend terminal for error messages
2. Check browser console for frontend errors
3. Verify `.env` file has correct email credentials
4. Make sure all dependencies are installed
5. Restart both frontend and backend servers

---

## ✨ Summary

You now have a **production-ready authentication system** with:

- ✅ Secure email verification
- ✅ Password reset functionality
- ✅ Beautiful email templates
- ✅ Modern, premium UI design
- ✅ Comprehensive error handling

**All you need to do is add your email credentials to the `.env` file and start testing!**

---

**Created for Trio Order** 🍕
_Delivering delicious moments with secure authentication_ 🚀
