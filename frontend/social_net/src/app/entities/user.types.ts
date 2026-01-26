export interface UserDto {
id: string;
username: string;
displayName?: string;
avatarUrl?: string | null;
bio?: string | null;
createdAt?: string;
}
export interface Friend {
  id: string;
  email: string;         // empty string in your response
  passwordHash: string;  // empty string in your response
  nickname: string;
  avatarFileId?: string;
  verified: boolean;
  avatarUrl?: string;
  online?: boolean; 
}