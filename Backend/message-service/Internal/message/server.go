package message

type ChatServer struct {
	Channels map[string]*ChannelRoom // channelID => room
}

func NewChatServer() *ChatServer {
	return &ChatServer{
		Channels: make(map[string]*ChannelRoom),
	}
}

func (s *ChatServer) JoinChannel(channelID string, user *UserConnection) {
	// If the user is currently in another channel Leave that channel
	if user.CurrentChannel != "" {
		s.RemoveUserFromChannel(user)
	}

	room, exists := s.Channels[channelID]
	if !exists {
		room = &ChannelRoom{
			ChannelID:              channelID,
			Members:                map[*UserConnection]bool{},
			Join:                   make(chan *UserConnection),
			Leave:                  make(chan *UserConnection),
			BroadcastMessage:       make(chan interface{}),
			BroadcastMessageEdit:   make(chan interface{}),
			BroadcastReaction:      make(chan interface{}),
			BroadCastDeleteMessage: make(chan interface{}),
			TypingEvent:            make(chan TypingStatus),
		}
		s.Channels[channelID] = room // Adding new room to the server
		go room.Run()
	}

	user.CurrentChannel = channelID // update the channel the user is active in
	room.Join <- user               // Make the user to join the room
}

func (s *ChatServer) RemoveUserFromChannel(user *UserConnection) {
	room := s.Channels[user.CurrentChannel]
	if room != nil {
		room.Leave <- user
	}
}

func (s *ChatServer) GetChannelRoom(channelID string) *ChannelRoom {
	room, exists := s.Channels[channelID]
	if !exists {
		return nil
	}
	return room
}
