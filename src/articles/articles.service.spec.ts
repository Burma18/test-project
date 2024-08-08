import { Test, TestingModule } from '@nestjs/testing';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { ArticlesService } from './articles.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisModule } from '../utils/redis.module';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let repository: Repository<Article>;
  let redis: Redis;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule],
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: {
            findAndCount: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: 'REDIS_CLIENT',
          useValue: {
            del: jest.fn().mockResolvedValue(1),
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    repository = module.get<Repository<Article>>(getRepositoryToken(Article));
    redis = module.get<Redis>('REDIS_CLIENT');
  });

  describe('findAll', () => {
    it('should return a paginated list of articles', async () => {
      const result: Article[] = [
        {
          id: 6,
          title: 'Test Article',
          description: 'Test Description',
          publishedDate: new Date(),
          author: 'Test Author',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([result, 1]);

      await expect(service.findAll(1, 10, {})).resolves.toEqual({
        data: result,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should throw a BadRequestException on error', async () => {
      jest
        .spyOn(repository, 'findAndCount')
        .mockRejectedValue(new Error('Error'));

      await expect(service.findAll(1, 10, {})).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return an article by id', async () => {
      const result: Article = {
        id: 6,
        title: 'Test Article',
        description: 'Test Description',
        publishedDate: new Date(),
        author: 'Test Author',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(result);

      await expect(service.findOne(6)).resolves.toEqual(result);
    });

    it('should throw a NotFoundException if the article is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne(6)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return an article', async () => {
      const article: Partial<Article> = {
        title: 'Test Article',
        description: 'Test Description',
        publishedDate: new Date(),
        author: 'Test Author',
      };
      const savedArticle: Article = {
        id: 6,
        title: 'Test Article',
        description: 'Test Description',
        publishedDate: new Date(),
        author: 'Test Author',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(repository, 'create').mockReturnValue(article as any);
      jest.spyOn(repository, 'save').mockResolvedValue(savedArticle);
      jest.spyOn(redis, 'del').mockResolvedValue(1);

      await expect(
        service.create(article as Partial<Article>),
      ).resolves.toEqual(savedArticle);
    });

    it('should throw a BadRequestException on error', async () => {
      jest.spyOn(repository, 'create').mockReturnValue({} as any);
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Error'));

      await expect(service.create({} as Partial<Article>)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should throw a NotFoundException if the article is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.update(10, {} as Partial<Article>)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a BadRequestException on error', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue({ id: 6 } as any);
      jest.spyOn(repository, 'update').mockRejectedValue(new Error('Error'));

      await expect(service.update(10, {} as Partial<Article>)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should throw a NotFoundException if the article is not found', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue({
        affected: 0,
        raw: {},
      } as DeleteResult);

      await expect(service.remove(10)).rejects.toThrow(NotFoundException);
    });

    it('should throw a BadRequestException on error', async () => {
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Error'));

      await expect(service.remove(6)).rejects.toThrow(BadRequestException);
    });
  });
});
