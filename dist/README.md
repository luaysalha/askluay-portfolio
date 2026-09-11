# Luay Salha — Portfolio ("Journey across borders")

A single-file, interactive portfolio site. No build step, no dependencies.
Everything lives in `index.html`. You can open it locally by double-clicking, and
host it free on GitHub Pages.

---

## 1. Repo structure

```
portfolio/
├── index.html          ← the site
├── data/projects.json  ← the Work grid content (the dashboard edits this)
├── admin/              ← the CONTENT DASHBOARD (Decap CMS)
│   ├── index.html
│   └── config.yml
├── assets/             ← images, gifs, small videos, posters
├── README.md
└── CNAME               ← (optional) your custom domain, e.g. askluay.nl
```

---

## ⭐ The content dashboard (add videos/images/designs yourself)

You get a real admin page at **your-site/admin** with forms to add, edit, reorder
and delete projects — no code. It saves straight to your GitHub repo. The easiest
way to make the login work is to host on **Netlify** (free), which still uses your
GitHub repo.

**One-time setup:**

1. Put this folder on GitHub (see section 3).
2. Go to **netlify.com** → "Add new site" → "Import from GitHub" → pick your repo →
   Deploy. (No build command needed; publish directory = the repo root.)
3. In your Netlify site: **Site configuration → Identity → Enable Identity**.
4. Under **Identity → Registration**, set it to **Invite only**.
5. Under **Identity → Services → Git Gateway**, click **Enable Git Gateway**.
6. Open the **`admin/config.yml`** file and replace `YOUR-SITE.netlify.app` (two
   lines) with your real Netlify address.
7. In Netlify **Identity**, click **Invite users** and invite your own email.
   Accept the email invite, set a password.
8. Visit **your-site/admin**, log in, and you'll see the dashboard.

**Using it:** open `/admin`, click a project to edit, or "Add" a new one. Each
project has: Title, Category (film/brand/motion/digital), a one-line description,
and then whichever media you have — upload an **Image**, paste a **YouTube ID**
(plays inline), upload a small **Video file** (plays inline), or paste an
**External link** (opens in a new tab, e.g. TikTok). Drag to reorder. Hit
**Publish** and the live site updates in ~1 minute.

> Big videos: don't upload files over ~20MB through the dashboard (git isn't for
> huge files). Put long videos on YouTube/Vimeo and use the YouTube ID / link
> field instead. Your showreel is already compressed and self-hosted.

---

## 2. Add your own content (all inside index.html)

Search the file for `TODO` — every spot you need to touch is marked.

1. **Projects (the work grid).** Near the bottom, find `const PROJECTS = [ ... ]`.
   Each item is one card:
   ```js
   { title:"Your project", type:"film", blurb:"Short line about it.", link:"https://player.vimeo.com/video/XXXX" }
   ```
   `type` must be one of: `film`, `brand`, `motion`, `digital` (that's what the
   filters use). `link` is optional — add a Vimeo/YouTube embed URL and it opens
   in the lightbox when clicked.

2. **Images.** Drop files in `assets/` and swap the placeholder tiles. For example,
   replace a `<div class="tile">…</div>` in the journey with:
   ```html
   <img src="assets/aljazeera-still.jpg" alt="Al Jazeera film still" />
   ```

3. **Showreel.** In the Reel section, replace the placeholder block with your embed
   (the exact snippet is in a comment right there).

4. **Portrait + about.** Swap the `.portrait` placeholder for `assets/luay.jpg` and
   tweak the About text.

5. **Email.** Confirm which address you want public (currently `luaysalha@gmail.com`).

---

## 3. Publish free on GitHub Pages

1. Create a GitHub account if you don't have one.
2. Create a new repository. Two options for the URL:
   - Name it `portfolio` → site lives at `https://<username>.github.io/portfolio/`
   - Name it `<username>.github.io` → site lives at `https://<username>.github.io/`
3. Upload these files (drag-and-drop works: **Add file → Upload files**), or use git:
   ```bash
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
4. In the repo: **Settings → Pages → Build and deployment**. Set **Source =
   Deploy from a branch**, **Branch = main**, folder **/(root)**. Save.
5. Wait ~1 minute, refresh, and your live URL appears at the top of that page.

---

## 4. (Optional) Point askluay.nl at this site — fixes your dead domain

You can retire the old Adobe Portfolio and use your own domain on the new site.

1. Rename the file `CNAME.example` to `CNAME` (or create a file called `CNAME`)
   containing just one line:
   ```
   askluay.nl
   ```
2. At your domain registrar (wherever you bought askluay.nl), set DNS:
   - Four `A` records for the apex `askluay.nl` pointing to GitHub's IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One `CNAME` record for `www` → `<username>.github.io`
3. Back in **Settings → Pages → Custom domain**, enter `askluay.nl`, save, and tick
   **Enforce HTTPS** once it's available (can take up to a few hours to propagate).

> Note: the `A` record IPs above are GitHub's published Pages addresses. If GitHub
> changes them, use whatever their current docs list under "Managing a custom domain".

---

## 5. Design notes

- Fonts: Newsreader (serif, display) + Archivo (sans, body), loaded from Google Fonts.
- Colours are CSS variables at the very top of `index.html` (`--navy`, `--amber`,
  `--sand`, etc.). Change them in one place to re-skin the whole site.
- Interactions: scroll-reveal, a route line that fills as you move through the
  journey, a progress bar, filterable grid, and a lightbox, all vanilla JS,
  and they respect "reduce motion" accessibility settings.

## 6. The interactive "communication" pieces

Three things make a visitor feel part of the story and give them a takeaway:

1. **Multilingual hello** in the hero, cycling through languages (مرحبا · Hallo · Bonjour · こんにちは …). Edit the `HELLOS` array in the script to add or reorder.
2. **Journey pass** — as visitors scroll the three chapters they "collect" Damascus, Beirut and The Hague stamps, with a live counter.
3. **A postcard across borders** — visitors add their name, pick a word and a language, and download a personalised, branded postcard (drawn on a `<canvas>`). Edit the greeting languages in the `GREETINGS` object and the word chips in the HTML.

> Note on downloads: the "Download my postcard" button works on the live hosted
> site (and when you open index.html directly in a browser). Inside the chat preview
> panel, browser downloads are sandboxed and may not trigger — that's a preview
> limitation, not a bug. Test it on GitHub Pages or by opening the file locally.

> Fonts: the canvas postcard uses Newsreader/Archivo once they load from Google
> Fonts. If you ever host somewhere fully offline, self-host the font files.

## 7. Videos

Video project cards open their source in a **new tab** (`href` in the `PROJECTS`
list). This is deliberate: some of your videos (a YouTube with embedding disabled,
Adobe Portfolio's own player) refuse to embed on other domains and would show an
error. Opening the source always works.

If you want a video to **play inline** in the on-page lightbox instead, upload it
to **Vimeo** (or a YouTube that allows embedding) and give that project a
`link:"https://player.vimeo.com/video/XXXX"` instead of `href`. Your showreel in
the Reel section is the best candidate for a real inline embed.
