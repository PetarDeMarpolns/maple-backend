import { IsString, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { RewardDto } from './reward.dto';
import { ValidateNested } from 'class-validator';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  condition: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @ValidateNested()
  @Type(() => RewardDto)
  reward: RewardDto
}