# 🔧 PowerShell Execution Policy Fix

## 🚨 Problem
You're getting this error when trying to run npm/npx commands:
```
File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

## ✅ Solution

### Option 1: Change Execution Policy (Recommended)
Run PowerShell as Administrator and execute:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

When prompted, type `Y` and press Enter.

### Option 2: Use Command Prompt Instead
Open Command Prompt (cmd) instead of PowerShell:
```cmd
npm run dev
npx next dev
```

### Option 3: Bypass for Current Session
In PowerShell, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
npm run dev
```

### Option 4: Use Node.js Directly
```powershell
node node_modules/.bin/next dev
```

## 🎯 Quick Fix Commands

After fixing the execution policy, run these commands:

```powershell
# 1. Start the development server
npm run dev

# 2. Test database connection
Invoke-WebRequest -Uri "http://localhost:3000/api/test-db-connection" -Method GET

# 3. Test login
Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"admin@newsportal.com","password":"password123"}'
```

## 📋 Database Status
✅ Database setup completed successfully
✅ Tables created: users, news, comments
✅ Admin user created: admin@newsportal.com / password123
✅ Prisma client generated

## 🔍 Next Steps
1. Fix PowerShell execution policy
2. Start development server
3. Test database connection
4. Login with admin credentials
5. Access admin dashboard at /admin

## 🆘 Alternative Solutions
If you continue having issues:
1. Use Command Prompt instead of PowerShell
2. Use VS Code integrated terminal
3. Use Windows Terminal
4. Use Git Bash

