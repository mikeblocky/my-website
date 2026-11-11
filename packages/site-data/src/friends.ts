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
      "A kind, supportive friend and a wonderful artist. I always enjoy our conversations about art, music, and the little things in everyday life. She makes it easy to share what I've been working on, and I like seeing where her own art takes her."
  },
  {
    username: 'daisukihotaru',
    description:
      "Pragati brings so much love to A Condition Called Love and Hanaru. She's fun to talk to, and I really appreciate the support and friends she's brought into my life. I love seeing how excited she gets about the characters, and there's usually something fun to talk about whenever they come up."
  }
];

const buddingFriends: Friend[] = [
  {
    username: 'multiplee_',
    description:
      "We met through Kemutai Hanashi and often chat in the server. They also introduced me to Polish music, which has been such a fun thing to explore. I like how a conversation about one shared interest can lead to discovering something completely different. The music recommendations have been a lovely part of that."
  },
  {
    username: 'beyondlaboira',
    description:
      "A lovely person I met through our shared love of Kemutai Hanashi. They're thoughtful, supportive, and always a pleasure to talk to. I appreciate the kindness they bring to our conversations. It's been nice getting to know them beyond the stories and art we both enjoy."
  }
];

const growingFriends: Friend[] = [
  {
    username: 'thatyamakun',
    description:
      "A dedicated Witch Hat Atelier fan who supported my Kemutai Hanashi art early on. I appreciate her kindness and enjoy seeing her love for the things she cares about. It's nice seeing someone put that much care into the stories they love. Her early encouragement is something I still remember fondly."
  },
  {
    username: 'goinghostie',
    description:
      "We connected over Hoshiai no Sora and have been sharing fanart and chatting since early 2025. It's always nice finding someone who loves the same little corners of anime as you. Sharing fanart gives us plenty to talk about, and I enjoy hearing what they think about the characters we both like."
  },
  {
    username: 'octobersfilm',
    description:
      "Ghina is a wonderful writer, and I enjoy hearing her thoughts on art, movies, and life. Our chats are always a good time. I'd love to meet her in person someday and talk over coffee. Whether it's TXT, a movie, or just something from our day, I like being able to share those little moments with her."
  }
];

const upcomingFriends: Friend[] = [
  {
    username: 'to_nikaku',
    description:
      "An artist whose drawings I always love seeing. Her work is beautiful, and her sense of humor makes her posts just as fun to follow. I enjoy seeing the little choices that give her drawings their character. She's one of those artists whose posts I always stop to look at."
  },
  {
    username: 'skipsyourloafer',
    description:
      "We connected through my Mika and Mukai drawings. It's been fun sharing that love of Skip and Loafer and getting to know each other through art. Mika and Mukai will probably always remind me of that connection. I like that a few drawings gave us something to start talking about."
  },
  {
    username: 'lilatheduckk',
    description:
      "I really enjoy her writing and the way she thinks about stories. We connected after I translated an interview for her, and it's been lovely sharing that interest. I appreciate getting to hear another person's take on a story I care about. Her writing is always a nice reminder of how much there is to notice in those characters."
  },
  {
    username: 'kuusand',
    description:
      "One of the first people to support my art. Her encouragement has meant a lot to me, and making a drawing for her is a memory I look back on fondly. I still appreciate that she was there when I was sharing those early drawings. It's nice having people around who have seen a little of that journey."
  },
  {
    username: 'maomao_2605',
    description:
      "I enjoy her enthusiasm for manga and anime, especially Fruits Basket and Haikyuu. Her love for those stories is infectious, and it's fun seeing what she shares. I always like seeing what catches her attention in a story. That kind of enthusiasm makes me want to revisit the things I love about manga and anime too."
  }
];

const admiredSupporters: Friend[] = [
  {
    username: 'Meownie3',
    description: "Meownie helped bring me to Kemutai Hanashi and Skip and Loafer. Her updates kept drawing me further into both stories, and I always enjoyed keeping up with what she shared. Along with lilatheduck's translated Skip and Loafer analyses, her posts were a big part of how I found my way into these stories."
  },
  {
    username: 'CiciCustomz',
    description: "A supporter whose encouragement I really appreciate. I'm glad my drawings brought us into the same little corner of the internet, and I admire the kindness they've shown toward what I make."
  },
  {
    username: 'TbhkWOOO',
    description: "Someone whose support has been lovely to receive. I appreciate them taking an interest in my work, and I'm happy to have that encouragement around as I keep drawing."
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
  },
  { id: 'admired', title: 'Admired supporters', description: 'People whose support and shared interests have stayed with me.', friends: admiredSupporters }
];
