import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateArticleDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title cannot be empty' })
  title: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  description: string;

  @IsDateString({}, { message: 'PublishedDate must be a valid date' })
  publishedDate: Date;

  @IsString({ message: 'Author must be a string' })
  @IsNotEmpty({ message: 'Author cannot be empty' })
  author: string;
}
