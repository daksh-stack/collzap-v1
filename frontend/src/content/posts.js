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

  {
    slug: 'why-i-built-collzap',
    title: "Why I Built CollZap — The Story Behind India's First Campus Peer Matching Platform",
    description:
      "Nitish Kumar, founder of CollZap, shares the real story behind building India's first campus peer matching platform — why he built it, what problem it solves, and how it works for college students.",
    date: '2026-09-17',
    readingMinutes: 10,
    tags: ['Founder Story', 'CollZap', 'EdTech India'],
    blocks: [
      { t: 'p', x: 'By Nitish Kumar, Founder & CEO, CollZap' },

      { t: 'h2', x: 'The Day I Realized I Had the Wrong Circle' },
      { t: 'p', x: 'It was my first week of college.' },
      {
        t: 'p',
        x: 'I walked into a classroom full of strangers, sat next to whoever was available, and within days — almost without thinking — those people became my friend group. Not because we had the same goals. Not because we were serious about the same things. Simply because we were in the same place at the same time.',
      },
      { t: 'p', x: 'I did not choose my circle. My circle chose me — by accident.' },
      {
        t: 'p',
        x: 'For months, I kept that to myself. I assumed it was just me — that everyone else had figured it out. But the more I spoke to students across different colleges, the more I realized this was not a personal problem. It was a shared, silent epidemic that nobody was talking about.',
      },
      { t: 'p', x: 'That realization became the foundation of CollZap.' },

      { t: 'h2', x: 'The Problem Nobody Was Solving' },
      { t: 'p', x: 'I started asking questions.' },
      {
        t: 'p',
        x: 'I talked to students from engineering colleges, management institutes, arts colleges. I conducted over 120 face-to-face conversations with college students. I asked them one simple question:',
      },
      {
        t: 'quote',
        x: 'Do you have at least one peer in your college who is as serious about your interest as you are?',
      },
      { t: 'p', x: 'The answers broke my heart.' },
      {
        t: 'p',
        x: 'Most students said no. Not because serious peers did not exist on their campus — but because they had no way to find them. They ended up in circles built by chance — hostel floors, classroom seats, canteen tables. Random proximity, not shared purpose.',
      },
      { t: 'p', x: 'The numbers backed up what I was hearing:' },
      {
        t: 'ul',
        items: [
          'More than 50% of college students globally report feeling lonely on campus',
          '69.9% of Indian college students experience moderate to high anxiety',
          'Students today spend 70% less time with peers in person than two decades ago',
          '82% of Indian youth say the wrong peer circle slowed down their personal growth',
        ],
      },
      {
        t: 'p',
        x: 'These were not small numbers. This was a generation of ambitious students growing alone — surrounded by people, but genuinely disconnected from anyone who matched their drive.',
      },

      { t: 'h2', x: 'What I Tried Before Building CollZap' },
      { t: 'p', x: 'Like every student, I tried the obvious solutions.' },
      {
        t: 'p',
        x: 'WhatsApp groups — good for staying connected with people I already knew. Useless for discovering someone new who shared my serious interests.',
      },
      {
        t: 'p',
        x: 'LinkedIn — too formal, too transactional. Nobody connects on LinkedIn to find a study partner or a startup co-founder from their own college.',
      },
      {
        t: 'p',
        x: 'Instagram DMs — I once sent a message to someone whose posts I admired. It felt weird. It was weird. No structure, no context, no safety.',
      },
      {
        t: 'p',
        x: 'Asking around — I literally asked friends "do you know anyone serious about startups on campus?" The answer was always vague. Someone knew someone who knew someone.',
      },
      {
        t: 'p',
        x: 'None of these worked because they were all designed for a different purpose. There was no platform built specifically for one thing — helping a college student find a serious, verified peer within their own campus.',
      },
      { t: 'p', x: 'That gap was so obvious I could not believe nobody had filled it.' },

      { t: 'h2', x: 'The Moment CollZap Was Born' },
      {
        t: 'p',
        x: 'I was sitting alone in my room one evening — frustrated after another unproductive attempt at finding someone serious to work with on an idea I had.',
      },
      { t: 'p', x: 'I thought — what if there was a platform where:' },
      {
        t: 'ul',
        items: [
          'You could verify that the other person actually goes to your college',
          'You could filter by interest — not just "tech" but specifically coding, or AI, or startups',
          'You could assess seriousness — not just what someone claims to be interested in, but how deeply they are actually committed',
          'And then match you automatically with the right person at the right level',
        ],
      },
      {
        t: 'p',
        x: 'Not a social media app. Not a dating app with a study partner twist. Something entirely new — a campus-based peer matching platform built specifically for ambitious students who want to grow.',
      },
      { t: 'p', x: 'I opened my notebook and wrote three words at the top of the page.' },
      { t: 'quote', x: 'Find Your People.' },
      { t: 'p', x: 'CollZap was born that night.' },

      { t: 'h2', x: 'What CollZap Actually Does' },
      { t: 'p', x: "CollZap is India's first campus-based peer matching platform. Here is how it works:" },

      { t: 'h3', x: 'Step 1 — Verify' },
      {
        t: 'p',
        x: 'Students sign up with their college email or upload their college ID. Only real, verified students from your campus get access.',
      },

      { t: 'h3', x: 'Step 2 — Select interest' },
      {
        t: 'p',
        x: 'Choose from 17 long-term interests — Coding, AI and Data Science, Startups, Finance, Design, Music, Writing, Fitness, Sports, Gaming, and more. Or pick from 7 short-term activities for specific goal-based collaboration.',
      },

      { t: 'h3', x: 'Step 3 — Take the seriousness assessment' },
      {
        t: 'p',
        x: 'Answer 20 behavioural and commitment-based questions. CollZap places you at one of four levels — Explorer, Learner, Practitioner, or Builder. This is not a test you can fake — it measures what you actually do, not what you claim.',
      },

      { t: 'h3', x: 'Step 4 — Get matched' },
      {
        t: 'p',
        x: 'CollZap automatically matches you with a peer from your own campus who shares your interest and is at the same level. You connect as a 1-on-1 pair, a Short Group of up to 4, or join a campus-wide Society.',
      },

      { t: 'h3', x: 'Step 5 — Grow together' },
      {
        t: 'p',
        x: 'The match opens a chat. Built-in conversation suggestions help you go from first message to fixing a real campus meeting fast.',
      },
      { t: 'p', x: 'No random connections. No noise. Just the right person, at the right level, from your own campus.' },

      { t: 'h2', x: 'Why "Campus-Based" Matters So Much' },
      { t: 'p', x: 'This is the part most people underestimate.' },
      {
        t: 'p',
        x: 'When I first described CollZap to people, they would ask — why limit it to one campus? Why not match students from across India?',
      },
      { t: 'p', x: 'The answer is simple.' },
      { t: 'p', x: 'The peer relationship only works when it is physically possible.' },
      {
        t: 'p',
        x: 'If your accountability partner is in Mumbai and you are in Jind, Haryana — you can never sit down together, study in the same library, attend the same hackathon, or push each other in person. The match becomes another WhatsApp contact you never really connect with.',
      },
      {
        t: 'p',
        x: 'Campus proximity is not a limitation — it is the entire point. CollZap is designed to create relationships that spill out of the app and into real life. A coffee in the canteen. A study session in the library. A late-night coding sprint in the hostel room.',
      },
      { t: 'p', x: 'That is the kind of peer relationship that actually changes your college years.' },

      { t: 'h2', x: 'The Validation That Convinced Me to Keep Going' },
      { t: 'p', x: 'Before writing a single line of code, I went to colleges and talked to students.' },
      {
        t: 'p',
        x: 'At Lovely Professional University alone, I surveyed over 120 students. 87% of them said they would use CollZap if it existed on their campus.',
      },
      { t: 'p', x: 'More importantly, the conversations I had in those interviews stayed with me.' },
      {
        t: 'quote',
        x: 'I have been looking for someone like this since Day 1 of college. Someone who is actually serious. I just did not know how to find them.',
      },
      {
        t: 'quote',
        x: 'I do not want people browsing my profile like a shopping app. I just want someone to be automatically matched with me — someone who actually wants to build things.',
      },
      { t: 'p', x: 'Those words are why I wake up and work on CollZap every day.' },

      { t: 'h2', x: 'What We Are Building Toward' },
      {
        t: 'p',
        x: 'CollZap launched its beta version at collzap.com and is currently onboarding its first campus cohort.',
      },
      { t: 'p', x: 'The vision is bigger than a college app.' },
      {
        t: 'p',
        x: 'We are building the infrastructure for intentional peer relationships at every stage of student life. Today it is campus matching. Tomorrow it is mentorship, collaborative learning, and eventually — a verified network of serious people who found each other at the right time.',
      },
      {
        t: 'p',
        x: 'India has 45 million college students. Most of them are growing alone — not because serious peers do not exist, but because there has never been a platform to bring them together deliberately.',
      },
      { t: 'p', x: 'CollZap is that platform.' },

      { t: 'h2', x: 'A Note to Every Ambitious Student Reading This' },
      {
        t: 'p',
        x: 'If you have ever felt like the smartest, most driven person in your friend group — and hated that feeling — this is for you.',
      },
      {
        t: 'p',
        x: 'If you have ever wished you had just one person who was as serious as you, who pushed you, who held you accountable, who understood the obsession — this is for you.',
      },
      { t: 'p', x: 'You are not alone. The peer you are looking for is on your campus right now — waiting to be found.' },
      { t: 'quote', x: 'Go to collzap.com and find them.' },
      {
        t: 'p',
        x: 'Nitish Kumar is the Founder and CEO of CollZap — India’s first campus-based peer matching platform. He is a BBA student at Chaudhary Ranbir Singh University, Jind, Haryana, and has been building CollZap while completing his degree. You can reach him at nitishkumar@collzap.com.',
      },
    ],
  },

  {
    slug: 'wrong-peer-circle-in-college',
    title: 'The Wrong Circle Is Silently Stealing Your Best Years — And Nobody Is Talking About It',
    description:
      'The wrong peer circle in college silently destroys your potential — and most students never realize it until it is too late. Learn how the wrong circle works, what it costs you, and how CollZap helps you find the right peers on your campus.',
    date: '2026-09-18',
    readingMinutes: 12,
    tags: ['Peer Circle', 'College Life India', 'CollZap'],
    blocks: [
      { t: 'p', x: 'By Nitish Kumar, Founder & CEO, CollZap' },

      { t: 'h2', x: 'You Arrived at College With Everything. Then Something Happened.' },
      { t: 'p', x: 'You remember the feeling.' },
      {
        t: 'p',
        x: 'First day of college. New city, new campus, new chapter. You had goals. You had energy. You had this quiet, burning belief that college was going to be the time you finally became who you were meant to be.',
      },
      { t: 'p', x: 'Then the weeks passed.' },
      {
        t: 'p',
        x: 'Without thinking, without choosing, without realizing — you ended up with a circle. The person who sat next to you in the first lecture. The roommate assigned to you in the hostel. The group that formed because everyone was equally lost and equally bored in those first few days.',
      },
      { t: 'p', x: 'You did not choose them. They just appeared.' },
      { t: 'p', x: 'And slowly — so slowly you barely noticed — that circle started shaping you.' },

      { t: 'h2', x: 'The Most Dangerous Thing in College Is Not Failure. It Is the Wrong Circle.' },
      {
        t: 'p',
        x: 'Most people talk about wrong choices in college — the wrong branch, the wrong city, the wrong college. Nobody talks about the wrong circle.',
      },
      { t: 'p', x: 'But here is the truth that nobody told you before you left home:' },
      {
        t: 'quote',
        x: 'Your peer circle in college will determine more about your future than your degree, your grades, or your professors.',
      },
      { t: 'p', x: 'Research backs this up completely.' },
      {
        t: 'p',
        x: 'Studies show that the people you spend the most time with directly influence your habits, your ambitions, your risk tolerance, and your outcomes. Psychologists and behavioral economists have studied this for decades.',
      },
      {
        t: 'quote',
        x: 'You are the average of the five people you spend the most time with. — Jim Rohn',
      },
      {
        t: 'p',
        x: 'In college, you spend more time with your peer circle than with anyone else. More than your family. More than your professors. More than anyone.',
      },
      { t: 'p', x: 'Which means if your circle is not serious — you will stop being serious too.' },
      { t: 'p', x: 'Not dramatically. Not all at once. Just quietly, gradually, inevitably.' },

      { t: 'h2', x: 'What the Wrong Circle Actually Does to You' },
      { t: 'p', x: 'It does not happen overnight. That is what makes it so dangerous.' },
      {
        t: 'p',
        x: 'The wrong circle does not destroy your potential in one big moment. It chips away at it — slowly, consistently, invisibly — until one day you look up and realize that two years have passed and you are nowhere near where you wanted to be.',
      },
      { t: 'p', x: 'Here is exactly how it happens:' },

      { t: 'h3', x: 'Your Standards Drop Without You Noticing' },
      {
        t: 'p',
        x: 'When nobody around you is working on something serious, seriousness starts to feel abnormal. You stop talking about your goals because nobody around you has any. You stop working late because everyone else is watching reels. You stop pushing yourself because there is nobody pushing back.',
      },
      { t: 'p', x: 'The bar lowers. And the terrifying thing is — you lower with it.' },

      { t: 'h3', x: 'Your Time Gets Consumed by the Lowest Common Denominator' },
      {
        t: 'p',
        x: 'Every group has a lowest common denominator — the activity that everyone agrees on. In most college circles, that activity is not studying, building, or growing. It is hanging out, scrolling, and doing nothing in particular.',
      },
      {
        t: 'p',
        x: 'The wrong circle does not force you to waste time. It simply makes wasting time the path of least resistance. And humans — especially tired, stressed college students — always take the path of least resistance.',
      },

      { t: 'h3', x: 'Your Ambitions Start to Feel Embarrassing' },
      { t: 'p', x: 'This one hurts to say but it is true.' },
      {
        t: 'p',
        x: 'When you talk about your goals — your startup idea, your plan to crack a competitive exam, your dream of becoming a serious coder — and nobody around you takes it seriously, something shifts inside you. You start qualifying your ambitions. You stop saying them out loud. Eventually you stop believing them yourself.',
      },
      {
        t: 'p',
        x: 'The wrong circle does not mock your dreams directly. It just creates an atmosphere where dreaming feels uncool.',
      },

      { t: 'h3', x: 'Your Growth Slows to a Crawl' },
      {
        t: 'p',
        x: 'Serious growth requires friction. It requires someone who challenges you, questions your assumptions, pushes you harder than you would push yourself, and holds you accountable when you want to give up.',
      },
      {
        t: 'p',
        x: 'The wrong circle provides none of this. There is no friction. No accountability. No one to challenge you. No one who even notices when you stop trying.',
      },
      { t: 'p', x: 'You plateau. And you mistake the plateau for contentment.' },

      { t: 'h2', x: 'The Numbers Tell a Brutal Story' },
      { t: 'p', x: 'This is not just a feeling. The data is stark.' },
      {
        t: 'ul',
        items: [
          '82% of Indian youth say the wrong peer circle directly slowed down their personal and professional growth',
          '50% of college students globally report feeling lonely on campus despite being surrounded by thousands of people',
          '69.9% of Indian college students experience moderate to high levels of anxiety, with peer isolation cited as a contributing factor',
          'Students today report spending significantly less time in meaningful peer interaction than students did two decades ago',
        ],
      },
      {
        t: 'p',
        x: 'The loneliness on Indian campuses is real. And it is not the loneliness of having no friends. It is the deeper, quieter loneliness of having friends who do not understand what you are trying to become.',
      },

      { t: 'h2', x: 'The Worst Part — You Probably Do Not Even Realize It Is Happening' },
      { t: 'p', x: 'Ask yourself these questions honestly:' },
      {
        t: 'ul',
        items: [
          'When did you last have a conversation with someone from your college about something you are genuinely working on?',
          'Does anyone in your current circle hold you accountable when you say you are going to do something?',
          'Do the people around you make you feel more ambitious or less ambitious?',
          'Have your standards for yourself gone up or down since you started college?',
          'Are you the most driven person in your circle — or is someone consistently pushing you to be better?',
        ],
      },
      { t: 'p', x: 'If those questions made you uncomfortable, you already know the answer.' },
      {
        t: 'p',
        x: 'The wrong circle is not always loud and obvious. Sometimes it is just a group of decent, likeable people who are not going anywhere in particular — and who will very gently, very kindly take you nowhere with them.',
      },

      { t: 'h2', x: 'The Compounding Cost of Wasted College Years' },
      { t: 'p', x: 'Here is something nobody calculates.' },
      {
        t: 'p',
        x: 'College is four years. That is 1,460 days. Roughly 35,000 waking hours. In those 35,000 hours, the difference between a student with the right circle and a student with the wrong circle compounds dramatically.',
      },

      { t: 'h3', x: 'The student with the right circle' },
      {
        t: 'ul',
        items: [
          'Builds something real — a project, a skill, a body of work',
          'Develops accountability habits that carry into their career',
          'Gets introduced to opportunities through their peer network',
          'Grows their confidence by being around people who believe in growth',
          'Enters the real world with momentum',
        ],
      },

      { t: 'h3', x: 'The student with the wrong circle' },
      {
        t: 'ul',
        items: [
          'Consumes more than they create',
          'Develops habits of comfort and avoidance',
          'Misses opportunities they never even heard about',
          'Enters the real world starting from scratch',
        ],
      },
      {
        t: 'p',
        x: 'Four years. 35,000 hours. The same intelligence, the same potential, the same starting point — but completely different outcomes. Because of the circle.',
      },

      { t: 'h2', x: 'It Is Not Your Fault. But It Is Your Responsibility.' },
      {
        t: 'p',
        x: 'The wrong circle is not usually a choice. It happens by default — by proximity, by accident, by the randomness of which seat you sat in on the first day.',
      },
      {
        t: 'p',
        x: 'So this is not about blame. This is not about feeling bad about where you are. This is about recognizing what is happening and deciding to change it.',
      },
      {
        t: 'p',
        x: 'Because here is the truth — the right peers exist on your campus right now. The serious coder who is building something real. The finance student who actually tracks markets. The person who is preparing for competitive exams with the same obsession you have. The startup-minded student who has been looking for exactly the kind of person you are.',
      },
      { t: 'p', x: 'They exist. You just have not found each other yet.' },
      { t: 'p', x: 'Because until now, there was no system for finding them.' },

      { t: 'h2', x: 'What the Right Circle Actually Does For You' },
      {
        t: 'p',
        x: 'The right peer circle is not just the absence of bad influence. It is an active accelerant. When you find even one person who is as serious as you about the same thing — everything changes.',
      },
      {
        t: 'ul',
        items: [
          'Your standards rise automatically — when the person next to you is working harder than you, you work harder. Not out of competition, out of inspiration.',
          'Your consistency improves — accountability is not about someone checking on you, it is about not wanting to show up to your next conversation with nothing to report.',
          'Your ideas get better — thinking alongside someone who challenges your assumptions produces sharper thinking than thinking alone ever could.',
          'Your network opens up — the right peer introduces you to their network, and opportunities compound.',
          'Your belief in yourself grows — when someone serious believes in what you are doing, it becomes easier to believe in it yourself.',
        ],
      },
      {
        t: 'p',
        x: 'One right peer can change the entire trajectory of your college years. That is not an exaggeration.',
      },

      { t: 'h2', x: 'The Problem With Every Existing Solution' },
      { t: 'p', x: 'You have probably already tried to solve this on your own.' },
      {
        t: 'p',
        x: 'WhatsApp groups — you joined the coding group, the finance group, the startup group. For two weeks there was activity. Then silence. Because groups are not relationships. And the people in those groups are from everywhere — not your campus.',
      },
      {
        t: 'p',
        x: 'LinkedIn — too professional, too performative. Nobody admits vulnerability on LinkedIn. Nobody says "I am stuck and I need a peer." It is all highlight reels.',
      },
      {
        t: 'p',
        x: 'Instagram DMs — you found someone whose posts you respected. You sent a DM. It was awkward. Nothing came of it. No structure, no context, no reason for them to trust a random message.',
      },
      {
        t: 'p',
        x: 'Asking around — you asked friends if they knew anyone serious about a particular thing. They said maybe, they would ask around. Nothing happened.',
      },
      {
        t: 'p',
        x: 'Every solution failed for the same reason: they were not built for this specific problem. They were built for networking, socializing, or entertainment — not for deliberately finding a serious, verified, compatible peer within your own campus.',
      },

      { t: 'h2', x: 'CollZap Was Built for Exactly This Moment' },
      { t: 'p', x: "CollZap is India's first campus-based peer matching platform." },
      {
        t: 'p',
        x: 'It does one thing — and it does it specifically. It helps you find a serious, verified, interest-matched peer from your own campus — at your exact knowledge level — so you can grow together in person.',
      },
      {
        t: 'ul',
        items: [
          'Verified identity — every user is verified through their college email or college ID. No outsiders. No fake profiles. Only real students from your campus.',
          'Interest-based matching — choose from 17 serious long-term interests. Not "tech" — specifically Coding, AI and Data Science, Startups, Finance, Design, Music, Writing, Sports, and more.',
          'Seriousness assessment — answer 20 behavioral questions that measure what you actually do, not what you say you do. Get placed at Explorer, Learner, Practitioner, or Builder level.',
          'Automatic matching — CollZap finds someone from your campus at the same interest and the same level. You do not browse. You do not swipe. You get matched.',
          'Built-in conversation flow — smart suggestions help your first conversation go from hello to fixing a real campus meeting, fast.',
        ],
      },
      {
        t: 'p',
        x: 'This is not another social app. This is not a study group finder. This is a system designed to give every ambitious student the peer they deserve — on their own campus.',
      },

      { t: 'h2', x: 'Your College Years Are Not Gone Yet' },
      {
        t: 'p',
        x: 'If you are reading this and feeling the weight of time already lost — stop.',
      },
      { t: 'p', x: 'The best time to find the right peer was Day 1 of college. The second best time is today.' },
      {
        t: 'p',
        x: 'Your remaining college years — whether it is one semester or three — are worth fighting for. The right peer found today can still change everything.',
      },
      { t: 'p', x: 'Go to collzap.com right now. Sign up. Take the assessment. Get matched.' },
      { t: 'p', x: 'Find the person on your campus who has been waiting for someone exactly like you.' },
      { t: 'quote', x: 'The wrong circle already had too much of your time. Do not give it one more day.' },
      {
        t: 'p',
        x: 'Nitish Kumar is the Founder and CEO of CollZap — India’s first campus-based peer matching platform. Built for every ambitious Indian college student who deserves a serious peer. Visit collzap.com to get matched with your peer today.',
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
