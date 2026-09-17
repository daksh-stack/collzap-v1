/**
 * Blog content.
 *
 * Deliberately plain ESM with no JSX, no asset imports and no `import.meta.env`
 * — `scripts/prerender.mjs` imports this file directly in plain Node to build
 * its route list and the sitemap, so the app and the build can never disagree
 * about which posts exist. Keep it that way.
 *
 * Body is structured blocks rather than a markdown string: no parser to own,
 * and the semantic HTML each post produces is explicit, which is the whole
 * point of publishing these.
 *
 *   { t: 'p',  x }            paragraph
 *   { t: 'h2', x }            section heading
 *   { t: 'h3', x }            sub-heading
 *   { t: 'ul', items: [] }    bullet list
 *   { t: 'ol', items: [] }    numbered list
 *   { t: 'quote', x }         pull quote
 */

export const BLOG_BASE = '/blog';

const collzapIntro =
  'CollZap is built around exactly this problem — it matches verified students inside the same college on shared interests, goals and how seriously they are approaching them.';

export const POSTS = [
  {
    slug: 'find-your-circle-in-college',
    title: 'CollZap: Helping College Students Find Their Right Circle, Build Connections and Grow Together',
    description:
      'College is full of people, but finding the right people is hard. How CollZap helps students discover peers inside their own college who share their interests, goals and mindset.',
    date: '2026-09-17',
    readingMinutes: 9,
    tags: ['CollZap', 'Student networking'],
    blocks: [
      { t: 'p', x: 'College is full of people, but finding the right people can be difficult.' },
      {
        t: 'p',
        x: 'College life is one of the most important phases of a student’s journey. Students meet new people, attend classes, join clubs, learn new skills and explore different career opportunities.',
      },
      {
        t: 'p',
        x: 'However, many students still struggle to find people who share the same interests, goals and mindset.',
      },
      {
        t: 'p',
        x: 'One student may be interested in building a startup. Another may want to learn coding. Someone may be passionate about content creation, while another student may be searching for a serious study partner or project teammate.',
      },
      {
        t: 'p',
        x: 'Most of the time, students make friends because they sit in the same classroom, live in the same hostel or belong to the same group. But these connections are not always based on shared interests or future goals.',
      },
      { t: 'p', x: 'This is where CollZap comes in.' },

      { t: 'h2', x: 'What is CollZap?' },
      {
        t: 'p',
        x: 'CollZap is a student-focused platform that helps college students find like-minded people from their own college or university.',
      },
      { t: 'quote', x: 'Find Your Circle Before College Passes You By.' },
      { t: 'p', x: 'CollZap helps students discover people who share similar:' },
      {
        t: 'ul',
        items: [
          'Interests',
          'Skills',
          'Goals and ambitions',
          'Learning mindset',
          'Career interests',
          'Startup interests',
          'Personal growth mindset',
        ],
      },
      {
        t: 'p',
        x: 'Instead of randomly connecting with people, students can use CollZap to discover meaningful connections based on what they actually want to learn, build or achieve.',
      },
      {
        t: 'p',
        x: 'Whether a student wants to find a project partner, study partner, co-founder, creator, developer or a group of motivated friends, CollZap is designed to make that process easier.',
      },

      { t: 'h2', x: 'Why finding the right circle matters in college' },
      {
        t: 'p',
        x: 'The people around us can influence our learning, confidence, habits and future opportunities.',
      },
      {
        t: 'p',
        x: 'A student who wants to learn coding may progress faster when they have a coding partner. A student who wants to build a startup may need a designer, developer or marketing person. A student preparing for competitive exams may need a focused study group.',
      },

      { t: 'h3', x: '1. Learn new skills' },
      {
        t: 'p',
        x: 'Students can connect with others who are interested in learning the same skills, such as coding and development, digital marketing, design, public speaking, finance, entrepreneurship, content creation, communication, leadership, or research and innovation.',
      },
      { t: 'p', x: 'Learning with the right people can make the process more engaging and consistent.' },

      { t: 'h3', x: '2. Find project partners' },
      { t: 'p', x: 'Many students have project ideas but struggle to find the right teammates.' },
      {
        t: 'ul',
        items: [
          'A developer may need a designer.',
          'A founder may need a marketing partner.',
          'A content creator may need a video editor.',
          'A researcher may need someone with similar interests.',
          'A business student may need a technical co-founder.',
        ],
      },
      {
        t: 'p',
        x: 'CollZap helps students discover people from their campus who may be interested in working together.',
      },

      { t: 'h3', x: '3. Build startups and businesses' },
      { t: 'p', x: 'College is a great time to explore entrepreneurship.' },
      {
        t: 'p',
        x: 'Many students have ideas but do not know where to begin. They may need people who can help with product development, marketing, sales, research, design, technology, operations or business strategy.',
      },
      {
        t: 'p',
        x: 'Through student networking and collaboration, students can find people who share their entrepreneurial interests and want to build something together.',
      },

      { t: 'h3', x: '4. Create a focused study circle' },
      { t: 'p', x: 'Not every student enjoys studying alone.' },
      {
        t: 'p',
        x: 'Some students prefer learning with a small group of serious and motivated people. CollZap can help students find peers interested in similar subjects, exams or learning goals. A focused college student community can help students exchange knowledge, discuss problems and stay motivated.',
      },

      { t: 'h3', x: '5. Make meaningful friendships' },
      { t: 'p', x: 'College friendships should not only be based on location or classroom seating.' },
      {
        t: 'p',
        x: 'Students may find stronger connections when they share similar interests, values and goals. CollZap focuses on helping students discover meaningful connections in college, rather than simply collecting followers or joining random groups.',
      },

      { t: 'h2', x: 'How does CollZap work?' },
      { t: 'p', x: 'CollZap is designed to make student discovery simple and relevant.' },

      { t: 'h3', x: 'Step 1: Discover students from your college' },
      {
        t: 'p',
        x: 'Students can discover people from their own college or university. This helps make connections more relevant because students belong to the same campus environment.',
      },

      { t: 'h3', x: 'Step 2: Select your interests' },
      {
        t: 'p',
        x: 'Students can choose areas they are interested in — startups, coding, business, content creation, sports, design, music, reading, public speaking, learning or personal development. These interests help create a better understanding of what students want to explore.',
      },

      { t: 'h3', x: 'Step 3: Share your goals and intent' },
      { t: 'p', x: 'Every student has a different reason for connecting.' },
      {
        t: 'p',
        x: 'Some students want friendship, some want learning partners, while others want to build projects or startups. CollZap focuses on intent-based connections, helping students connect according to their interests and goals.',
      },

      { t: 'h3', x: 'Step 4: Choose your connection type' },
      { t: 'p', x: 'Students may want to connect in different ways:' },
      {
        t: 'ul',
        items: [
          'One-to-one connection',
          'Small group',
          'Project team',
          'Study circle',
          'Interest-based community',
          'Startup or business team',
        ],
      },
      {
        t: 'p',
        x: 'This gives students more flexibility to build the type of circle they are comfortable with.',
      },

      { t: 'h3', x: 'Step 5: Connect and grow together' },
      {
        t: 'p',
        x: 'After discovering relevant people, students can connect, communicate and explore opportunities together. The goal is to help students move from “I want to learn or build something” to “let’s find the right people and do it together”.',
      },

      { t: 'h2', x: 'What makes CollZap different?' },
      {
        t: 'p',
        x: 'There are already many social media and messaging platforms available today. However, most of them are not specifically designed to help students find the right people inside their own college.',
      },
      {
        t: 'p',
        x: 'Traditional social media is mainly designed for content, entertainment and followers, so finding a serious project partner or study circle can be difficult. Group chats are useful for communication, but many groups become crowded, inactive or unrelated to a student’s actual interests. Professional networking platforms are useful for career connections, but they may not focus on everyday college friendships, student communities and campus-based collaboration.',
      },
      { t: 'p', x: 'CollZap focuses on:' },
      {
        t: 'ul',
        items: [
          'College-specific connections',
          'Interest-based student discovery',
          'Intent-based matching',
          'Student collaboration',
          'Project and startup teams',
          'Learning and growth circles',
          'Meaningful campus communities',
        ],
      },
      { t: 'p', x: 'CollZap is not just about finding more people. It is about finding the right people.' },

      { t: 'h2', x: 'Who can use CollZap?' },
      {
        t: 'p',
        x: 'CollZap is designed for students who want to make their college experience more meaningful.',
      },
      {
        t: 'ul',
        items: [
          'Students interested in startups, entrepreneurship and business ideas.',
          'Developers and coders who want to work on projects, applications and websites.',
          'Content creators looking for video editors, designers, writers and photographers.',
          'Students looking for study partners and focused study circles.',
          'Ambitious students who want to improve their skills, habits and career opportunities.',
          'Community builders who want to organise events, create clubs and make an impact on campus.',
        ],
      },

      { t: 'h2', x: 'The vision behind CollZap' },
      {
        t: 'p',
        x: 'The vision of CollZap is to help students build better connections during their college journey.',
      },
      {
        t: 'p',
        x: 'Many students have talent, ideas and ambition, but they do not always have access to the right people or opportunities. A student may have a great idea but no team. Another student may have useful skills but no project. Someone may want to learn but may not have a supportive community.',
      },
      { t: 'p', x: 'CollZap wants to reduce this gap by helping students find each other.' },
      {
        t: 'p',
        x: 'Our long-term vision is to build a strong student networking platform where college students can discover like-minded peers, build friendships, learn together, work on projects, start businesses, find communities, share opportunities and support each other’s growth.',
      },
      {
        t: 'p',
        x: 'We believe that every student deserves the opportunity to find a circle that understands their interests and ambitions.',
      },

      { t: 'h2', x: 'Building a better college experience' },
      { t: 'p', x: 'College is not only about attending classes and passing exams.' },
      {
        t: 'p',
        x: 'It is also about exploring interests, building confidence, developing skills, meeting new people, creating projects, learning from others, finding opportunities and understanding your own potential.',
      },
      {
        t: 'p',
        x: 'The right people can make this journey more productive, exciting and meaningful.',
      },

      { t: 'h2', x: 'Our message to college students' },
      { t: 'p', x: 'You do not need to follow the same path as everyone else.' },
      {
        t: 'p',
        x: 'If you are interested in startups, find people who want to build. If you love coding, find people who want to create. If you enjoy learning, find people who want to grow. If you want to build something meaningful, find people who believe in your vision.',
      },
      {
        t: 'p',
        x: 'Your college may already have the people you are looking for. You just need a better way to discover them.',
      },
      { t: 'quote', x: 'Find Your Circle Before College Passes You By.' },
    ],
  },

  {
    slug: 'how-to-find-project-teammates-in-college',
    title: 'How to Find Project Teammates in College (Without Relying on Luck)',
    description:
      'Most students end up with whoever sat nearby. A practical guide to finding project teammates in college who actually finish what they start.',
    date: '2026-09-17',
    readingMinutes: 7,
    tags: ['Projects', 'How-to'],
    blocks: [
      {
        t: 'p',
        x: 'Almost every student ends up on a project team the same way: whoever was sitting nearby when the lecturer said "groups of four". It works out sometimes. Often it produces a team where one person writes the code, one person makes the slides at 2am, and two people are never heard from again.',
      },
      {
        t: 'p',
        x: 'The problem is not that your college lacks capable people. It is that there is no reliable way to find them. Here is how to fix that deliberately rather than hoping.',
      },

      { t: 'h2', x: 'Decide what you actually need before you look' },
      {
        t: 'p',
        x: 'Most people start by asking "who wants to join my project?" — the vaguest possible question, and the one most likely to attract people who will drop out. Before approaching anybody, get specific about three things.',
      },
      {
        t: 'ol',
        items: [
          'The role, not the person. "I need someone who can build a REST API" is findable. "I need a tech person" is not.',
          'The time commitment, honestly. Six hours a week for ten weeks is a real number people can say yes or no to. "It won’t take much time" is how you end up with someone who quietly disappears in week three.',
          'What they get out of it. A portfolio piece? A grade? Equity? Learning a specific skill? If you cannot answer this, you are asking for a favour, not offering a collaboration.',
        ],
      },
      {
        t: 'p',
        x: 'Writing these down takes ten minutes and eliminates most of the mismatches that kill student projects.',
      },

      { t: 'h2', x: 'Look where intent is already visible' },
      {
        t: 'p',
        x: 'The people most likely to finish a project with you have already shown some signal that they care about the thing. Those signals exist on every campus if you know where to look.',
      },
      {
        t: 'ul',
        items: [
          'Hackathon participants — they have already proven they will give up a weekend to build something.',
          'Club committees, not just club members. The difference between attending and organising is the difference between interest and commitment.',
          'People who ask questions in class, or who have a GitHub profile with more than a tutorial follow-along on it.',
          'Seniors who have shipped a project before. They know what the last two weeks actually feel like.',
        ],
      },
      {
        t: 'p',
        x: 'Notice that none of these are "my friends". Friendship is a poor predictor of whether someone will hit a deadline with you, and mixing the two badly can cost you both.',
      },

      { t: 'h2', x: 'Ask in a way that is easy to say no to' },
      {
        t: 'p',
        x: 'Counter-intuitive, but true: the easier you make it to decline, the better the people who say yes. A vague, high-pressure ask gets you polite agreement from people who never intended to show up.',
      },
      {
        t: 'p',
        x: 'A good ask is short and contains the specifics from step one. Something like: "I’m building a campus event app, I need someone on the backend, roughly six hours a week until November, you’d own the API end to end. Interested, or know someone who might be?"',
      },
      {
        t: 'p',
        x: 'That last clause matters more than people expect. Most good introductions come second-hand.',
      },

      { t: 'h2', x: 'Test with something small first' },
      {
        t: 'p',
        x: 'Never commit to a semester-long project with someone you have not worked with for a week. Run a trial: a weekend build, one feature, one small deliverable with a real deadline.',
      },
      { t: 'p', x: 'What you are actually testing is not skill. It is three other things.' },
      {
        t: 'ul',
        items: [
          'Do they reply? Not instantly — but within a day, reliably.',
          'Do they say when something is going wrong, or do they go quiet and hope?',
          'Do they finish the small thing? People who finish small things finish big ones.',
        ],
      },
      {
        t: 'p',
        x: 'Somebody brilliant who goes silent for a week will cost you more than somebody average who communicates. This is the single most common mistake students make when picking teammates.',
      },

      { t: 'h2', x: 'Agree on the boring things in writing' },
      {
        t: 'p',
        x: 'Before real work starts, get four things written down somewhere you both can see — a shared doc is fine.',
      },
      {
        t: 'ol',
        items: [
          'Who owns what. Not "we will figure it out" — actual names against actual parts.',
          'When you check in. A fifteen-minute call every Sunday beats a three-hour crisis meeting in week nine.',
          'What "done" means for the first milestone.',
          'What happens if someone needs to leave. Saying this out loud early removes the guilt that makes people ghost instead of quitting cleanly.',
        ],
      },
      {
        t: 'p',
        x: 'This feels excessive for a college project. It takes twenty minutes and prevents the failure mode that ends most of them.',
      },

      { t: 'h2', x: 'Where CollZap fits' },
      {
        t: 'p',
        x: `Everything above is findable manually — it just takes persistence and a lot of asking around. ${collzapIntro} Instead of hoping the right person happens to be in your lecture hall, you can filter for people on your campus who have already said they want to work on the same kind of thing.`,
      },
      {
        t: 'p',
        x: 'The advice still applies either way. Be specific, test small, write down the boring parts. The platform shortens the search; it does not replace the judgement.',
      },
    ],
  },

  {
    slug: 'how-to-find-a-co-founder-in-college',
    title: 'How to Find a Co-Founder in College',
    description:
      'College is the cheapest time in your life to start something. A practical guide to finding a co-founder on campus, what to look for, and the mistakes that end student startups early.',
    date: '2026-09-17',
    readingMinutes: 8,
    tags: ['Startups', 'How-to'],
    blocks: [
      {
        t: 'p',
        x: 'College is the cheapest time in your life to start something. Your fixed costs are low, your schedule is more flexible than it will ever be again, and you are surrounded by thousands of people with complementary skills who are not yet expensive to work with.',
      },
      {
        t: 'p',
        x: 'It is also the time when most people fail to take advantage of that, because finding a genuine co-founder is much harder than finding someone who says they are interested.',
      },

      { t: 'h2', x: 'A co-founder is not a teammate' },
      {
        t: 'p',
        x: 'This distinction gets blurred constantly, and blurring it is expensive. A teammate helps you build the thing. A co-founder shares the risk, the decisions and the ownership of the thing.',
      },
      {
        t: 'p',
        x: 'That means the bar is different. For a project teammate you are assessing whether they can do the work. For a co-founder you are assessing whether you can survive disagreeing with them for several years.',
      },
      {
        t: 'p',
        x: 'Most student startups do not die because the product was bad. They die because two people who liked each other discovered they wanted completely different things, and had never talked about it.',
      },

      { t: 'h2', x: 'What to actually look for' },
      { t: 'h3', x: 'Complementary skills, overlapping standards' },
      {
        t: 'p',
        x: 'Two developers building a product neither can sell is a common failure. So is a business student and a developer who disagree about whether something is ready to ship.',
      },
      {
        t: 'p',
        x: 'You want skills that do not overlap and standards that do. If one of you thinks "good enough" means it compiles and the other thinks it means it is tested, you will fight about everything forever.',
      },

      { t: 'h3', x: 'Evidence of finishing things' },
      {
        t: 'p',
        x: 'Ideas are not a differentiator; everyone has them. Look for evidence that this person has taken something from nothing to actually-exists, however small. A shipped side project, a club they actually ran, an event they organised end to end, a YouTube channel they kept going for a year.',
      },
      {
        t: 'p',
        x: 'Consistency over eighteen months tells you far more than brilliance over one weekend.',
      },

      { t: 'h3', x: 'How they behave when things go badly' },
      {
        t: 'p',
        x: 'You cannot assess this in a coffee chat. You can assess it by working together on something real and low-stakes first, and watching what happens the first time a deadline slips.',
      },
      {
        t: 'p',
        x: 'Do they communicate early, or do they go quiet? Do they take responsibility, or is it always circumstances? This is the highest-signal thing you will learn about someone, and you only learn it under mild pressure.',
      },

      { t: 'h2', x: 'Where to look on campus' },
      {
        t: 'ul',
        items: [
          'E-cells and entrepreneurship clubs — obvious, but go for the people organising rather than the people attending.',
          'Hackathons and case competitions. A weekend of forced pressure reveals more than a month of conversation.',
          'Other departments. The strongest founding pairs are usually cross-disciplinary, and your own department is the least likely place to find someone complementary.',
          'Seniors one or two years ahead who have already tried something and have scar tissue.',
        ],
      },
      {
        t: 'p',
        x: 'A warning about the most convenient option: your closest friend is the easiest person to start with and often the worst person to start with. Not always — some of the best founding teams are old friends — but the failure is much more costly, because you lose the friendship too. If you go that route, be more rigorous about the conversations below, not less.',
      },

      { t: 'h2', x: 'The conversation to have before you commit' },
      {
        t: 'p',
        x: 'Have this deliberately, early, and out loud. It is awkward for about ten minutes and saves you a year.',
      },
      {
        t: 'ol',
        items: [
          'What does success look like to you? A profitable small business and a funded company chasing scale are incompatible answers, and both are legitimate.',
          'What happens after graduation? If one of you is committed to a job offer and the other is going full-time, you need to know now.',
          'How many hours a week, realistically, during exam season?',
          'How do we split equity, and does it vest? Unvested equity is how people who left in month two still own a third of something four years later.',
          'How do we decide when we disagree and neither of us is obviously right?',
          'What would make you want to walk away?',
        ],
      },
      {
        t: 'p',
        x: 'If someone will not have this conversation, that is your answer. Wanting to skip it is itself the red flag.',
      },

      { t: 'h2', x: 'Start before you commit' },
      {
        t: 'p',
        x: 'Do not sign anything or announce a company. Build something together for four to six weeks first — a prototype, a landing page with real traffic, ten customer interviews you both sat in on.',
      },
      {
        t: 'p',
        x: 'You are testing the working relationship, and the cost of discovering a mismatch in week five is nearly zero. The cost of discovering it in year two, with equity split and users depending on you, is enormous.',
      },

      { t: 'h2', x: 'Where CollZap fits' },
      {
        t: 'p',
        x: `The hardest part of all of this is the first step — finding candidates at all when you cannot see past your own department. ${collzapIntro} You can look for people on your campus who have specifically said they are interested in building something long-term, rather than guessing.`,
      },
      {
        t: 'p',
        x: 'The filtering is still on you. Nothing replaces working with someone for a month before you commit to them for years.',
      },
    ],
  },

  {
    slug: 'build-a-study-group-that-actually-works',
    title: 'How to Build a Study Group That Doesn’t Die After Two Weeks',
    description:
      'Most college study groups collapse within a month. Why they fail, and how to structure one that survives the semester and actually improves your marks.',
    date: '2026-09-17',
    readingMinutes: 6,
    tags: ['Studying', 'How-to'],
    blocks: [
      {
        t: 'p',
        x: 'Almost every student has joined a study group that started with enthusiasm and a group chat, met twice, and then quietly became a place where people forward memes. The pattern is so reliable it is worth asking why.',
      },
      {
        t: 'p',
        x: 'Study groups do not fail because people are lazy. They fail because of four specific structural mistakes, all of which are fixable.',
      },

      { t: 'h2', x: 'Why most study groups collapse' },
      { t: 'h3', x: 'They are too big' },
      {
        t: 'p',
        x: 'Eight people is a social event. Beyond about five, someone can be silently absent without it being noticed, and once that is possible it becomes normal. Three to five is the range where every person is visibly load-bearing.',
      },

      { t: 'h3', x: 'They have no agenda' },
      {
        t: 'p',
        x: '"Let’s meet and study" produces two hours of parallel silence at best, and conversation at worst. Without a specific target for the session, there is no way to tell whether it worked, so nobody feels the loss when it stops happening.',
      },

      { t: 'h3', x: 'They mix commitment levels' },
      {
        t: 'p',
        x: 'This is the big one. Someone aiming for the top of the class and someone aiming to pass are not wrong, but they need different things from the same two hours. The mismatch is quietly frustrating for both, and the more committed person eventually stops showing up.',
      },

      { t: 'h3', x: 'They depend on everyone being free at once' },
      {
        t: 'p',
        x: 'Five students’ timetables have almost no common ground, so the meeting slides a little each week until it stops existing. A fixed slot that occasionally runs with three people beats a perfect slot that never happens.',
      },

      { t: 'h2', x: 'A structure that survives' },
      { t: 'h3', x: 'Same time, same place, no negotiation' },
      {
        t: 'p',
        x: 'Pick one slot and defend it. The group runs whether or not everyone can make it — quorum is two. Removing the weekly scheduling conversation removes the weekly opportunity to cancel.',
      },

      { t: 'h3', x: 'One person owns each session' },
      {
        t: 'p',
        x: 'Rotate it. That person picks what the session covers and brings the problems. It takes fifteen minutes of preparation and it is the difference between a study group and a room with people in it.',
      },
      {
        t: 'p',
        x: 'It also produces the single most effective study technique available, almost by accident: you will be explaining something to other people, which is where you find out what you do not actually understand.',
      },

      { t: 'h3', x: 'Work first, talk after' },
      {
        t: 'p',
        x: 'A structure that works well: fifty minutes of silent individual work on the same material, ten minutes comparing where people got stuck, repeat once, then twenty minutes of open discussion at the end.',
      },
      {
        t: 'p',
        x: 'The silence is not antisocial. It is what makes the discussion afterwards worth having, because everyone has hit the same wall.',
      },

      { t: 'h3', x: 'End every session by naming the next one' },
      {
        t: 'p',
        x: 'Before anyone leaves: what are we covering next week, and who is running it? Thirty seconds. This one habit does more for continuity than anything else on this list.',
      },

      { t: 'h2', x: 'Be honest about the commitment level' },
      {
        t: 'p',
        x: 'When you form the group, say out loud what you are aiming for and how many hours a week you intend to put in. Let people self-select out. A group of three people who all want the same thing will outlast a group of eight who never discussed it.',
      },
      {
        t: 'p',
        x: 'This feels unfriendly. It is the opposite — it is what stops the group from slowly becoming an obligation that everyone resents and nobody wants to be the first to leave.',
      },

      { t: 'h2', x: 'Where CollZap fits' },
      {
        t: 'p',
        x: `Matching on the subject is the easy part. Matching on how seriously people are approaching it is what actually determines whether the group survives, and it is the thing you usually only discover a month in. ${collzapIntro}`,
      },
      {
        t: 'p',
        x: 'Structure still does the real work. But starting with people whose commitment level genuinely matches yours removes the most common reason these groups fall apart.',
      },
    ],
  },
];

/** Newest first, which is the order the index page and sitemap both want. */
export const POSTS_BY_DATE = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));

export const POST_PATHS = POSTS.map((p) => `${BLOG_BASE}/${p.slug}`);

export function getPost(slug) {
  return POSTS.find((p) => p.slug === slug) || null;
}
