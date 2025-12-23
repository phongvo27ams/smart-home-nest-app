import { IsString, IsNumber } from 'class-validator';

export class CreateWatchRuleDto {
  @IsString()
  topic: string;

  @IsNumber()
  threshold: number;
}
