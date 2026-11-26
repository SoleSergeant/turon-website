"""Generate Vibe Turon logo concepts as SVG (text outlined to paths).
Needs fonttools and fonts/Unbounded-500.ttf + Unbounded-800.ttf next to this file
(static instances of the Google Fonts variable font). Usage: python3 gen.py <out-dir>"""
import os, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FD = os.path.join(os.path.dirname(__file__), 'fonts')
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
FONTS = {w: TTFont(f'{FD}/Unbounded-{w}.ttf') for w in (500, 800)}

NAVY, VIOLET, VIOLET_L, WHITE, INK = '#283480', '#6741D9', '#B197FC', '#FFFFFF', '#283480'


def text(s, size, weight=800, x=0, y=0, track=0.0):
    """Outline `s` with baseline at y. Returns (path_d, width)."""
    f = FONTS[weight]; gs = f.getGlyphSet(); cmap = f.getBestCmap(); hmtx = f['hmtx']
    k = size / f['head'].unitsPerEm
    pen = SVGPathPen(gs)
    cx = 0
    for ch in s:
        g = cmap[ord(ch)]
        gs[g].draw(TransformPen(pen, (k, 0, 0, -k, x + cx, y)))
        cx += hmtx[g][0] * k + track * size
    return pen.getCommands(), cx - track * size


def ink_right(s, size, weight=800):
    """Right edge of the ink of the last glyph (for placing accents)."""
    f = FONTS[weight]; gs = f.getGlyphSet(); cmap = f.getBestCmap(); hmtx = f['hmtx']
    k = size / f['head'].unitsPerEm
    adv = sum(hmtx[cmap[ord(c)]][0] for c in s[:-1]) * k
    bp = BoundsPen(gs); gs[cmap[ord(s[-1])]].draw(bp)
    return adv + bp.bounds[2] * k


def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:g} {h:g}" '
            f'role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n')


def save(name, w, h, body, title='Vibe Turon'):
    with open(f'{OUT}/{name}.svg', 'w') as fh:
        fh.write(svg(w, h, body, title))


def sparkle(cx, cy, r, fill):
    """Four-point star (concave sides)."""
    q = r * 0.22
    return (f'<path fill="{fill}" d="M{cx} {cy-r}Q{cx+q} {cy-q} {cx+r} {cy}'
            f'Q{cx+q} {cy+q} {cx} {cy+r}Q{cx-q} {cy+q} {cx-r} {cy}Q{cx-q} {cy-q} {cx} {cy-r}Z"/>')


def eq_v(x, y, h, fill, accent):
    """Five equalizer bars whose tops trace a V; the centre bar is the accent."""
    n, bw, gap = 5, h * 0.17, h * 0.065
    heights = [1.0, 0.68, 0.36, 0.68, 1.0]
    out = []
    for i, hh in enumerate(heights):
        bx = x + i * (bw + gap); bh = h * hh
        out.append(f'<rect x="{bx:.2f}" y="{y + h - bh:.2f}" width="{bw:.2f}" height="{bh:.2f}" '
                   f'rx="{bw/2:.2f}" fill="{accent if i == 2 else fill}"/>')
    return ''.join(out), n * bw + (n - 1) * gap


def lockup(concept, fg, accent, sub):
    """Horizontal wordmark: 'vibe' + accent, 'turon' underneath."""
    S = 120
    body = ''
    x0 = 0
    if concept == 'eq':
        bars, bw = eq_v(0, 8, 84, fg, accent)
        body += bars; x0 = bw + 26
    d, w = text('vibe', S, 800, x0, 96)
    body += f'<path fill="{fg}" d="{d}"/>'
    right = x0 + ink_right('vibe', S)
    if concept == 'cursor':
        body += f'<rect x="{right + 12:.1f}" y="80" width="52" height="16" rx="3" fill="{accent}"/>'
        right += 64
    elif concept == 'spark':
        body += sparkle(right + 34, 22, 22, accent); right += 56
    elif concept == 'bubble':
        pass
    d2, w2 = text('turon', 34, 500, x0 + 4, 150, track=0.32)
    body += f'<path fill="{sub}" d="{d2}"/>'
    width = max(right, x0 + w) + 4
    return width, 168, body


