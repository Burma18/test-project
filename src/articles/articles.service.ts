import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Article } from './article.entity';
import { Redis } from 'ioredis';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async findAll(page: number, limit: number, filters: Partial<Article>) {
    try {
      const cacheKey = `articles:${page}:${limit}:${JSON.stringify(filters)}`;
      const cachedData = await this.redis.get(cacheKey);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const where: FindOptionsWhere<Article> = {};

      if (filters.author) {
        where.author = filters.author;
      }

      if (filters.publishedDate) {
        where.publishedDate = filters.publishedDate;
      }

      const [articles, total] = await this.articlesRepository.findAndCount({
        where,
        skip: (page - 1) * limit,
        take: limit,
      });

      const result = {
        data: articles,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };

      await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 3600); // Cache for 1 hour

      return result;
    } catch (error) {
      this.logger.error('Error retrieving articles:', error);
      throw new BadRequestException('Error retrieving articles');
    }
  }

  async findOne(id: number) {
    try {
      const cacheKey = `article:${id}`;
      const cachedData = await this.redis.get(cacheKey);

      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const article = await this.articlesRepository.findOneBy({ id });
      if (!article) {
        throw new NotFoundException(`Article with id ${id} not found`);
      }

      await this.redis.set(cacheKey, JSON.stringify(article), 'EX', 3600); // Cache for 1 hour

      return article;
    } catch (error) {
      this.logger.error(`Article with id ${id} not found:`, error);
      throw new NotFoundException(`Article with id ${id} not found`);
    }
  }

  async create(article: Partial<Article>) {
    try {
      const newArticle = this.articlesRepository.create(article);
      const savedArticle = await this.articlesRepository.save(newArticle);
      await this.redis.del('articles:*');
      return savedArticle;
    } catch (error) {
      this.logger.error('Error creating article:', error);
      throw new BadRequestException('Error creating article');
    }
  }

  async update(id: number, article: Partial<Article>) {
    try {
      const existingArticle = await this.articlesRepository.findOneBy({ id });
      if (!existingArticle) {
        throw new NotFoundException(`Article with id ${id} not found`);
      }

      await this.articlesRepository.update({ id }, article);
      await this.redis.del(`article:${id}`);
      await this.redis.del('articles:*');
      return this.articlesRepository.findOneBy({ id });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating article:', error);
      throw new BadRequestException('Error updating article');
    }
  }

  async remove(id: number) {
    try {
      const result = await this.articlesRepository.delete({ id });
      if (result.affected === 0) {
        throw new NotFoundException(`Article with id ${id} not found`);
      }
      await this.redis.del(`article:${id}`);
      await this.redis.del('articles:*');
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting article:', error);
      throw new BadRequestException('Error deleting article');
    }
  }
}
