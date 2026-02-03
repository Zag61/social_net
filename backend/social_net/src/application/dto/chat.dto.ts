import { IsString, IsUUID, IsDateString, IsDate } from 'class-validator';
import { ValidateNested, IsOptional, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

class UserDto {
  @IsUUID()
  id: string;

  @IsString()
  username: string;
}

export class MessageDto {
  @IsUUID()
  id: string;

  @IsString()
  text: string;

  @IsUUID()
  senderId: string;

  @IsDateString()
  sentAt: string;
}

export class ChatDto {
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MessageDto)
  lastMessage: MessageDto | null;

  @IsUrl()
  avatarUrl: string;
}
