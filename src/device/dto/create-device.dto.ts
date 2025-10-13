import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateDeviceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsBoolean()
  isOn?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  priority?: number;

  @IsOptional()
  @IsNumber()
  powerValue?: number;
}