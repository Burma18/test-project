import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './article.entity';
import { AuthGuard } from '@nestjs/passport';
import { CreateArticleDto } from './dto/createArticle.dto';
import { UpdateArticleDto } from './dto/updateArticle.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('author') author?: string,
    @Query('publishedDate') publishedDate?: string,
  ): Promise<{
    data: Article[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filters: Partial<Article> = {};
    if (author) {
      filters.author = author;
    }
    if (publishedDate) {
      filters.publishedDate = new Date(publishedDate);
    }
    return this.articlesService.findAll(page, limit, filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Article> {
    return this.articlesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createArticleDto: CreateArticleDto): Promise<Article> {
    return this.articlesService.create(createArticleDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('id') id: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    await this.articlesService.remove(id);
  }
}
