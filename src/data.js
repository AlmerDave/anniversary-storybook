// ─────────────────────────────────────────────────────────────────────────────
// data.js — ALL CONTENT LIVES HERE
// Edit this file to personalise the website. Components never hardcode content.
// ─────────────────────────────────────────────────────────────────────────────

// BASE_URL is '/anniversary-storybook/' on GitHub Pages, '/' in dev.
// Drop photos into public/photos/ and reference them as `${BASE}photos/filename.jpg`
const BASE = import.meta.env.BASE_URL

export const config = {
  // ── Identity ────────────────────────────────────────────────────────────────
  // Her name — shown in the closing chapter
  name: 'my BB (Jovi)',

  // ISO date format (YYYY-MM-DD) — used for the live day counter
  anniversaryDate: '2024-03-27',

  // Display format — shown in Chapter II during the collision
  metDate: 'April 27, 2024',

  // ── Chapter narration ───────────────────────────────────────────────────────
  story: {
    before:  'Before there was an us, there was just you — and a universe that had not yet found its reason.',
    meeting: 'After this night, everything changed',
    solar:   'From that collision, an entire world was born.',
    promise: 'And we are only just beginning.',
  },

  // ── Memory years (Chapter III) ──────────────────────────────────────────────
  // Each yeasr becomes a planet. Stars inside each year are memories.
  // Add/remove years and stars freely — the UI adjusts automatically.
  years: [
    {
      year: '2024-2025',
      label: 'Year One',
      planetColor: '#3A8FE8',
      stars: [
        {
          id: 1,
          date: 'May 2024',
          image: `${BASE}photos/may_2024.jpg`,
          message: 'The first time I knew something was different about us.',
        },
        {
          id: 2,
          date: 'June 2024',
          image: `${BASE}photos/june_2024.jpg`,
          message: 'Everything felt like a dream we never wanted to wake from.',
        },
        {
          id: 3,
          date: 'July 2024',
          image: `${BASE}photos/july_2024.jpg`,
          message: 'You laughed and I memorised every note of it.',
        },
        {
          id: 4,
          date: 'August 2024',
          image: `${BASE}photos/aug_2024.jpg`,
          message: 'Every day with you felt like the best one yet.',
        },
        {
          id: 5,
          date: 'September 2024',
          image: `${BASE}photos/sep_2024.jpg`,
          message: 'I kept looking for you even when you were right beside me.',
        },
        {
          id: 6,
          date: 'October 2024',
          image: `${BASE}photos/oct_2024.jpg`,
          message: 'The world looked warmer with you in it.',
        },
        {
          id: 7,
          date: 'November 2024',
          image: `${BASE}photos/nov_2024.jpg`,
          message: 'Quiet moments with you are my favourite kind.',
        },
        {
          id: 8,
          date: 'December 2024',
          image: `${BASE}photos/dec_2024.jpg`,
          message: 'Our first Christmas — I want a hundred more like it.',
        },
        {
          id: 9,
          date: 'January 2025',
          image: `${BASE}photos/jan_2025.jpg`,
          message: 'A new year, and still the only one I want beside me.',
        },
        {
          id: 10,
          date: 'February 2025',
          image: `${BASE}photos/feb_2025.jpg`,
          message: 'Every day feels like Valentine\'s Day with you.',
        },
        {
          id: 11,
          date: 'March 2025',
          image: `${BASE}photos/mar_2025.jpg`,
          message: 'One year of you — and I\'d choose it all again.',
        },
        {
          id: 12,
          date: 'April 2025',
          image: `${BASE}photos/apr_2025.jpg`,
          message: 'Still falling. Still grateful. Still yours.',
        },
      ],
    },
    {
      year: '2025-2026',
      label: 'Year Two',
      planetColor: '#E87B3A',
      stars: [
        {
          id: 13,
          date: 'May 2025',
          image: `${BASE}photos/may_2025.jpg`,
          message: 'Into our second year, and it only keeps getting better.',
        },
        {
          id: 14,
          date: 'June 2025',
          image: `${BASE}photos/june_2025.jpg`,
          message: 'Summer with you is something I never want to end.',
        },
        {
          id: 15,
          date: 'July 2025',
          image: `${BASE}photos/july_2025.jpg`,
          message: 'You make ordinary days feel like adventures.',
        },
        {
          id: 16,
          date: 'August 2025',
          image: `${BASE}photos/aug_2025.jpg`,
          message: 'Every laugh, every glance — I keep them all.',
        },
        {
          id: 17,
          date: 'September 2025',
          image: `${BASE}photos/sep_2025.jpg`,
          message: 'The way you see the world makes me see it differently too.',
        },
        {
          id: 18,
          date: 'October 2025',
          image: `${BASE}photos/oct_2025.jpg`,
          message: 'There is no one else I\'d rather get lost with.',
        },
        {
          id: 19,
          date: 'November 2025',
          image: `${BASE}photos/nov_2025.jpg`,
          message: 'Grateful for every version of us we\'ve been.',
        },
        {
          id: 20,
          date: 'December 2025',
          image: `${BASE}photos/dec_2025.jpg`,
          message: 'Our Christmas. Still my favourite one.',
        },
        {
          id: 21,
          date: 'January 2026',
          image: `${BASE}photos/jan_2026.jpg`,
          message: 'Another year begins — and you\'re still the first thing I think of.',
        },
        {
          id: 22,
          date: 'February 2026',
          image: `${BASE}photos/feb_2026.jpg`,
          message: 'Two years of love letters written in ordinary days.',
        },
        {
          id: 23,
          date: 'March 2026',
          image: `${BASE}photos/mar_2026.jpg`,
          message: 'Two years of you. Two years of us. Still counting.',
        },
        {
          id: 24,
          date: 'April 2026',
          isSpecial: true,
          message: 'This is us.\nStill writing. Still choosing each other. Still loving.\nApril 2025',
        },
      ],
    },
  ],

  // ── Closing letter (Chapter IV) ─────────────────────────────────────────────
  // Each line break becomes a separate reveal line.
  letter: `Every moment with you is a star I want to keep forever.\nYou are the reason why my sky looks different now.\nThank you for choosing me, day after day.\nI love you so much bb.`,
}
