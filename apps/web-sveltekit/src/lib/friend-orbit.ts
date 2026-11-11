export const connectionGroups: Record<string, { color: string; dash: string; radius: number; meaning: string }> = {
  developed: { color: '#3b82f6', dash: '', radius: 19, meaning: 'Mutuals and close friends' },
  budding: { color: '#14b8a6', dash: '7 4', radius: 24, meaning: 'New conversations and shared interests' },
  growing: { color: '#a78bfa', dash: '2 4', radius: 29, meaning: 'Connections we’re getting to know better' },
  upcoming: { color: '#e9a23b', dash: '9 4 2 4', radius: 34, meaning: 'People I’d like to connect with' },
  admired: { color: '#f472b6', dash: '1 5', radius: 39, meaning: 'Supporters and people I admire' }
};

export function friendOrbit<T extends { username: string; groupId: string }>(friends: T[], grouped = true) {
  return friends.map((friend, overallIndex) => {
    const peers = friends.filter(person => person.groupId === friend.groupId);
    const index = peers.findIndex(person => person.username === friend.username);
    const style = connectionGroups[friend.groupId] || connectionGroups.upcoming;
    const radius = grouped ? (overallIndex % 2 ? 43 : 29) : 39;
    const angle = grouped ? -Math.PI / 2 + overallIndex / Math.max(1, friends.length) * Math.PI * 2 : -Math.PI / 2 + index / Math.max(1, peers.length) * Math.PI * 2;
    return { friend, color: style.color, dash: style.dash, radius, x: 50 + Math.cos(angle) * radius, y: 50 + Math.sin(angle) * radius * .9 };
  });
}
