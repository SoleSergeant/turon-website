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


# ---- Technical concepts -------------------------------------------------
# Each symbol is drawn in a 100x100 box; wordmarks and tiles scale it.

def sym(c, fg, accent, bg):
    if c == 'brackets':  # <v>
        sw = 11
        d, _ = text('v', 62, 800, 0, 0)
        g = FONTS[800].getGlyphSet(); bp = BoundsPen(g); g['v'].draw(bp)
        k = 62 / 1000; gw = (bp.bounds[2] - bp.bounds[0]) * k; gh = bp.bounds[3] * k
        return (f'<path d="M24 26 6 50l18 24M76 26l18 24-18 24" fill="none" stroke="{accent}" '
                f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'
                f'<path fill="{fg}" transform="translate({50 - gw/2 - bp.bounds[0]*k:.2f} {50 + gh/2:.2f})" d="{d}"/>')
    if c == 'terminal':  # window dots + prompt >v
        d, _ = text('v', 62, 800, 0, 0)
        return (''.join(f'<circle cx="{10 + i*13}" cy="12" r="5" fill="{fg}" opacity="{0.35 if i else 1}"/>' for i in range(3))
                + f'<path d="M8 40l22 20-22 20" fill="none" stroke="{accent}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>'
                + f'<path fill="{fg}" transform="translate(40 83)" d="{d}"/>')
    if c == 'pixel':  # 7x6 bitmap V, last pixel lit in the accent
        rows = [(0, 1, 5, 6), (0, 1, 5, 6), (1, 2, 4, 5), (1, 2, 4, 5), (2, 3, 4), (3,)]
        p, s, out = 14.4, 13.2, []
        for r, cols in enumerate(rows):
            for col in cols:
                out.append(f'<rect x="{col*p:.1f}" y="{8 + r*p + (4 if r == 5 else 0):.1f}" width="{s}" height="{s}" rx="2" '
                           f'fill="{accent if r == 5 else fg}"/>')
        return ''.join(out)
    if c == 'merge':  # two branches merge into one: people + AI -> project
        return (f'<path d="M18 16 50 82 82 16" fill="none" stroke="{fg}" stroke-width="13" '
                f'stroke-linecap="round" stroke-linejoin="round"/>'
                f'<circle cx="18" cy="16" r="12" fill="{fg}"/><circle cx="82" cy="16" r="12" fill="{fg}"/>'
                f'<circle cx="50" cy="82" r="15" fill="{accent}" stroke="{bg}" stroke-width="5"/>')


def tech_lockup(c, fg, accent, sub, bg):
    S = 120
    if c == 'brackets':  # <vibe/> written out
        d, w = text('vibe', S, 800, 54, 96)
        x = 54 + w + 12
        body = (f'<path d="M30 30 8 60l22 30" fill="none" stroke="{accent}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>'
                f'<path fill="{fg}" d="{d}"/>'
                f'<path d="M{x+26} 24 {x+6} 96M{x+42} 30l22 30-22 30" fill="none" stroke="{accent}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>')
        d2, _ = text('turon', 34, 500, 58, 150, track=0.32)
        return x + 72, 168, body + f'<path fill="{sub}" d="{d2}"/>'
    if c == 'terminal':  # > vibe
        d, w = text('vibe', S, 800, 66, 96)
        body = (f'<path d="M10 34l30 26-30 26" fill="none" stroke="{accent}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>'
                f'<path fill="{fg}" d="{d}"/>')
        d2, _ = text('turon', 34, 500, 70, 150, track=0.32)
        return 66 + w + 4, 168, body + f'<path fill="{sub}" d="{d2}"/>'
    body = f'<g transform="translate(0 8) scale(0.92)">{sym(c, fg, accent, bg)}</g>'
    d, w = text('vibe', S, 800, 118, 96)
    d2, _ = text('turon', 34, 500, 122, 150, track=0.32)
    return 118 + w + 4, 168, body + f'<path fill="{fg}" d="{d}"/><path fill="{sub}" d="{d2}"/>'


def tech_tile(c, bg, fg, accent):
    sc = 0.46 if c != 'terminal' else 0.5
    off = 32 - 50 * sc
    return (f'<rect width="64" height="64" rx="14" fill="{bg}"/>'
            f'<g transform="translate({off:.2f} {off:.2f}) scale({sc})">{sym(c, fg, accent, bg)}</g>')


