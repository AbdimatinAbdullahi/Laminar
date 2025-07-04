const messages = [
  {
    id: "64f7b2e3c4f5e7b2d37d2fa1",
    sender_id: "e18c3aeb-8b1c-4d57-9c18-27b7b972a921",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: { text: "Welcome to the alpha-dev channel!", attachments: [] },
    timestamp: "2025-07-02T12:00:00Z",
    edited: false,
    reactions: [],
    thread_parent_id: null
  },
  {
    id: "64f7b2f3a1bce3d9c09e1aa7",
    sender_id: "3c1b6a9b-40e5-44fd-900b-8f073ed3b917",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: { text: "Thanks! Excited to get started 🚀", attachments: [] },
    timestamp: "2025-07-02T12:02:00Z",
    edited: false,
    reactions: [{ user_id: "e18c3aeb-8b1c-4d57-9c18-27b7b972a921", reaction: "👍" }],
    thread_parent_id: null
  },
  {
    id: "64f7b304a1bce3d9c09e1aa8",
    sender_id: "7f2419b2-2f22-4b13-bf57-674abf734af2",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: { text: "Just deployed the backend update.", attachments: [] },
    timestamp: "2025-07-02T12:04:00Z",
    edited: false,
    reactions: [],
    thread_parent_id: null
  },
  {
    id: "64f7b305a1bce3d9c09e1aa9",
    sender_id: "e18c3aeb-8b1c-4d57-9c18-27b7b972a921",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: {
      text: "Awesome! Here's the deploy log.",
      attachments: [
        { type: "file", url: "https://example.com/deploy-log.txt", name: "deploy-log.txt" }
      ]
    },
    timestamp: "2025-07-02T12:06:00Z",
    edited: true,
    reactions: [],
    thread_parent_id: null
  },
  {
    id: "64f7b306a1bce3d9c09e1aaa",
    sender_id: "3c1b6a9b-40e5-44fd-900b-8f073ed3b917",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: { text: "Can we schedule a sync later today?", attachments: [] },
    timestamp: "2025-07-02T12:08:00Z",
    edited: false,
    reactions: [
      { user_id: "7f2419b2-2f22-4b13-bf57-674abf734af2", reaction: "⏰" }
    ],
    thread_parent_id: null
  },
  {
    id: "64f7b307a1bce3d9c09e1aab",
    sender_id: "e18c3aeb-8b1c-4d57-9c18-27b7b972a921",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: { text: "3 PM works for me!", attachments: [] },
    timestamp: "2025-07-02T12:10:00Z",
    edited: false,
    reactions: [],
    thread_parent_id: {
      $oid: "64f7b306a1bce3d9c09e1aaa"
    }
  },
  {
    id: "64f7b308a1bce3d9c09e1aac",
    sender_id: "4261498a-7b23-4bf1-bf16-46d4f3deb513",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: { text: "Same here 👍", attachments: [] },
    timestamp: "2025-07-02T12:12:00Z",
    edited: false,
    reactions: [],
    thread_parent_id: {
      $oid: "64f7b306a1bce3d9c09e1aaa"
    }
  },
  {
    id: "64f7b309a1bce3d9c09e1aad",
    sender_id: "7f2419b2-2f22-4b13-bf57-674abf734af2",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: { text: "Reminder: team meeting tomorrow at 10 AM.", attachments: [] },
    timestamp: "2025-07-02T12:14:00Z",
    edited: false,
    reactions: [
      { user_id: "3c1b6a9b-40e5-44fd-900b-8f073ed3b917", reaction: "❗" }
    ],
    thread_parent_id: null
  },
  {
    id: "64f7b30aa1bce3d9c09e1aae",
    sender_id: "3c1b6a9b-40e5-44fd-900b-8f073ed3b917",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: { text: "Noted, thanks!", attachments: [] },
    timestamp: "2025-07-02T12:16:00Z",
    edited: false,
    reactions: [],
    thread_parent_id: null
  },
  {
    id: "64f7b30ba1bce3d9c09e1aaf",
    sender_id: "e18c3aeb-8b1c-4d57-9c18-27b7b972a921",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: {
      text: "New designs uploaded.",
      attachments: [
        {
          type: "image",
          url: "https://example.com/designs/mockup.png",
          name: "mockup.png"
        }
      ]
    },
    timestamp: "2025-07-02T12:18:00Z",
    edited: false,
    reactions: [],
    thread_parent_id: null
  },
  {
    id: "64f7b30ca1bce3d9c09e1ab0",
    sender_id: "4261498a-7b23-4bf1-bf16-46d4f3deb513",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: { text: "Love the direction! Clean and sharp.", attachments: [] },
    timestamp: "2025-07-02T12:20:00Z",
    edited: false,
    reactions: [
      { user_id: "e18c3aeb-8b1c-4d57-9c18-27b7b972a921", reaction: "❤️" }
    ],
    thread_parent_id: null
  },

  // Message #12 to #20 (you can continue in similar style)
  {
    id: "64f7b30da1bce3d9c09e1ab1",
    sender_id: "3c1b6a9b-40e5-44fd-900b-8f073ed3b917",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: { text: "Any blockers on today's sprint tasks?", attachments: [] },
    timestamp: "2025-07-02T12:22:00Z",
    edited: false,
    reactions: [],
    thread_parent_id: null
  },
  {
    id: "64f7b30ea1bce3d9c09e1ab2",
    sender_id: "7f2419b2-2f22-4b13-bf57-674abf734af2",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: { text: "No blockers from me.", attachments: [] },
    timestamp: "2025-07-02T12:24:00Z",
    edited: false,
    reactions: [],
    thread_parent_id: null
  },
  {
    id: "64f7b30fa1bce3d9c09e1ab3",
    sender_id: "4261498a-7b23-4bf1-bf16-46d4f3deb513",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: { text: "Will need help testing the notification module.", attachments: [] },
    timestamp: "2025-07-02T12:26:00Z",
    edited: false,
    reactions: [],
    thread_parent_id: null
  },
  {
    id: "64f7b310a1bce3d9c09e1ab4",
    sender_id: "e18c3aeb-8b1c-4d57-9c18-27b7b972a921",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: { text: "I can help with that after lunch.", attachments: [] },
    timestamp: "2025-07-02T12:28:00Z",
    edited: false,
    reactions: [],
    thread_parent_id: {
      $oid: "64f7b30fa1bce3d9c09e1ab3"
    }
  },
  {
    id: "64f7b311a1bce3d9c09e1ab5",
    sender_id: "3c1b6a9b-40e5-44fd-900b-8f073ed3b917",
    receiver_type: "channel",
    receiver_id: "caa11113-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    content: { text: "Pushed latest changes to the repo.", attachments: [] },
    timestamp: "2025-07-02T12:30:00Z",
    edited: true,
    reactions: [],
    thread_parent_id: null
  }
];

export default messages;
