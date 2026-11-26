"""Build the Vibe Turon logo set (concept N, "Glitch").

Needs: fonttools, and Unbounded static instances at fonts/Unbounded-500.ttf and
fonts/Unbounded-800.ttf next to this file (from the Google Fonts variable font:
fontTools.varLib.instancer, wght=500 / 800). PNGs are rendered with Playwright.
Usage: python3 build.py
"""
import os, subprocess, json
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

HERE = os.path.dirname(os.path.abspath(__file__))
SVG, PNG = os.path.join(HERE, 'svg'), os.path.join(HERE, 'png')
os.makedirs(SVG, exist_ok=True); os.makedirs(PNG, exist_ok=True)
FONTS = {w: TTFont(os.path.join(HERE, f'fonts/Unbounded-{w}.ttf')) for w in (500, 800)}

NAVY, VIOLET, VIOLET_L, WHITE = '#283480', '#6741D9', '#B197FC', '#FFFFFF'


def text(s, size, weight=800, x=0, y=0, track=0.0):
    f = FONTS[weight]; gs = f.getGlyphSet(); cmap = f.getBestCmap(); hm = f['hmtx']
    k = size / f['head'].unitsPerEm
    pen = SVGPathPen(gs); cx = 0
    for ch in s:
        g = cmap[ord(ch)]
        gs[g].draw(TransformPen(pen, (k, 0, 0, -k, x + cx, y)))
        cx += hm[g][0] * k + track * size
    return pen.getCommands(), cx - track * size


def vglyph():
    """The Unbounded 800 'v', scaled so its ink box is exactly 100 wide, top-left at 0,0."""
    f = FONTS[800]; gs = f.getGlyphSet(); g = f.getBestCmap()[ord('v')]
    bp = BoundsPen(gs); gs[g].draw(bp); x0, y0, x1, y1 = bp.bounds
    k = 100 / (x1 - x0)
    pen = SVGPathPen(gs); gs[g].draw(TransformPen(pen, (k, 0, 0, -k, -x0 * k, y1 * k)))
    return pen.getCommands(), (y1 - y0) * k   # path, height


V, VH = vglyph()

# Slices of the v: (top, bottom) as a share of its height, and the sideways shift.
FULL = [(0.00, 0.30, 0), (0.33, 0.52, -9), (0.55, 0.74, 6), (0.77, 1.00, 0)]
SMALL = [(0.00, 0.40, 0), (0.45, 0.66, -11), (0.71, 1.00, 0)]   # for 16-32 px
ECHO = 7  # violet copy shifted right


def mark(fg, echo, uid, slices=FULL):
    """The glitch v in a 100 x VH box (shifts may overhang by ~10)."""
    defs = ''.join(f'<clipPath id="{uid}{i}"><rect x="-20" y="{a*VH:.2f}" width="140" height="{(b-a)*VH:.2f}"/></clipPath>'
                   for i, (a, b, _) in enumerate(slices))
    out = [f'<defs>{defs}</defs>']
    if echo:
        out += [f'<g clip-path="url(#{uid}{i})"><path fill="{echo}" transform="translate({dx + ECHO} 0)" d="{V}"/></g>'
                for i, (a, b, dx) in enumerate(slices)]
    out += [f'<g clip-path="url(#{uid}{i})"><path fill="{fg}" transform="translate({dx} 0)" d="{V}"/></g>'
            for i, (a, b, dx) in enumerate(slices)]
    return ''.join(out)


def svg(w, h, body, title='Vibe Turon'):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:g} {h:g}" width="{w:g}" height="{h:g}" '
            f'role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n')


def save(name, w, h, body):
    with open(os.path.join(SVG, name + '.svg'), 'w') as fh:
        fh.write(svg(w, h, body))


# Colour schemes: (mark, echo, word "vibe", word "turon")
SCHEMES = {
    'light': (NAVY, VIOLET, NAVY, VIOLET),          # on white / light backgrounds
    'dark': (WHITE, VIOLET_L, WHITE, VIOLET_L),      # on navy
    'mono-navy': (NAVY, None, NAVY, NAVY),            # one colour (print, stamps, embroidery)
    'mono-white': (WHITE, None, WHITE, WHITE),
}

