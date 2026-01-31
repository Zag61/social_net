import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsDate,
} from 'class-validator';
import { plainToInstance, Type } from 'class-transformer';
import { validateOrReject } from 'class-validator';

export class UserRowDTO {
  @IsUUID()
  id!: string;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsString()
  password_hash!: string;

  @IsString()
  nickname!: string;

  @IsOptional()
  @IsString()
  about_info?: string | null;

  @IsOptional()
  @IsString()
  phone_number?: string | null;

  @IsOptional()
  @IsString()
  avatar_file_id?: string | null;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsString()
  verification_token?: string | null;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  created_at?: Date;
}
type Class<T extends object> = new (...args: any[]) => T;

export async function validateRow<T extends object>(
  cls: Class<T>,
  row: unknown,
): Promise<T> {
  const instance = plainToInstance(cls, row, {
    enableImplicitConversion: false,
  });

  await validateOrReject(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  return instance;
}
