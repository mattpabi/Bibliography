# Bookshelf
Build your own catalogue of books with ***Bookshelf***.

The final live website can be visited here: https://bookshelf-by-mattpabi.vercel.app/

---

**Please note:**
* The site is best viewed on a Chromium-based browser on a desktop with a 16:9 aspect ratio, with a resolution of no less than 1280x720
* The site may be blocked on government and/or school internet networks, because it is hosted on Vercel (most, if not all, sites hosted on Vercel are blocked on government networks)
  * If so, please visit the website on your own personal WiFi or mobile plans.

---

### If you wish to install this Node project on your local machine:

1. Clone this repository onto your machine.
   
2. Run `npm install` at the root directory of the project folder (i.e. run the command when you are in the same folder as the `package.json` file). You may ignore any errors or vulnerability warnings.

3. From there, you will need to create a `.env` file to contain your connections with your own Supabase and Vercel PosgreSQL databases. **I will not provide my own personal API keys in this repository.**
   * Simply create a `.env` file at the root directory, fill in the following fields and paste in your API and connection keys, after signing up for the necessary accounts with Supabase and Vercel:
       ```
       SUPABASE_PROJECT_URL=""
       SUPABASE_ANON_KEY=""

       # Created by Vercel CLI
       POSTGRES_DATABASE=""
       POSTGRES_HOST=""
       POSTGRES_PASSWORD=""
       POSTGRES_PRISMA_URL=""
       POSTGRES_URL=""
       POSTGRES_URL_NON_POOLING=""
       POSTGRES_URL_NO_SSL=""
       POSTGRES_USER=""
       SUPABASE_ANON_KEY=""
       SUPABASE_PROJECT_URL=""
       ```

4. Once setup, the project should be ready to be run locally. Simply run `node --watch index.js` at the root directory of the project, and enter in `localhost:8080` on your browser's search bar to view the running app.
   * If there is a conflict of ports, you can go into the `index.js` file and change the JavaScript `port` constant from `8080` to whichever port is available on your machine. You can find it in the 16th line of the `index.js` file.