# 1. Horizontal lockup: mark + vibe / turon
for name, (fg, echo, word, sub) in SCHEMES.items():
    mh = 84; s = mh / VH
    body = f'<g transform="translate(10 {12 + (96 - 12 - mh) / 2 + 6:.2f}) scale({s:.4f})">{mark(fg, echo, "h")}</g>'
    x = 10 + 100 * s + 34
    d, w = text('vibe', 120, 800, x, 96)
    d2, _ = text('turon', 34, 500, x + 4, 150, track=0.32)
    body += f'<path fill="{word}" d="{d}"/><path fill="{sub}" d="{d2}"/>'
    save(f'vibe-turon-logo-{name}', round(x + w + 10), 168, body)

# 2. Stacked lockup: mark above, text centred
for name, (fg, echo, word, sub) in SCHEMES.items():
    d, w = text('vibe', 120, 800, 0, 0); W = w + 40
    _, w2 = text('turon', 34, 500, 0, 0, track=0.32)
    mw = 150; s = mw / 100
    body = f'<g transform="translate({(W - mw) / 2:.2f} 20) scale({s})">{mark(fg, echo, "s")}</g>'
    top = 20 + VH * s + 146
    d, _ = text('vibe', 120, 800, 20, top)
    d2, _ = text('turon', 34, 500, (W - w2) / 2, top + 54, track=0.32)
    body += f'<path fill="{word}" d="{d}"/><path fill="{sub}" d="{d2}"/>'
    save(f'vibe-turon-logo-stacked-{name}', round(W), round(top + 74), body)

# 3. Mark alone (transparent)
for name, (fg, echo, _, _) in SCHEMES.items():
    save(f'vibe-turon-mark-{name}', 120, round(VH + 4), f'<g transform="translate(10 2)">{mark(fg, echo, "m")}</g>')


# 4. App icon / avatar tiles: full-bleed square (platforms round the corners or crop a circle).
def tile(bg, fg, echo, slices=FULL, size=64, frac=0.56, rx=0):
    s = size * frac / 100
    oy = (size - VH * s) / 2
    return (f'<rect width="{size}" height="{size}" rx="{rx}" fill="{bg}"/>'
            f'<g transform="translate({(size - 100 * s) / 2:.2f} {oy:.2f}) scale({s:.4f})">{mark(fg, echo, "t", slices)}</g>')


save('vibe-turon-icon-violet', 64, 64, tile(VIOLET, WHITE, '#D0BFFF'))
save('vibe-turon-icon-navy', 64, 64, tile(NAVY, WHITE, VIOLET))
# Favicon: rounded tile, simpler 3-slice mark that survives 16 px.
save('favicon', 64, 64, tile(VIOLET, WHITE, NAVY, SMALL, frac=0.66, rx=14))

# 5. PNG exports
jobs = [
    ('favicon.svg', 'favicon-32.png', 32, 32, None),
    ('favicon.svg', 'favicon-16.png', 16, 16, None),
    ('vibe-turon-icon-violet.svg', 'apple-touch-icon-180.png', 180, 180, None),
    ('vibe-turon-icon-violet.svg', 'avatar-violet-1080.png', 1080, 1080, None),
    ('vibe-turon-icon-navy.svg', 'avatar-navy-1080.png', 1080, 1080, None),
    ('vibe-turon-icon-violet.svg', 'icon-512.png', 512, 512, None),
]
for n in SCHEMES:
    jobs.append((f'vibe-turon-logo-{n}.svg', f'vibe-turon-logo-{n}.png', None, 300, None))
    jobs.append((f'vibe-turon-logo-stacked-{n}.svg', f'vibe-turon-logo-stacked-{n}.png', None, 800, None))

node = r'''
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const [svgDir,pngDir,jobs]=[process.argv[1],process.argv[2],JSON.parse(process.argv[3])];
(async()=>{const b=await chromium.launch();const p=await b.newPage();
for(const [src,out,w,h] of jobs){
  const s=fs.readFileSync(path.join(svgDir,src),'utf8');
  const m=s.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);const vw=+m[1],vh=+m[2];
  const H=h||Math.round(w*vh/vw), W=w||Math.round(h*vw/vh);
  await p.setViewportSize({width:W,height:H});
  await p.setContent(`<html><body style="margin:0;background:transparent">${s.replace(/width="[\d.]+" height="[\d.]+"/,`width="${W}" height="${H}"`)}</body></html>`);
  await p.screenshot({path:path.join(pngDir,out),omitBackground:true,clip:{x:0,y:0,width:W,height:H}});
}
await b.close();})();
'''
subprocess.run(['node', '-e', node, SVG, PNG, json.dumps(jobs)], check=True)
print('built', len(os.listdir(SVG)), 'svg,', len(os.listdir(PNG)), 'png')
