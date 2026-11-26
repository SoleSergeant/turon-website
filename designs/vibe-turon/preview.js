const concepts = [
  ['cursor', 'A · Cursor', 'pick', '“vibe_” with a text cursor where turon. has its dot: you type an idea, AI helps it become a project. Closest sibling to the hub’s T + gold dot favicon.'],
  ['eq', 'B · Equalizer V', '', 'Five sound bars whose tops draw a V: the “vibe” (music, energy) and the letter in one symbol. Most distinctive icon; less obviously about building.'],
  ['spark', 'C · Spark', '', 'A four-point sparkle, the usual “AI” sign, as the accent. Instantly says “AI”, but it’s the most common mark around.'],
  ['bubble', 'D · Chat bubble', '', 'A v inside a speech bubble: you talk to AI and build. Friendly, reads well small, but feels more like a chat app than an event.'],
  ['brackets', 'E · Code tag', '', '“<vibe/>” written as an HTML tag; the tile is <v>. Says “code” to anyone who has opened an editor, though </> marks are common in dev branding.'],
  ['terminal', 'F · Terminal', '', 'A shell prompt “> vibe”; the tile is a terminal window (three dots) with >v. Clear “you type, it runs” story; the chevron is a strong, simple shape.'],
  ['pixel', 'G · Pixel V', 'pick', 'A V drawn as a 7×6 bitmap, with the last pixel lit in violet like a cursor or LED. Very ownable, scales down cleanly, and has a playful hackathon feel.'],
  ['merge', 'H · Merge', '', 'Two git branches meeting at one violet node: you + AI (or a team) merge into one project. Clever for coders, but needs explaining to everyone else.'],
];
const grid = document.getElementById('grid'), t = document.getElementById('t');
concepts.forEach(([id, name, tag, text], i) => {
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
