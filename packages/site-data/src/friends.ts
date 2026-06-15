export interface Friend {
  username: string;
  description: string;
}

export type FriendGroup = {
  id: string;
  title: string;
  description: string;
  friends: Friend[];
};

const developedFriends: Friend[] = [
  {
    username: 'eljcfran',
    description:
      'A wonderful artist and one of the few people I can talk to about the simple rhythm of everyday life. Her kindness and her growth as a creator are things I deeply admire. She was the one who reached out first, drawn to my art and music, and our connection grew with a speed that surprised me. I value the foundation we’ve built, and I’m committed to being more present and open so this bond can continue to deepen naturally.'
  },
  {
    username: 'daisukihotaru',
    description:
      "Someone I truly love chatting with. Her dedication to A Condition Called Love is impressive, and her support was a huge reason my work reached so many people. Even though our conversations aren't as constant as they once were, I value the healthy, respectful closeness we share. I want to keep growing as a person so I can continue to meet her warmth with my own as our friendship evolves."
  }
];

const buddingFriends: Friend[] = [
  {
    username: 'multiplee_',
    description:
      "A fellow fan of Kemutai Hanashi! We talk a lot in the server, which is a really fun coincidence. I'm still getting to know them, and since I usually take a while before adding people on Discord, I'm just taking things slow. But if it goes, then it goes—I'm happy to see where it leads."
  },
  {
    username: '_azuace',
    description:
      "A fellow fan of Kemutai Hanashi whom I first noticed on Tumblr. We’ve been talking a bit more lately and sharing thoughts on the server, bringing us a little closer. Really, they are one of the most wonderful people I've ever met, and I'm so glad to connect with them—it's actually my first time getting to know someone in the nonbinary/aroace spectrum. Through them, I've seen so many things I didn't know before, alongside a shared love for art. I know how hard it must have been, and I'm truly happy that they came out and found acceptance. I hope that one day we can bridge the remaining gap and build a comfortable friendship."
  }
];

const growingFriends: Friend[] = [
  {
    username: 'thatyamakun',
    description:
      "She's one of the most dedicated Witch Hat Atelier fans, and someone I genuinely appreciate. She was actually among the first to notice and support my Kemutai Hanashi work, which meant a lot to me. I hope we can slowly move past the creator-fan stage and build a real, comfortable connection over time."
  },
  {
    username: 'goinghostie',
    description:
      "A fellow fan of Hoshiai no Sora and other niche series. We crossed paths back in early 2025, and lately, we've been interacting more frequently through sharing fanart. I really value having them around in my circle, and I'm hoping we can make our chats feel even more casual and natural as we go."
  },
  {
    username: 'octobersfilm',
    description:
      "A wonderful writer whose outlook on art and life really resonates with me. She was actually one of the very few people I felt brave enough to reach out to first. I'd love to visit Indonesia someday and meet her in person, turning our online chats into a casual, warm conversation over coffee."
  }
];

const upcomingFriends: Friend[] = [
  {
    username: 'to_nikaku',
    description:
      'An incredibly talented artist whose passion for her craft, and her quirks, like her love for dishwashers, is genuinely inspiring. When she followed me back after I shared some late-night reflections, it was a moment where I felt truly seen. It’s an experience I value deeply.'
  },
  {
    username: 'skipsyourloafer',
    description:
      "It was such a surprise to be recognized for my random Mika and Mukai drawings through him. We mainly connect through our art, but I’m eager to see what lies beyond that. Having a connection all the way in Sweden makes the world feel a little smaller and less lonely."
  },
  {
    username: 'lilatheduckk',
    description:
      'I admire her thoughts and her fan fiction immensely. We connected after I translated an interview for her, but I sometimes worry that I’m the one doing all the leaning. I want to move toward a more organic, no-pressure friendship where we just exist in each other’s worlds.'
  },
  {
    username: 'kuusand',
    description:
      'One of my very first supporters. I even created an artwork just for her because of how much her early encouragement meant. Lately, the connection has felt a bit "heavy," and I’ve been overthinking it. I want to lift that weight and find a way for us to connect naturally and casually again.'
  },
  {
    username: 'maomao_2605',
    description:
      'A creator I’ve admired from afar for a long time. Her "nerdy" passion for Fruits Basket and Haikyuu is infectious. We haven’t officially talked yet, and she feels a bit like a distant star, but I’m determined to find the right moment to finally start a conversation.'
  }
];

export const friendGroups: FriendGroup[] = [
  {
    id: 'developed',
    title: 'Developed',
    description: 'Connections with a steady shape and a little history.',
    friends: developedFriends
  },
  {
    id: 'budding',
    title: 'Budding',
    description: 'New conversations that still feel tender and open.',
    friends: buddingFriends
  },
  {
    id: 'growing',
    title: 'Growing',
    description: 'Friendships slowly gathering more ordinary rhythm.',
    friends: growingFriends
  },
  {
    id: 'upcoming',
    title: 'Upcoming',
    description: 'People I hope to know with more patience and courage.',
    friends: upcomingFriends
  }
];
