# Vercel Deployment Guide

## 1. Environment Variables (CRITICAL)
Your application is crashing (500 Error) or behaving unexpectedly because it cannot connect to the database. You MUST add the database connection string to Vercel.

1.  Go to your **Vercel Dashboard**.
2.  Select your project (**Pro Test** / **get2gather**).
3.  Go to **Settings** > **Environment Variables**.
4.  Add the following variable:
    *   **Key**: `DATABASE_URL`
    *   **Value**: `postgresql://postgres.vqfnndepdzdewugdcwjg:J%40tin224@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require`
    *(I have copied this from your local `.env`. Ensure you verify it matches).*
5.  Also add these if they are missing:
    *   `SUPABASE_URL`: `https://vqfnndepdzdewugdcwjg.supabase.co`
    *   `SUPABASE_KEY`: *(Copy your long key starting with eyJ... from .env)*
    *   `RESEND_API_KEY`: `re_8SzzYL6Z_7aJmCc2pzE5rZbk2DYuwmdnd`
    *   `SMTP_EMAIL`: `get2gather.cems@gmail.com`
    *   `SMTP_PASSWORD`: `bhdg wycf wiae alom`

> **Note**: After adding variables, you must **Redeploy** for them to take effect.

## 2. Redeploying
Since I have just pushed changes to Git, Vercel might already be building.
1.  Go to **Deployments** tab in Vercel.
2.  Check the latest deployment (Status: Building or Ready).
3.  If the latest deployment Failed or is Old, click the **three dots** (...) next to it and select **Redeploy**.

## 3. Resolving 405 Method Not Allowed
The `405` error typically happens if:
*   The Deployment failed (check Logs).
*   The URL is incorrect. Ensure you are POSTing to `/api/auth/login`.
*   The `vercel.json` rewrite rules aren't active (I have verified they are present in the latest code I pushed).

**Action**: Once you add the Environment Variables and Redeploy, the API should start working correctly.
