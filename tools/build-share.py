#!/usr/bin/env python3
"""Add social share previews to every project page.

For each portfolio/projects/*.html it renders a 1200x630 share card
(assets/share/<slug>.jpg) with headless Chrome, then injects Open Graph /
Twitter meta tags, a Share button and share.js. Safe to re-run.

Usage: python3 tools/build-share.py
"""
import html, json, pathlib, re, subprocess, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent / "portfolio"
SITE = "https://luaysalha.github.io/askluay-portfolio/"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
projects = {p.get("projectPage"): p for p in json.loads((ROOT / "data/projects.json").read_text())["projects"]}

CARD = """<!doctype html><meta charset=utf-8><style>
@font-face{{font-family:Nohemi;src:url('{font}')}}
*{{box-sizing:border-box;margin:0}}
body{{width:1200px;height:630px;background:#141818;color:#f3f4ef;font:26px/1.4 system-ui,sans-serif;display:flex;overflow:hidden}}
.t{{flex:1;padding:64px 56px 56px 72px;display:flex;flex-direction:column}}
.e{{text-transform:uppercase;letter-spacing:.14em;font-size:20px;color:#efa8bd}}
h1{{font:400 {size}px/1.08 Nohemi,sans-serif;letter-spacing:-.035em;margin-top:26px}}
.r{{color:#b5ef52;margin-top:22px;font-size:24px}}
.n{{margin-top:auto;font:400 30px Nohemi,sans-serif;display:flex;align-items:center;gap:14px}}
.n i{{width:14px;height:14px;border-radius:50%;background:#b5ef52}}
.n small{{font:20px system-ui;color:#9aa39b}}
.m{{width:470px;margin:40px 40px 40px 0;border-radius:28px;overflow:hidden;background:{mbg};display:flex;align-items:center;justify-content:center}}
.m img{{width:100%;height:100%;object-fit:{fit}}}
.m.c img{{width:78%;height:78%}}
.m b{{font:400 54px/1.1 Nohemi,sans-serif;color:#141818;padding:44px;letter-spacing:-.03em}}
.m b small{{display:block;font:18px system-ui;letter-spacing:.1em;text-transform:uppercase;margin-bottom:22px}}
</style><div class=t><p class=e>{type}</p><h1>{title}</h1><p class=r>{role}</p>
<p class=n><i></i>Luay Salha <small>Designer · Director · Editor</small></p></div>{media}"""

def card_media(p):
    yt = p.get("yt")
    src = p.get("img") or p.get("poster")
    if yt:
        return ('<div class=m><img src="https://img.youtube.com/vi/%s/maxresdefault.jpg" '
                'onload="if(this.naturalWidth<200)this.src=this.src.replace(\'maxresdefault\',\'hqdefault\')" '
                'onerror="this.src=this.src.replace(\'maxresdefault\',\'hqdefault\')"></div>' % yt), "cover", "#222"
    if src:
        if not src.startswith("http"):
            src = (ROOT / "x").as_uri()[:-1] + src
        contain = p.get("fit") == "contain"
        cls = "m c" if contain else "m"
        return '<div class="%s"><img src="%s"></div>' % (cls, html.escape(src)), ("contain" if contain else "cover"), ("#f3f4ef" if contain else "#222")
    label = p.get("titleCard") or p.get("director") and "A film by " + p["director"] or "Project"
    return '<div class=m><b><small>%s</small>%s</b></div>' % (html.escape(label), html.escape(p["title"])), "cover", "#b5ef52"

def render(slug, p):
    media, fit, mbg = card_media(p)
    title = p["title"]
    size = 76 if len(title) < 18 else 62 if len(title) < 30 else 52
    doc = CARD.format(font=(ROOT / "assets/fonts/nohemi-regular.woff2").as_uri(), size=size, mbg=mbg, fit=fit,
                      type=html.escape(" + ".join(p.get("categories") or [p.get("type", "work")])),
                      title=html.escape(title), role=html.escape(p.get("role") or ""), media=media)
    with tempfile.TemporaryDirectory() as tmp:
        page, png = pathlib.Path(tmp) / "card.html", pathlib.Path(tmp) / "card.png"
        page.write_text(doc)
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
                        "--window-size=1200,630", "--virtual-time-budget=8000", "--screenshot=%s" % png, page.as_uri()],
                       check=True, capture_output=True, timeout=90)
        out = ROOT / "assets/share" / (slug + ".jpg")
        subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "82", str(png), "--out", str(out)],
                       check=True, capture_output=True)
    return out

META = re.compile(r"<!--share-->.*?<!--/share-->", re.S)
BTN = '<p class="share-row"><button type="button" class="share-btn" data-share>Share this project <span aria-hidden="true">↗</span></button><span class="share-status" role="status" aria-live="polite"></span></p>'

for f in sorted((ROOT / "projects").glob("*.html")):
    rel = "projects/" + f.name
    p = projects.get(rel)
    if not p:
        print("skip (not in projects.json):", f.name); continue
    render(f.stem, p)
    h = f.read_text()
    title = html.escape(p["title"] + " — Luay Salha", quote=True)
    desc = re.search(r'<meta name="description" content="([^"]*)"', h).group(1)
    img = SITE + "assets/share/" + f.stem + ".jpg"
    meta = ('<!--share--><meta property="og:type" content="article"><meta property="og:site_name" content="Luay Salha">'
            '<meta property="og:title" content="%s"><meta property="og:description" content="%s">'
            '<meta property="og:url" content="%s"><meta property="og:image" content="%s">'
            '<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
            '<meta property="og:image:alt" content="%s"><meta name="twitter:card" content="summary_large_image"><!--/share-->'
            % (title, desc, SITE + rel, img, title))
    h = META.sub("", h).replace('<link rel="stylesheet"', meta + '<link rel="stylesheet"', 1)
    h = re.sub(r"project-story\.css\?v=\d+", "project-story.css?v=2", h)
    if "data-share" not in h:
        h = h.replace('</div><div class="media">', BTN + '</div><div class="media">', 1)
    if "share.js" not in h:
        h = h.replace("</body>", '<script src="../share.js?v=1" defer></script></body>')
    f.write_text(h)
    print("ok", f.name)