for c in ['brackets', 'terminal', 'pixel', 'merge']:
    for mode, (fg, acc, sub, bg) in {'light': (NAVY, VIOLET, VIOLET, WHITE),
                                     'dark': (WHITE, VIOLET_L, VIOLET_L, NAVY)}.items():
        w, h, body = tech_lockup(c, fg, acc, sub, bg)
        save(f'{c}-wordmark-{mode}', w, h, body)
    save(f'{c}-icon-violet', 64, 64, tech_tile(c, VIOLET, WHITE, '#D0BFFF' if c == 'pixel' else WHITE if c != 'merge' else NAVY))
    save(f'{c}-icon-navy', 64, 64, tech_tile(c, NAVY, WHITE, VIOLET_L))


# ---- Round 3: culture + hackathon tropes ---------------------------------

def glyph(ch, size, weight=800):
    """Outline one glyph centred on (0,0)."""
    f = FONTS[weight]; gs = f.getGlyphSet(); g = f.getBestCmap()[ord(ch)]
    bp = BoundsPen(gs); gs[g].draw(bp); k = size / 1000
    x0, y0, x1, y1 = bp.bounds
    d, _ = text(ch, size, weight, -(x0 + x1) / 2 * k, (y0 + y1) / 2 * k)
    return d


def sym3(c, fg, accent, bg, uid='a'):
    if c == 'ikat':  # Margilan ikat silk: V woven from threads with dye-bleed (feathered) ends
        import random
        rnd = random.Random(7)
        out, pitch, h = [], 5.6, 3.8
        def lerp(p0, p1, y):
            return p0[0] + (p1[0] - p0[0]) * (y - p0[1]) / (p1[1] - p0[1])
        y, row = 4.0, 0
        while y < 95:
            yc = y + h / 2
            ol = lerp((0, 4), (37, 96), yc); orr = 100 - ol
            spans = [(ol, orr)]
            if yc < 60:
                il = lerp((27, 4), (50, 60), yc); spans = [(ol, il), (100 - il, orr)]
            band = 6 <= row <= 9
            for x0, x1 in spans:
                j0, j1 = rnd.uniform(-5, 3), rnd.uniform(-3, 5)
                out.append(f'<rect x="{x0 + j0:.1f}" y="{y:.1f}" width="{max(2, x1 - x0 - j0 + j1):.1f}" '
                           f'height="{h}" rx="1.6" fill="{accent if band else fg}"/>')
            y += pitch; row += 1
        return ''.join(out)
    if c == 'clock':  # 10:10, the hands make a V: the hackathon clock
        return (f'<circle cx="50" cy="50" r="42" fill="none" stroke="{fg}" stroke-width="9"/>'
                f'<path d="M50 14v7" stroke="{fg}" stroke-width="6" stroke-linecap="round"/>'
                f'<path d="M26 32 50 54 78 26" fill="none" stroke="{accent}" stroke-width="10" '
                f'stroke-linecap="round" stroke-linejoin="round"/>'
                f'<circle cx="50" cy="54" r="7" fill="{fg}"/>')
    if c == 'anor':  # pomegranate with a V-shaped slice showing the seeds (ideas)
        seeds = []
        for r, (y, xs) in enumerate([(50, (39, 50, 61)), (60, (44, 56)), (70, (50,))]):
            for x in xs:
                seeds.append(f'<rect x="{x-4}" y="{y-4}" width="8" height="8" rx="2.5" fill="{accent}"/>')
        return (f'<path fill="{fg}" d="M38 26 40 10l6 9 4-11 4 11 6-9 2 16z"/>'
                f'<circle cx="50" cy="60" r="37" fill="{fg}"/>'
                f'<path fill="{bg}" d="M28 42h44L50 80z" stroke="{bg}" stroke-width="4" stroke-linejoin="round"/>'
                + ''.join(seeds))
    if c == 'rishtan':  # Rishtan ceramic plate: a rosette of eight Vs
        out = [f'<circle cx="50" cy="50" r="47" fill="none" stroke="{fg}" stroke-width="4"/>']
        for i in range(8):
            col = accent if i % 2 == 0 else fg
            out.append(f'<path transform="rotate({i*45} 50 50)" d="M40 9 50 27 60 9" fill="none" '
                       f'stroke="{col}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>')
        out.append(f'<circle cx="50" cy="50" r="10" fill="{accent}"/>')
        return ''.join(out)
    if c == 'stamp':  # sticker / passport stamp with ring text
        f = FONTS[800]; gs = f.getGlyphSet(); cmap = f.getBestCmap(); hm = f['hmtx']
        s = 'VIBE TURON · FERGANA · 2027 · '
        size, R = 10.5, 39
        k = size / 1000
        adv = [hm[cmap[ord(ch)]][0] * k + (1.6 if ch != ' ' else 0) for ch in s]
        tot = sum(adv); scale = (2 * math.pi * R) / tot
        out = [f'<circle cx="50" cy="50" r="48" fill="none" stroke="{fg}" stroke-width="3"/>',
               f'<circle cx="50" cy="50" r="29" fill="none" stroke="{fg}" stroke-width="2"/>']
        a = -math.pi / 2
        for ch, w in zip(s, adv):
            mid = a + (w * scale / 2) / R
            if ch == '·':
                out.append(f'<circle cx="{50 + R*math.cos(mid):.2f}" cy="{50 + R*math.sin(mid):.2f}" r="1.8" fill="{accent}"/>')
            elif ch != ' ':
                d = glyph(ch, size)
                out.append(f'<path fill="{fg}" transform="translate({50 + R*math.cos(mid):.2f} {50 + R*math.sin(mid):.2f}) '
                           f'rotate({math.degrees(mid) + 90:.2f}) translate(0 0)" d="{d}"/>')
            a += w * scale / R
        out.append(f'<path fill="{accent}" transform="translate(50 52)" d="{glyph("v", 40)}"/>')
        return ''.join(out)
    if c == 'glitch':  # v sliced and shifted, with a violet echo
        d = glyph('v', 104)
        cuts = [(0, 26, 0), (26, 44, -7), (44, 58, 5), (58, 74, -3), (74, 100, 0)]
        out = [f'<defs>' + ''.join(f'<clipPath id="{uid}{i}"><rect x="-10" y="{y0}" width="120" height="{y1-y0}"/></clipPath>'
                                   for i, (y0, y1, _) in enumerate(cuts)) + '</defs>']
        out.append(f'<path fill="{accent}" transform="translate(57 52)" d="{d}"/>')
        for i, (y0, y1, dx) in enumerate(cuts):
            out.append(f'<g clip-path="url(#{uid}{i})"><path fill="{fg}" transform="translate({50+dx} 52)" d="{d}"/></g>')
        return ''.join(out)


