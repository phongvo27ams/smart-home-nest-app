import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSensorDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsNumber()
  deviceId: number;
}