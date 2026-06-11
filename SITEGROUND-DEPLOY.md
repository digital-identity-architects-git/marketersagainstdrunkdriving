# Putting the site live on SiteGround (easy version)

You do **not** need to understand any code. There are two parts:

- **Part 1 — Get the website online.** ~10 minutes, no tech skills. Do this now.
- **Part 2 — Turn on the daily auto-updating boxes.** A little more fiddly. You can do this later, or have someone walk you through it. The site works fine without it (the share boxes just stay empty until it's on).

---

## Part 1 — Get the website online

You'll upload one file (`madd-website.zip`) and unzip it on the server.

1. Go to **siteground.com** and log in.
2. Click **Websites** in the top menu, find your domain, and click **Site Tools**.
3. In the left menu, click **Site** → **File Manager**.
4. In the file list, double-click the **`public_html`** folder to open it.
   - If you see files already in there named like `default.html` or a SiteGround
     placeholder, you can delete those — they're just a "coming soon" page.
5. Click the **Upload** button (top of the File Manager) and choose
   **`madd-website.zip`** from your computer.
6. When it finishes uploading, **right-click the zip file** in the list and
   choose **Extract**. Extract it into `public_html` (the current folder).
7. Delete the `madd-website.zip` file afterward to keep things tidy.

That's it — your site is live. Visit your domain in a browser to see it.

### Turn on the padlock (free SSL)

1. In Site Tools, go to **Security** → **SSL Manager**.
2. Pick your domain, choose **Let's Encrypt**, and click **Get**.
3. Then go to **Security** → **HTTPS Enforce** and switch it **ON**.

Now your site loads with the secure padlock.

---

## Part 2 — Daily auto-updating share boxes (do later)

The boxes at the bottom of the front page are filled by a small "robot script"
that runs every morning, reads the news, and updates a file called
`data/daily.json`. You set it to run automatically with a **Cron Job**.

Pick the version that matches your plan. **If you're not sure, use the PHP
version — it works on every SiteGround plan.**

### Easiest: the PHP version (works on all plans)

1. In **File Manager**, open `public_html` and create a new folder called
   **`private`** (this keeps the script out of public view).
2. Upload **`scripts/daily-ticker.php`** (from this project) into that
   `private` folder.
3. Find your site's absolute path — in File Manager it's shown at the top, like
   `/home/customer/www/yourdomain.com/public_html`. Write it down.
4. In Site Tools, go to **Devs** → **Cron Jobs**.
5. Create a new cron job:
   - **Command:**
     ```
     TICKER_OUT_FILE=/home/customer/www/yourdomain.com/public_html/data/daily.json php /home/customer/www/yourdomain.com/public_html/private/daily-ticker.php
     ```
     (Replace both paths with **your** absolute path from step 3.)
   - **Schedule:** every day at **5:00** (hour 5, minute 0).
6. Save. Each morning at 5 AM it refreshes the boxes automatically.

To test it without waiting, most SiteGround cron screens have a **Run** button —
click it, then refresh your website's front page.

### Alternative: the Node.js version (GrowBig / GoGeek plans)

If your plan has the Node.js tool (Site Tools → **Devs** → **Node.js**), you can
instead run `scripts/daily-ticker.mjs` with this cron command (adjust the path):

```
TICKER_OUT_DIR=/home/customer/www/yourdomain.com/public_html/data node /home/customer/www/yourdomain.com/private/daily-ticker.mjs
```

Both versions do exactly the same thing — use whichever is easier on your plan.

---

## A note on Cloudflare

You may see failed "Cloudflare" build messages on the project's GitHub page.
That's leftover from an earlier setup and has **nothing to do with SiteGround** —
it can't affect your live site. You can ignore it, or disconnect it later in the
Cloudflare dashboard. It is safe to leave alone.
