const concepts = [
  ['cursor', 'A · Cursor', 'pick', '“vibe_” with a text cursor where turon. has its dot: you type an idea, AI helps it become a project. Closest sibling to the hub’s T + gold dot favicon.'],
  ['eq', 'B · Equalizer V', '', 'Five sound bars whose tops draw a V: the “vibe” (music, energy) and the letter in one symbol. Most distinctive icon; less obviously about building.'],
  ['spark', 'C · Spark', '', 'A four-point sparkle, the usual “AI” sign, as the accent. Instantly says “AI”, but it’s the most common mark around.'],
  ['bubble', 'D · Chat bubble', '', 'A v inside a speech bubble: you talk to AI and build. Friendly, reads well small, but feels more like a chat app than an event.'],
];
const grid = document.getElementById('grid'), t = document.getElementById('t');
for (const [id, name, tag, text] of concepts) {
  const n = t.content.cloneNode(true);
  n.querySelector('.l').src = `${id}-wordmark-light.svg`;
  n.querySelector('.d').src = `${id}-wordmark-dark.svg`;
  n.querySelectorAll('.i1').forEach(i => i.src = `${id}-icon-violet.svg`);
  n.querySelectorAll('.i2').forEach(i => i.src = `${id}-icon-navy.svg`);
  const h = n.querySelector('h2'); h.textContent = name;
  if (tag) { const s = document.createElement('span'); s.className = 'tag'; s.textContent = 'my pick'; h.append(s); }
  n.querySelector('p').textContent = text;
  grid.append(n);
}
