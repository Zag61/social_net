export interface UserDto {
  id: string;
  username: string;
}


export interface MessageDto {
  id: string;
  text: string;
  senderId: string;
  sentAt: string;
}

export interface ChatDto {
  user: UserDto;
  lastMessage: MessageDto | null;
  avatarUrl: string;
}
