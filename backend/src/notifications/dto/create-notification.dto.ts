import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type?: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  link?: string;
}

