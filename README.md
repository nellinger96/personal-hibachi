# Personal Hibachi: bookhibachi.com

Static site with no build step. GSAP, ScrollTrigger, Flip and Lenis load from CDNs.

## Run locally

```sh
npx http-server -p 5173 -c-1
```

Open http://localhost:5173. Opening `index.html` straight from disk won't work because the videos need a server.

## Deploy

Push the folder to Vercel (or any static host). `vercel.json` redirects the old pages (`menu.html`, `info.html`, `heat.html`, `skill.html`, `party.html`) so existing Google links keep working.

## Files

| Path | What it is |
| --- | --- |
| `index.html`, `main.js` | Home page and its scroll scenes, quote builder and "latest" row |
| `gallery.html`, `gallery.js` | Video gallery with filters |
| `site.js` | Shared code: language toggle, smooth scroll, nav, video lightbox, desktop text popup (QR code) |
| `styles.css` | All styles |
| `assets/clips.js` | **List of every video.** The gallery and the "Latest" row read from it |
| `assets/video/` | Short silent loops (about 6–8 s, 540p) shown on the page |
| `assets/full/` | Full-length versions with sound, opened in the lightbox |
| `assets/img/` | Posters, photos, icons, share image |
| `assets/seq/` | 150 frames for the scroll-scrubbed tent setup |

## Adding a new Instagram reel

1. Download the reel as `NEW.mp4` and pick a good 6–8 second moment (start time `SS`, in seconds).
2. Make the three files (any ffmpeg works):

```sh
# silent loop for the page
ffmpeg -ss SS -t 7 -i NEW.mp4 -vf "scale=540:-2,fps=30" -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -an -movflags +faststart assets/video/my-clip.mp4
# poster frame
ffmpeg -ss 2 -i assets/video/my-clip.mp4 -frames:v 1 -q:v 5 assets/img/my-clip.jpg
# full version with sound for the lightbox (REEL_ID = the part after /reel/ in the Instagram URL)
ffmpeg -i NEW.mp4 -vf "scale=540:-2" -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p -c:a aac -b:a 80k -ac 1 -movflags +faststart assets/full/REEL_ID.mp4
```

3. Add a line at the **top** of `assets/clips.js`:

```js
{ id: 'my-clip', full: 'REEL_ID', ig: 'REEL_ID', date: '2026-11-02', cat: 'fire', en: 'English Title', es: 'Título en Español' },
```

The home page "Latest" row picks it up automatically (it shows the 6 newest reels), and so does the gallery's "Newest" filter.

## Things to confirm with Jorge

- "A family business" caption on the family photo, and the "The signature" badge on The Famous
- Stats: 30 years, 5K+ followers, 10+ cities
- More reviews (Google reviews would be ideal)
