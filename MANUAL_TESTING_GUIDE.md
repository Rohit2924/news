# Manual Testing Guide for News Portal

## Testing Site Settings Functionality

### 1. Test the Settings API
- Open your browser and go to: `http://localhost:3000/api/site-settings`
- You should see JSON data with your current settings
- Verify that the settings match what you set in the admin panel

### 2. Test the Settings Test Page
- Go to: `http://localhost:3000/test-settings`
- This page will show you exactly what settings are being loaded by the frontend
- Check if the values match what you set in the admin panel

### 3. Test Settings Changes
1. Go to `/admin/settings`
2. Change the following settings:
   - Site Name (e.g., change from "News Portal" to "My News Site")
   - Site Description (e.g., change to "My custom description")
   - Site Logo URL (use a different image URL)
   - Contact Email (change to a different email)
3. Click "Save Settings"
4. Check if you get a success message

### 4. Verify Changes on Frontend
After saving settings, check these locations:

#### Header (Main Website)
- Go to `http://localhost:3000`
- Check if the site name in the header changed
- Check if the site description under the logo changed
- Check if the logo image changed

#### Footer (Main Website)
- Scroll to the bottom of the page
- Check if the site name in the footer changed
- Check if the contact email changed
- Check if social media links are working (if you set them)

#### Favicon
- Check if the browser tab icon changed
- You might need to hard refresh (Ctrl+F5) to see favicon changes

### 5. Test Different Pages
- Go to different pages like `/politics`, `/sports`, etc.
- Verify that the header and footer show the updated settings on all pages

### 6. Common Issues to Check

#### If settings don't appear:
1. Check browser console for errors (F12 → Console)
2. Check if the API is working: `http://localhost:3000/api/site-settings`
3. Try hard refresh (Ctrl+F5)
4. Check if you're logged in as admin

#### If API returns 500 error:
1. Check the terminal where your dev server is running
2. Look for error messages
3. Make sure the database is connected

### 7. Expected Behavior
- Settings should update immediately after saving
- Changes should appear on all pages of the website
- The test page should show the same values as the API
- Header and footer should reflect the new settings

## Testing Other Features

### Authentication
- Test login/logout functionality
- Test admin access to settings
- Test editor access

### Articles
- Test article creation
- Test article display
- Test article categories

### Comments
- Test comment posting
- Test comment moderation

## Troubleshooting

If something doesn't work:
1. Check the browser console (F12)
2. Check the terminal for server errors
3. Verify database connection
4. Check if all dependencies are installed
5. Try restarting the development server

