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
          message: 'Our first monthsary ❤️',
        },
        {
          id: 2,
          date: 'June 2024',
          image: `${BASE}photos/june_2024.jpg`,
          message: 'I kept looking at you even when you were right beside me 😂',
        },
        {
          id: 3,
          date: 'July 2024',
          image: `${BASE}photos/july_2024.jpg`,
          message: 'Kileeeeggg sa birthdate hahaha 🥰',
        },
        {
          id: 4,
          date: 'August 2024',
          image: `${BASE}photos/aug_2024.jpg`,
          message: 'Intramuros Date 💕',
        },
        {
          id: 5,
          date: 'September 2024',
          image: `${BASE}photos/sep_2024.jpg`,
          message: 'Random dates will always be one of the best dates. 🥹',
        },
        {
          id: 6,
          date: 'October 2024',
          image: `${BASE}photos/oct_2024.jpg`,
          message: 'Fairview Date na naglaro lang ng naglaro 😍.',
        },
        {
          id: 7,
          date: 'November 2024',
          image: `${BASE}photos/nov_2024.jpg`,
          message: 'random tagaytay escapade with my bb labs 🥹',
        },
        {
          id: 8,
          date: 'December 2024',
          image: `${BASE}photos/dec_2024.jpg`,
          message: 'Our first Christmas as couple, I want a hundred more like it. 🎄🥹',
        },
        {
          id: 9,
          date: 'January 2025',
          image: `${BASE}photos/jan_2025.jpg`,
          message: 'Ayala Triangle date (Mandatory date palagi) 💕',
        },
        {
          id: 10,
          date: 'February 2025',
          image: `${BASE}photos/feb_2025.jpg`,
          message: 'Valentines x Antipolo Date 😘',
        },
        {
          id: 11,
          date: 'March 2025',
          image: `${BASE}photos/mar_2025.jpg`,
          message: 'One year of you, and I\'d choose it all again. 🥹❤️',
        },
        {
          id: 12,
          date: 'April 2025',
          image: `${BASE}photos/apr_2025.jpg`,
          message: 'Still falling. Still grateful. Still yours. 💫',
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
          message: 'Into our second year, at birthday mo na ❤️❤️',
        },
        {
          id: 14,
          date: 'June 2025',
          image: `${BASE}photos/june_2025.jpg`,
          message: 'That smile thou ❤️❤️❤️😳',
        },
        {
          id: 15,
          date: 'July 2025',
          image: `${BASE}photos/july_2025.jpg`,
          message: 'Surpise birthdate HAHAHA sabi ko wala akong payong eh 😂',
        },
        {
          id: 16,
          date: 'August 2025',
          image: `${BASE}photos/aug_2025.jpg`,
          message: 'Yieeee Happy Graduation BB LAAABBBS 🎓🎉',
        },
        {
          id: 17,
          date: 'September 2025',
          image: `${BASE}photos/sep_2025.jpg`,
          message: 'Trying different hobby but still andito ka para suportahan ako 🥹',
        },
        {
          id: 18,
          date: 'October 2025',
          image: `${BASE}photos/oct_2025.jpg`,
          message: 'There is no one else I\'d rather get lost with. Date before the Operation kasi sobrang kabado 😨',
        },
        {
          id: 19,
          date: 'November 2025',
          image: `${BASE}photos/nov_2025.jpg`,
          message: 'Grateful for every version of us we\'ve been. 🥹',
        },
        {
          id: 20,
          date: 'December 2025',
          image: `${BASE}photos/dec_2025.jpg`,
          message: 'Our Christmas together, seeing a different version of your family, and somehow, it already felt like home 🎄🥹',
        },
        {
          id: 21,
          date: 'January 2026',
          image: `${BASE}photos/jan_2026.jpg`,
          message: 'Baguio Date with your fam 🥹 Sobrang thank you sa pag invite',
        },
        {
          id: 22,
          date: 'February 2026',
          image: `${BASE}photos/feb_2026.jpg`,
          message: 'Suprise capybara valentine\'s Date 🦦💕',
        },
        {
          id: 23,
          date: 'March 2026',
          image: `${BASE}photos/mar_2026.jpg`,
          message: 'Delay na manadatory Ayala date but natuloy din 🥹😘😍',
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
