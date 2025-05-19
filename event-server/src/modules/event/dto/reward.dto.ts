import { IsString } from 'class-validator';

export class RewardDto {
  @IsString()
  item: string;

  @IsString()
  quantity: string;
}