import math
R3 = ['ikat', 'clock', 'anor', 'rishtan', 'stamp', 'glitch']
for c in R3:
    for mode, (fg, acc, sub, bg) in {'light': (NAVY, VIOLET, VIOLET, WHITE),
                                     'dark': (WHITE, VIOLET_L, VIOLET_L, NAVY)}.items():
        body = f'<g transform="translate(0 8) scale(0.92)">{sym3(c, fg, acc, bg, "w" + mode[0])}</g>'
        d, w = text('vibe', 120, 800, 118, 96)
        d2, _ = text('turon', 34, 500, 122, 150, track=0.32)
        save(f'{c}-wordmark-{mode}', 118 + w + 4, 168, body + f'<path fill="{fg}" d="{d}"/><path fill="{sub}" d="{d2}"/>')
    for name, (bg, fg, acc) in {'violet': (VIOLET, WHITE, NAVY if c not in ('stamp', 'glitch') else '#D0BFFF'),
                                'navy': (NAVY, WHITE, VIOLET_L)}.items():
        sc = 0.62 if c == 'stamp' else 0.52
        off = 32 - 50 * sc
        save(f'{c}-icon-{name}', 64, 64, f'<rect width="64" height="64" rx="14" fill="{bg}"/>'
             f'<g transform="translate({off:.2f} {off:.2f}) scale({sc})">{sym3(c, fg, acc, bg, "i" + name[0])}</g>')
