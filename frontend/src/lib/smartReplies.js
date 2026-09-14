/**
 * Smart replies: short tap-to-send suggestions above the chat composer, in
 * the spirit of LinkedIn's.
 *
 * Deliberately rule-based and computed on the device. Chat text never leaves
 * the browser to produce these — CollZap promises that conversations stay
 * private, and shipping messages to a third-party model just to guess "Thanks"
 * would quietly break that promise.
 */

const MAX_REPLIES = 3;

// First matching rule wins, so order matters. Intent-bearing rules (meeting,
// questions) come before politeness ones, because "Thanks, can you send the
// notes?" wants an answer, not "You're welcome".
const RULES = [
  {
    test: /\b(meet|call|catch up|sync up|when are you free|free (today|tomorrow|tonight|this week))\b/i,
    replies: ['Works for me', 'What time suits you?', 'Can we do later this week?'],
  },
  {
    test: /\?\s*$/,
    replies: ['Yes', 'Not sure yet', 'Let me check'],
  },
  {
    test: /\b(thanks|thank you|thx|tysm|ty)\b/i,
    replies: ["You're welcome!", 'Anytime', '👍'],
  },
  {
    test: /\b(sorry|my bad|apologies)\b/i,
    replies: ['No worries!', 'All good', '👍'],
  },
  {
    test: /https?:\/\/\S+/i,
    replies: ['Thanks for sharing!', 'Checking it out', '👀'],
  },
  {
    // Only a bare greeting. "Hey, can we meet tomorrow?" is a meeting request,
    // and "his idea was good" is not a greeting at all.
    // The `u` flag keeps 👋 one character inside the class; without it the
    // emoji is split into two surrogate halves and only matches by accident.
    test: /^\s*(hi+|hey+|hello|yo|namaste)\b[\s!.,👋]*$/iu,
    replies: ['Hey!', "Hi! How's it going?", '👋'],
  },
];

const DEFAULT_REPLIES = ['Sounds good', 'Thanks', '👍'];

/** Conversation starters for a room nobody has spoken in yet. */
function openers(room) {
  const isGroup = (room?.members?.length || 0) > 2;
  const interest = room?.interestName?.trim();

  if (isGroup) {
    return [
      'Hey everyone! 👋',
      interest ? `Hi all, keen to start on ${interest}` : 'Hi all, keen to get started',
      'When is everyone free?',
    ];
  }
  return [
    'Hey! 👋',
    interest ? `Hi! Excited to work on ${interest}` : 'Hi! Excited to connect',
    'When are you free to talk?',
  ];
}

/**
 * @param {object} args
 * @param {object|null} args.lastMessage  The most recent message in the room, or null if empty.
 * @param {object|null} args.room         The room detail (for interest name and member count).
 * @returns {string[]} Up to three suggestions. Empty when there is nothing to reply to.
 */
export function getSmartReplies({ lastMessage, room }) {
  if (!lastMessage) return openers(room).slice(0, MAX_REPLIES);

  // You spoke last — the ball is in their court, so suggest nothing.
  if (lastMessage.mine) return [];

  const text = (lastMessage.content || '').trim();
  if (!text) return [];

  const rule = RULES.find((r) => r.test.test(text));
  return (rule ? rule.replies : DEFAULT_REPLIES).slice(0, MAX_REPLIES);
}
