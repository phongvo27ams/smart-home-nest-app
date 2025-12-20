import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateWatchRuleDto {
  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsNumber()
  threshold?: number;
}
