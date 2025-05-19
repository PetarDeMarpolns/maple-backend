import { IsString } from 'class-validator';

export class CreateRewardDto {
  @IsString()
  item: string;

  @IsString()
  quantity: string;
}