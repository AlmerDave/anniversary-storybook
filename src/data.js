// ─────────────────────────────────────────────────────────────────────────────
// data.js — ALL CONTENT LIVES HERE
// Edit this file to personalise the website. Components never hardcode content.
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
  // ── Identity ────────────────────────────────────────────────────────────────
  // Her name — shown in the closing chapter
  name: 'Us (A short anniversary timeline)',

  // ISO date format (YYYY-MM-DD) — used for the live day counter
  anniversaryDate: '2024-03-27',

  // Display format — shown in Chapter II during the collision
  metDate: 'April 27, 2024',

  // ── Chapter narration ───────────────────────────────────────────────────────
  story: {
    before:  'Before there was an us, there was just you — and a universe that had not yet found its reason.',
    meeting: 'Then everything changed.',
    solar:   'From that collision, an entire world was born.',
    promise: 'And we are only just beginning.',
  },

  // ── Memory years (Chapter III) ──────────────────────────────────────────────
  // Each yeasr becomes a planet. Stars inside each year are memories.
  // Add/remove years and stars freely — the UI adjusts automatically.
  years: [
    {
      year: '2024',
      label: 'Year One',
      planetColor: '#3A8FE8',
      stars: [
        {
          id: 1,
          date: 'March 20, 2024',
          image: 'https://picsum.photos/seed/star1/400/500',
          message: 'The first time I knew something was different about us.',
        },
        {
          id: 2,
          date: 'June 14, 2024',
          image: 'https://picsum.photos/seed/star2/400/500',
          message: 'Everything felt like a dream we never wanted to wake from.',
        },
        {
          id: 3,
          date: 'September 3, 2024',
          image: 'https://picsum.photos/seed/star3/400/500',
          message: 'You laughed and I memorised every note of it.',
        },
      ],
    },
    {
      year: '2025',
      label: 'Year Two',
      planetColor: '#E87B3A',
      stars: [
        {
          id: 4,
          date: 'March 20, 2025',
          image: 'https://picsum.photos/seed/star4/400/500',
          message: 'Two years of everything I never knew I needed.',
        },
        {
          id: 5,
          date: 'December 25, 2025',
          image: 'https://picsum.photos/seed/star5/400/500',
          message: 'Our Christmas. Still my favourite one.',
        },
      ],
    },
  ],

  // ── Closing letter (Chapter IV) ─────────────────────────────────────────────
  // Each line break becomes a separate reveal line.
  letter: `Every moment with you is a star I want to keep forever.\nYou are the reason the sky looks different now.\nThank you for choosing me, day after day.\nI love you — more than all of this.`,
}
