import { TakeoutRawItem } from '@/types';

/**
 * Realistic synthetic YouTube & YouTube Music watch history dataset for demo and testing
 */
export const SAMPLE_TAKEOUT_DATA: TakeoutRawItem[] = [
  // Daft Punk (Music - Heavy Rotation)
  {
    header: 'YouTube Music',
    title: 'Watched Get Lucky',
    titleUrl: 'https://www.youtube.com/watch?v=5NV6Rdv1a3I',
    subtitles: [{ name: 'Daft Punk - Topic', url: 'https://www.youtube.com/channel/UC_daftpunk' }],
    time: '2024-01-12T08:15:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched One More Time',
    titleUrl: 'https://www.youtube.com/watch?v=FGBhQbmPwH8',
    subtitles: [{ name: 'Daft Punk - Topic', url: 'https://www.youtube.com/channel/UC_daftpunk' }],
    time: '2024-01-12T08:20:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched Instant Crush (feat. Julian Casablancas)',
    titleUrl: 'https://www.youtube.com/watch?v=a5uQMwRMHcs',
    subtitles: [{ name: 'Daft Punk - Topic', url: 'https://www.youtube.com/channel/UC_daftpunk' }],
    time: '2024-01-13T09:30:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched Harder, Better, Faster, Stronger',
    titleUrl: 'https://www.youtube.com/watch?v=gAjR4_CbPpQ',
    subtitles: [{ name: 'Daft Punk - Topic', url: 'https://www.youtube.com/channel/UC_daftpunk' }],
    time: '2024-01-14T11:05:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched Around the World',
    titleUrl: 'https://www.youtube.com/watch?v=k5w2Zq83y4M',
    subtitles: [{ name: 'Daft Punk - Topic', url: 'https://www.youtube.com/channel/UC_daftpunk' }],
    time: '2024-02-01T14:22:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched Get Lucky',
    titleUrl: 'https://www.youtube.com/watch?v=5NV6Rdv1a3I',
    subtitles: [{ name: 'Daft Punk - Topic', url: 'https://www.youtube.com/channel/UC_daftpunk' }],
    time: '2024-02-15T18:40:00.000Z',
    products: ['YouTube Music'],
  },

  // The Weeknd (Music)
  {
    header: 'YouTube Music',
    title: 'Watched Blinding Lights (Official Audio)',
    titleUrl: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
    subtitles: [{ name: 'The Weeknd VEVO', url: 'https://www.youtube.com/channel/UCtheweeknd' }],
    time: '2024-01-14T19:00:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched Starboy (feat. Daft Punk)',
    titleUrl: 'https://www.youtube.com/watch?v=34Na4j8AVgA',
    subtitles: [{ name: 'The Weeknd VEVO', url: 'https://www.youtube.com/channel/UCtheweeknd' }],
    time: '2024-01-15T20:10:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched Save Your Tears',
    titleUrl: 'https://www.youtube.com/watch?v=XXYlFuWEuKi',
    subtitles: [{ name: 'The Weeknd VEVO', url: 'https://www.youtube.com/channel/UCtheweeknd' }],
    time: '2024-02-10T15:12:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched Die For You',
    titleUrl: 'https://www.youtube.com/watch?v=uPD0QOGFZ_8',
    subtitles: [{ name: 'The Weeknd VEVO', url: 'https://www.youtube.com/channel/UCtheweeknd' }],
    time: '2024-03-05T21:40:00.000Z',
    products: ['YouTube Music'],
  },

  // Hans Zimmer (Soundtrack & Ambient)
  {
    header: 'YouTube Music',
    title: 'Watched Time (Inception OST)',
    titleUrl: 'https://www.youtube.com/watch?v=RxabLA7UQ9k',
    subtitles: [{ name: 'Hans Zimmer - Topic', url: 'https://www.youtube.com/channel/UChanszimmer' }],
    time: '2023-11-20T22:30:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched Cornfield Chase (Interstellar)',
    titleUrl: 'https://www.youtube.com/watch?v=1V_xRb0x9aw',
    subtitles: [{ name: 'Hans Zimmer - Topic', url: 'https://www.youtube.com/channel/UChanszimmer' }],
    time: '2023-12-05T01:10:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched Stay',
    titleUrl: 'https://www.youtube.com/watch?v=ca_cvwc2f7A',
    subtitles: [{ name: 'Hans Zimmer - Topic', url: 'https://www.youtube.com/channel/UChanszimmer' }],
    time: '2024-01-16T23:45:00.000Z',
    products: ['YouTube Music'],
  },

  // Dua Lipa (Pop)
  {
    header: 'YouTube Music',
    title: 'Watched Levitating (Official Music Video)',
    titleUrl: 'https://www.youtube.com/watch?v=TUVcZfQe-Kw',
    subtitles: [{ name: 'Dua Lipa', url: 'https://www.youtube.com/channel/UCdualipa' }],
    time: '2024-01-17T12:00:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched Don’t Start Now',
    titleUrl: 'https://www.youtube.com/watch?v=oygrmJFKYZY',
    subtitles: [{ name: 'Dua Lipa', url: 'https://www.youtube.com/channel/UCdualipa' }],
    time: '2024-01-18T13:25:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched Houdini',
    titleUrl: 'https://www.youtube.com/watch?v=suAR1PYFNYA',
    subtitles: [{ name: 'Dua Lipa', url: 'https://www.youtube.com/channel/UCdualipa' }],
    time: '2024-02-14T17:10:00.000Z',
    products: ['YouTube Music'],
  },

  // Radiohead (Alternative Rock)
  {
    header: 'YouTube Music',
    title: 'Watched Weird Fishes/ Arpeggi',
    titleUrl: 'https://www.youtube.com/watch?v=TNRCvG9YtYI',
    subtitles: [{ name: 'Radiohead - Topic', url: 'https://www.youtube.com/channel/UCradiohead' }],
    time: '2023-10-10T16:00:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched Karma Police',
    titleUrl: 'https://www.youtube.com/watch?v=1uYWYWPc9HU',
    subtitles: [{ name: 'Radiohead - Topic', url: 'https://www.youtube.com/channel/UCradiohead' }],
    time: '2023-10-11T17:15:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched No Surprises',
    titleUrl: 'https://www.youtube.com/watch?v=u5CVsCnxyXg',
    subtitles: [{ name: 'Radiohead - Topic', url: 'https://www.youtube.com/channel/UCradiohead' }],
    time: '2024-01-19T20:00:00.000Z',
    products: ['YouTube Music'],
  },

  // Kendrick Lamar (Hip Hop)
  {
    header: 'YouTube Music',
    title: 'Watched Money Trees',
    titleUrl: 'https://www.youtube.com/watch?v=smqhSl0u_Qk',
    subtitles: [{ name: 'Kendrick Lamar - Topic', url: 'https://www.youtube.com/channel/UCkendrick' }],
    time: '2024-01-20T18:40:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched All The Stars',
    titleUrl: 'https://www.youtube.com/watch?v=JQbjS0_ZfJ0',
    subtitles: [{ name: 'Kendrick Lamar VEVO', url: 'https://www.youtube.com/channel/UCkendrick' }],
    time: '2024-02-18T19:50:00.000Z',
    products: ['YouTube Music'],
  },

  // Billie Eilish (Alt Pop)
  {
    header: 'YouTube Music',
    title: 'Watched ocean eyes',
    titleUrl: 'https://www.youtube.com/watch?v=viimfQi_pDA',
    subtitles: [{ name: 'Billie Eilish - Topic', url: 'https://www.youtube.com/channel/UCbillie' }],
    time: '2024-01-21T14:10:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched bad guy',
    titleUrl: 'https://www.youtube.com/watch?v=DyDfgMOUjCI',
    subtitles: [{ name: 'Billie Eilish VEVO', url: 'https://www.youtube.com/channel/UCbillie' }],
    time: '2024-03-01T15:30:00.000Z',
    products: ['YouTube Music'],
  },

  // Pink Floyd (Classic Rock)
  {
    header: 'YouTube Music',
    title: 'Watched Comfortably Numb',
    titleUrl: 'https://www.youtube.com/watch?v=_FrOQC-zEog',
    subtitles: [{ name: 'Pink Floyd - Topic', url: 'https://www.youtube.com/channel/UCpinkfloyd' }],
    time: '2023-09-14T21:00:00.000Z',
    products: ['YouTube Music'],
  },
  {
    header: 'YouTube Music',
    title: 'Watched Time',
    titleUrl: 'https://www.youtube.com/watch?v=rL3AgkwbYgo',
    subtitles: [{ name: 'Pink Floyd - Topic', url: 'https://www.youtube.com/channel/UCpinkfloyd' }],
    time: '2023-09-15T22:15:00.000Z',
    products: ['YouTube Music'],
  },

  // General YouTube Video Viewing (Channels & Long-form)
  {
    header: 'YouTube',
    title: 'Watched How The Universe Will End',
    titleUrl: 'https://www.youtube.com/watch?v=q668a0qTf7U',
    subtitles: [{ name: 'Kurzgesagt – In a Nutshell', url: 'https://www.youtube.com/channel/UCsXVk37bltHxD1rDPwtNM8Q' }],
    time: '2024-01-13T15:00:00.000Z',
    products: ['YouTube'],
  },
  {
    header: 'YouTube',
    title: 'Watched The Black Hole Bomb and Black Hole Civilizations',
    titleUrl: 'https://www.youtube.com/watch?v=ulCdoCjz-mM',
    subtitles: [{ name: 'Kurzgesagt – In a Nutshell', url: 'https://www.youtube.com/channel/UCsXVk37bltHxD1rDPwtNM8Q' }],
    time: '2024-01-14T16:20:00.000Z',
    products: ['YouTube'],
  },
  {
    header: 'YouTube',
    title: 'Watched The Infinite Pattern That Never Repeats',
    titleUrl: 'https://www.youtube.com/watch?v=48sCx-wBs34',
    subtitles: [{ name: 'Veritasium', url: 'https://www.youtube.com/channel/UCHnyfMqiRRG1u-2MsSQLbXA' }],
    time: '2024-01-15T18:00:00.000Z',
    products: ['YouTube'],
  },
  {
    header: 'YouTube',
    title: 'Watched How Quantum Computers Actually Work',
    titleUrl: 'https://www.youtube.com/watch?v=JhHMJCUmq28',
    subtitles: [{ name: 'Veritasium', url: 'https://www.youtube.com/channel/UCHnyfMqiRRG1u-2MsSQLbXA' }],
    time: '2024-02-11T19:30:00.000Z',
    products: ['YouTube'],
  },
  {
    header: 'YouTube',
    title: 'Watched Apple Vision Pro: 6 Months Later!',
    titleUrl: 'https://www.youtube.com/watch?v=8sJ8sH2q6vY',
    subtitles: [{ name: 'Marques Brownlee', url: 'https://www.youtube.com/channel/UCBJycsmduPTeo5q42nULVaw' }],
    time: '2024-02-20T17:45:00.000Z',
    products: ['YouTube'],
  },
  {
    header: 'YouTube',
    title: 'Watched The Blind Smartphone Camera Test 2024',
    titleUrl: 'https://www.youtube.com/watch?v=LQdjmGihq54',
    subtitles: [{ name: 'Marques Brownlee', url: 'https://www.youtube.com/channel/UCBJycsmduPTeo5q42nULVaw' }],
    time: '2024-03-02T13:10:00.000Z',
    products: ['YouTube'],
  },
];
