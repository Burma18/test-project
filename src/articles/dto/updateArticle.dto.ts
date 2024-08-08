import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateArticleDto {
  @IsString({ message: 'Title must be a string' })
  @IsOptional()
  title?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'PublishedDate must be a valid date' })
  @IsOptional()
  publishedDate?: Date;

  @IsString({ message: 'Author must be a string' })
  @IsOptional()
  author?: string;
}
