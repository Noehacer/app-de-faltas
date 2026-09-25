export function hueOf(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 360;
  return hash;
}

export function colorsFor(id: string, dark: boolean): { bg: string; fg: string } {
  const h = hueOf(id);
  return dark
    ? { bg: `hsl(${h}, 35%, 24%)`, fg: `hsl(${h}, 80%, 82%)` }
    : { bg: `hsl(${h}, 85%, 91%)`, fg: `hsl(${h}, 65%, 26%)` };
}
