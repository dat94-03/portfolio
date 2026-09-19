// Central content source for the portfolio. Story-oriented copy — the
// resume is the source of truth for facts; this file is the source of
// truth for how those facts are told.

// Prefix public-folder paths with Vite's BASE_URL so images resolve
// correctly under both dev ('/') and project-site prod ('/portfolio/').
const BASE = import.meta.env.BASE_URL || '/'
const img = (p) => `${BASE}${p.replace(/^\//, '')}`

export const PROFILE = {
  name: 'Lo Hoang Tien Dat',
  alias: 'David',
  role: 'DevOps / Cloud Engineer',
  location: 'Hanoi, Vietnam',
  tagline: 'I build landing zones that thousand-account fleets can live inside.',
  email: 'tiendat942003@gmail.com',
  phone: '+84 0332996144',
  avatar: img('/images/avatar.png'),
}

// The six scroll-stops. Each corresponds to a scene component in <Scene />.
export const SECTIONS = [
  { id: 'hero',       label: 'boot',      title: 'boot.sh' },
  { id: 'education',  label: 'education', title: 'origin' },
  { id: 'experience', label: 'work',      title: 'landing_zone' },
  { id: 'future',     label: 'journey',   title: 'to_be_continued' },
  { id: 'contact',    label: 'contact',   title: 'signal' },
]