def tile(concept, bg, fg, accent, rx=14):
    """64x64 avatar / favicon tile."""
    b = f'<rect width="64" height="64" rx="{rx}" fill="{bg}"/>'
    if concept == 'eq':
        bars, bw = eq_v(0, 0, 32, fg, accent)
        b += f'<g transform="translate({32 - bw/2:.2f} 16)">{bars}</g>'
        return b
    d, w = text('v', 40, 800, 0, 0)
    vb = BoundsPen(FONTS[800].getGlyphSet()); FONTS[800].getGlyphSet()[FONTS[800].getBestCmap()[ord('v')]].draw(vb)
    k = 40 / 1000; gw = (vb.bounds[2] - vb.bounds[0]) * k; gh = (vb.bounds[3] - vb.bounds[1]) * k
    if concept == 'cursor':
        tx, ty = 32 - (gw + 17) / 2 - vb.bounds[0] * k, 32 + gh / 2
        b += f'<path fill="{fg}" transform="translate({tx:.2f} {ty:.2f})" d="{d}"/>'
        b += f'<rect x="{tx + vb.bounds[2]*k + 2:.2f}" y="{ty - 5.5:.2f}" width="15" height="5.5" rx="1.2" fill="{accent}"/>'
    elif concept == 'spark':
        tx, ty = 30 - gw / 2 - vb.bounds[0] * k, 36 + gh / 2
        b += f'<path fill="{fg}" transform="translate({tx:.2f} {ty:.2f})" d="{d}"/>'
        b += sparkle(47, 17, 8, accent)
    elif concept == 'bubble':
        # speech bubble with a v inside: "talk to AI, build"
        b += (f'<path fill="{accent}" d="M14 16h36a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H30l-9 8v-8h-7'
              f'a6 6 0 0 1-6-6V22a6 6 0 0 1 6-6z"/>')
        d, _ = text('v', 26, 800, 0, 0)
        gw2 = (vb.bounds[2] - vb.bounds[0]) * 26 / 1000; gh2 = (vb.bounds[3] - vb.bounds[1]) * 26 / 1000
        b += f'<path fill="{bg}" transform="translate({32 - gw2/2 - vb.bounds[0]*26/1000:.2f} {31 + gh2/2:.2f})" d="{d}"/>'
    return b


def bubble_lockup(fg, accent, sub, inner):
    S = 120
    bub = (f'<path fill="{accent}" d="M18 8h104a18 18 0 0 1 18 18v62a18 18 0 0 1-18 18H62l-26 24v-24H18'
           f'a18 18 0 0 1-18-18V26A18 18 0 0 1 18 8z"/>')
    vd, _ = text('v', 84, 800, 0, 0)
    vb = BoundsPen(FONTS[800].getGlyphSet()); FONTS[800].getGlyphSet()['v'].draw(vb)
    k = 84 / 1000; gw = (vb.bounds[2] - vb.bounds[0]) * k; gh = vb.bounds[3] * k
    bub += f'<path fill="{inner}" transform="translate({70 - gw/2 - vb.bounds[0]*k:.2f} {57 + gh/2:.2f})" d="{vd}"/>'
    d, w = text('vibe', S, 800, 166, 96)
    d2, _ = text('turon', 34, 500, 170, 150, track=0.32)
    return 166 + w + 4, 168, bub + f'<path fill="{fg}" d="{d}"/><path fill="{sub}" d="{d2}"/>'


CONCEPTS = ['cursor', 'eq', 'spark', 'bubble']
for c in CONCEPTS:
    for mode, (fg, acc, sub) in {'light': (NAVY, VIOLET, VIOLET), 'dark': (WHITE, VIOLET_L, VIOLET_L)}.items():
        if c == 'bubble':
            inner = WHITE if mode == 'light' else NAVY
            w, h, body = bubble_lockup(fg, acc, sub, inner)
        else:
            w, h, body = lockup(c, fg, acc, sub)
        save(f'{c}-wordmark-{mode}', w, h, body)
    if c == 'bubble':
        save(f'{c}-icon-violet', 64, 64, tile(c, '#F0EBFF', NAVY, VIOLET))
    else:
        save(f'{c}-icon-violet', 64, 64, tile(c, VIOLET, WHITE, WHITE if c != 'eq' else '#D0BFFF'))
    save(f'{c}-icon-navy', 64, 64, tile(c, NAVY, WHITE, VIOLET_L))
print('ok', sorted(os.listdir(OUT)))
