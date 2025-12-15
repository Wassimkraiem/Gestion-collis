# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Colissimo API Configuration
COLISSIMO_WSDL_URL=your_colissimo_wsdl_url_here
COLISSIMO_USERNAME=your_colissimo_username_here
COLISSIMO_PASSWORD=your_colissimo_password_here

# Authentication Credentials
NEXT_PUBLIC_AUTH_USERNAME=your_auth_username_here
NEXT_PUBLIC_AUTH_PASSWORD=your_auth_password_here
```

## For Netlify Deployment

Add these environment variables in your Netlify dashboard:

1. Go to Site settings → Environment variables
2. Add each variable with its value:
   - `COLISSIMO_WSDL_URL`
   - `COLISSIMO_USERNAME`
   - `COLISSIMO_PASSWORD`
   - `NEXT_PUBLIC_AUTH_USERNAME`
   - `NEXT_PUBLIC_AUTH_PASSWORD`

## Important Notes

- **NEVER** commit `.env.local` to version control
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Server-only variables (without `NEXT_PUBLIC_`) are secure and not exposed