// Story copy per section — first-person, cinematic, but grounded in the resume.
// Each section has:
//   • eyebrow / title / body → shown on the collapsed card
//   • details[]              → extra paragraphs revealed when expanded
//   • gallery[]              → clickable thumbnails (open lightbox on click)
// Gallery images live in public/images/gallery/ — missing files show a
// stylised gradient placeholder so the layout still works.
export const STORY = {
  hero: {
    eyebrow: '// initialising',
    title: 'Hi, I\'m David.',
    body: 'DevOps/cloud engineer. I build and run international customer platforms — and I get out of bed for problems that live at the edge of a thousand AWS accounts.',
    details: [
      'Currently on the DevOps / Cloud team at FPT Software, running enterprise AWS Landing Zones for customers in Germany, France, and Singapore.',
      'I love the quiet parts of the job — SCPs that keep 1,000 accounts honest, AFT pipelines that turn account onboarding into a coffee-break task, GitHub Actions matrices that make cross-region rollouts a non-event.',
    ],
    gallery: [
      { src: img('/images/gallery/hero-1.jpg'), caption: 'DevOps desk setup' },
      { src: img('/images/gallery/hero-2.jpg'), caption: 'Terminal at work' },
    ],
    terminalLines: [
      { kind: 'comment', text: '#!/bin/bash' },
      { kind: 'blank',   text: '' },
      { kind: 'export',  text: 'export USER="Lo Hoang Tien Dat - David"' },
      { kind: 'blank',   text: '' },
      { kind: 'echo',    text: 'echo "$USER — I build reliable cloud platforms that make developers\' lives easier."' },
    ],
  },
  about: {
    eyebrow: '// whoami',
    title: 'The person behind the pipelines.',
    body: 'I graduated from HUST with a 3.75 GPA and immediately went deep on cloud platforms. What I care about is boring the interesting way — governance that scales, guardrails that don\'t slow teams down, and pipelines that make the next engineer\'s job easier than mine was.',
    details: [
      'Outside work, I like anything with a good feedback loop — long-distance running, small hardware projects, and the occasional deep-dive rabbit hole into container internals.',
      'I read Vietnamese, English, and enough Terraform to argue with it politely.',
    ],
    gallery: [
      { src: img('/images/gallery/about-1.jpg'), caption: 'Portrait' },
      { src: img('/images/gallery/about-2.jpg'), caption: 'On the road' },
      { src: img('/images/gallery/about-3.jpg'), caption: 'At HUST' },
    ],
  },
  education: {
    eyebrow: '// origin',
    title: 'Hanoi University of Science and Technology.',
    body: 'B.Sc. in Computer Engineering, School of Information & Communications Technology. GPA 3.75/4.00. Excellent Academic Achievement Scholarship — three consecutive semesters (2024-2, 2025-1, 2025-2).',
    details: [
      'HUST\'s Computer Engineering track (IT2) covers computer architecture, OS internals, networks, and embedded systems. My electives leaned toward distributed systems and cloud infrastructure.',
      'The medal on this pedestal is the Excellent Graduate Medal. The pavilion beside it is Khuê Văn Các — Vietnam\'s Temple of Literature and the country\'s emblem of learning.',
    ],
    gallery: [
      { src: img('/images/gallery/edu-graduation.jpg'),   caption: 'Graduation day — HUST 2025' },
      { src: img('/images/gallery/edu-toeic.png'),        caption: 'TOEIC 920 (L 495 · R 425) — Nov 2024' },
      { src: img('/images/gallery/edu-medal.jpg'),        caption: 'Graduation medal (HUST 2025)' },
      { src: img('/images/gallery/edu-scholarship-1.jpg'), caption: 'Scholarship 2024-2' },
      { src: img('/images/gallery/edu-scholarship-2.jpg'), caption: 'Scholarship 2025-1' },
      { src: img('/images/gallery/edu-scholarship-3.jpg'), caption: 'Scholarship 2025-2' },
      { src: img('/images/gallery/edu-campus.jpg'),       caption: 'HUST campus' },
    ],
  },
  experience: {
    eyebrow: '// landing_zone',
    title: 'Three customers. Three continents. One playbook.',
    body: 'At FPT Software I\'ve operated enterprise AWS Landing Zones for customers in Germany, France, and Singapore — from 100-account architectures to fleets past a thousand, across both AWS Global and AWS China.',
    details: [
      '🇩🇪 Germany — 1,000+ AWS accounts across Global + China partitions. AFT for account provisioning, SCPs + Security Hub for governance, GitHub Actions with OIDC for cross-account IaC deployment.',
      '🇫🇷 France — 100+ accounts with EventBridge + Lambda auto-remediation, AWS IPAM as the CIDR source of truth, IAM Identity Center SSO.',
      '🇸🇬 Singapore — Jenkins Shared Libraries standardising build → scan → test → deploy stages, K8s podTemplates with golden images, BlackDuck/Coverity/SonarQube gates.',
    ],
    gallery: [
      { src: img('/images/gallery/work-germany.jpg'), caption: 'Germany — Landing Zone architecture' },
      { src: img('/images/gallery/work-france.jpg'),  caption: 'France — Hub-and-spoke topology' },
      { src: img('/images/gallery/work-singapore.jpg'), caption: 'Singapore — Jenkins CI/CD' },
      { src: img('/images/gallery/work-fpt.jpg'),     caption: 'FPT Software HQ, Hanoi' },
    ],
  },
  future: {
    eyebrow: '// to_be_continued',
    title: 'The next island is yours.',
    body: 'Every company I\'ve worked with earns an island in this diorama. Right now, only FPT stands on one — and the plot next to it is deliberately empty. If your team is building something that needs an engineer who obsesses over landing zones, guardrails, and quiet pipelines, this island is reserved for you.',
    details: [
      'I\'m most useful where governance meets scale — hundreds of AWS accounts, cross-region rollouts, DevSecOps pipelines that hold under audit.',
      'Open to full-time roles or focused engagements. Based in Hanoi, comfortable across EU + APAC hours. Hit me up on email or LinkedIn and let\'s see if there\'s an island worth planting here.',
    ],
    gallery: [],
  },
  contact: {
    eyebrow: '// signal',
    title: 'Say hi.',
    body: 'Interesting cloud problems, weird governance edge cases, or just a chat about your landing zone — my inbox is open.',
    details: [
      'Best route: email or LinkedIn DM. Discord and Telegram work too for asynchronous chats.',
      'Based in Hanoi, GMT+7. Comfortable working with distributed teams across EU + APAC time zones.',
    ],
    gallery: [],
  },
}

// Education achievements (cards / floating certificates in scene 3)
export const EDUCATION = {
  school: 'Hanoi University of Science and Technology (HUST)',
  location: 'Hanoi, Vietnam',
  degree: 'B.Sc. Computer Engineering (IT2), SoICT',
  gpa: '3.75 / 4.00',
  period: 'Sep 2021 — Jun 2025',
  medal: {
    title: 'Excellent Graduate Medal',
    subtitle: 'HUST — Since 1956',
    image: img('/images/medal-hust.png'),
  },
  scholarships: [
    { term: 'Semester 2024-2', label: 'Academic Achievement — Excellent', image: img('/images/scholarship-2024-2.png') },
    { term: 'Semester 2025-1', label: 'Academic Achievement — Excellent', image: img('/images/scholarship-2025-1.png') },
    { term: 'Semester 2025-2', label: 'Academic Achievement — Excellent', image: img('/images/scholarship-2025-2.png') },
  ],
}
