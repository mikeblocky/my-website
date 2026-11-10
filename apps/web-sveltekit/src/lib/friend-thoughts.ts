type Thought = { text: string; image?: string; long?: boolean; portrait?: boolean };
export const friendThoughts: Record<string, Thought[]> = {
  daisukihotaru: [
    { text: 'A Condition Called Love', image: 'a-condition-called-love' },
    { text: 'Hanaru ♡' }, { text: 'A whole bunch of friends' }
  ],
  octobersfilm: [
    { text: 'TXT', image: 'txt' }, { text: 'Beomgyu ♡', image: 'beomgyu', portrait: true }, { text: 'Movies & friends' },
    { text: 'i love my friends so much. i’m always reminded how life is worth living whenever i’m with them. talking for hours, getting to experience life alongside them, & going home with this giddiness in my heart just because i got to be happy with them.', long: true }
  ],
  multiplee_: [{ text: 'Polish music ♪' }, { text: 'They introduced me to it!' }],
  skipsyourloafer: [{ text: 'Mika & Mukai ♡' }],
  to_nikaku: [{ text: 'Such beautiful drawings' }],
  beyondlaboira: [{ text: 'Always so supportive' }, { text: 'Such an amazing person ♡' }],
  goinghostie: [{ text: 'Hoshiai no Sora ✧' }],
  maomao_2605: [
    { text: 'Manga & anime' },
    { text: 'Fruits Basket', image: 'fruits-basket' },
    { text: 'Haikyuu!!', image: 'haikyuu' }
  ],
  eljcfran: [{ text: 'A little corner of support ♡' }],
  thatyamakun: [{ text: 'Witch Hat Atelier ✧' }],
  lilatheduckk: [{ text: 'Fan fiction & lovely thoughts' }],
  kuusand: [{ text: 'One of my very first supporters ♡' }]
};
