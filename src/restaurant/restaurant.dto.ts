import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsOptional,
} from 'class-validator';

export class RestaurantDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsUrl()
  website: string;
}
