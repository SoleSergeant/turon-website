const concepts = [
  ['cursor', 'A · Cursor', 'pick', '“vibe_” with a text cursor where turon. has its dot: you type an idea, AI helps it become a project. Closest sibling to the hub’s T + gold dot favicon.'],
  ['eq', 'B · Equalizer V', '', 'Five sound bars whose tops draw a V: the “vibe” (music, energy) and the letter in one symbol. Most distinctive icon; less obviously about building.'],
  ['spark', 'C · Spark', '', 'A four-point sparkle, the usual “AI” sign, as the accent. Instantly says “AI”, but it’s the most common mark around.'],
  ['bubble', 'D · Chat bubble', '', 'A v inside a speech bubble: you talk to AI and build. Friendly, reads well small, but feels more like a chat app than an event.'],
  ['brackets', 'E · Code tag', '', '“<vibe/>” written as an HTML tag; the tile is <v>. Says “code” to anyone who has opened an editor, though </> marks are common in dev branding.'],
  ['terminal', 'F · Terminal', '', 'A shell prompt “> vibe”; the tile is a terminal window (three dots) with >v. Clear “you type, it runs” story; the chevron is a strong, simple shape.'],
  ['pixel', 'G · Pixel V', '', 'A V drawn as a 7×6 bitmap, with the last pixel lit in violet like a cursor or LED. Very ownable, scales down cleanly, and has a playful hackathon feel.'],
  ['merge', 'H · Merge', '', 'Two git branches meeting at one violet node: you + AI (or a team) merge into one project. Clever for coders, but needs explaining to everyone else.'],
  ['ikat', 'I · Ikat V', 'pick', 'A V woven from feathered bands, like the ikat (atlas/adras) silk of Margilan in the Fergana region. Ikat’s blurred edges already look like a digital glitch, so it’s local craft and tech at once. Nobody else can own this.'],
  ['clock', 'J · 10:10', '', 'A clock at ten past ten, the classic watch-ad pose, where the hands form a V. Hackathons are all about the countdown; the ring also works as a timer graphic.'],
  ['anor', 'K · Anor', '', 'A pomegranate (anor) with a V-shaped slice cut out, showing the seeds: many small ideas inside one fruit. Warm, Uzbek, and could grow into a mascot.'],
  ['rishtan', 'L · Rishtan rosette', '', 'Eight Vs arranged like the pattern on a Rishtan ceramic plate (also in the Fergana region). From far away it reads as a spark or a star; close up, it’s Vs.'],
  ['stamp', 'M · Stamp', '', 'A round stamp/sticker: VIBE TURON · FERGANA · 2027 around a violet v. Built for laptop stickers and swag, which hackathon culture runs on. The ring text is too small for a 24px icon.'],
  ['glitch', 'N · Glitch', '', 'A v sliced into strips and knocked out of line, with a violet echo behind: “the code is alive”. Energetic on posters and video; a bit noisy at very small sizes.'],
];
const grid = document.getElementById('grid'), t = document.getElementById('t');
concepts.forEach(([id, name, tag, text], i) => {
  if (i === 8) { const h = document.createElement('h1'); h.textContent = 'Round 3 — culture & hackathon tropes'; h.className = 'sec'; grid.append(h); }
  if (i === 4) { const h = document.createElement('h1'); h.textContent = 'Technical directions'; h.className = 'sec'; grid.append(h); }
  const n = t.content.cloneNode(true);
  n.querySelector('.l').src = `${id}-wordmark-light.svg`;
  n.querySelector('.d').src = `${id}-wordmark-dark.svg`;
  n.querySelectorAll('.i1').forEach(i => i.src = `${id}-icon-violet.svg`);
  n.querySelectorAll('.i2').forEach(i => i.src = `${id}-icon-navy.svg`);
  const h = n.querySelector('h2'); h.textContent = name;
  if (tag) { const s = document.createElement('span'); s.className = 'tag'; s.textContent = 'my pick'; h.append(s); }
  n.querySelector('p').textContent = text;
  grid.append(n);
});
