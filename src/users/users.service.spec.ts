import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import * as bcrypt from 'bcrypt';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      const user = { email: 'test@example.com', password: 'password' };
      const hashedPassword = 'hashedPassword';

      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue(hashedPassword as unknown as never);
      jest
        .spyOn(repository, 'create')
        .mockReturnValue({ ...user, password: hashedPassword } as User);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue({ ...user, password: hashedPassword } as User);

      expect(await service.createUser(user.email, user.password)).toEqual({
        email: user.email,
        password: hashedPassword,
      });
    });

    it('should throw a BadRequestException on error', async () => {
      jest.spyOn(bcrypt, 'hash').mockRejectedValue(new Error('Error') as never);

      await expect(
        service.createUser('test@example.com', 'password'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const user = { email: 'test@example.com', password: 'hashedPassword' };
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(user as User);

      expect(await service.findByEmail('test@example.com')).toEqual(user);
    });

    it('should return undefined if user not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      expect(await service.findByEmail('test@example.com')).toBeUndefined();
    });
  });

  describe('findOneById', () => {
    it('should return a user by id', async () => {
      const user = {
        id: 10,
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(user as User);

      expect(await service.findOneById(1)).toEqual(user);
    });

    it('should return undefined if user not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      expect(await service.findOneById(1)).toBeUndefined();
    });
  });

  describe('updateUser', () => {
    it('should update and return a user', async () => {
      const user = {
        id: 10,
        email: 'test@example.com',
        password: 'newPassword',
      };
      const hashedPassword = 'hashedPassword';

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(user as User);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue(hashedPassword as unknown as never);
      jest.spyOn(repository, 'update').mockResolvedValue({} as any);
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValue({ ...user, password: hashedPassword } as User);

      expect(await service.updateUser(1, { password: 'newPassword' })).toEqual({
        ...user,
        password: hashedPassword,
      });
    });

    it('should throw a NotFoundException if the user is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(
        service.updateUser(10, { password: 'newPassword' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should hash the password if it is being updated', async () => {
      const user = {
        id: 10,
        email: 'test@example.com',
        password: 'oldPassword',
      };
      const hashedPassword = 'hashedPassword';

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(user as User);
      jest
        .spyOn(bcrypt, 'hash')
        .mockResolvedValue(hashedPassword as unknown as never);
      jest.spyOn(repository, 'update').mockResolvedValue({} as any);
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValue({ ...user, password: hashedPassword } as User);

      expect(await service.updateUser(1, { password: 'newPassword' })).toEqual({
        ...user,
        password: hashedPassword,
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      await expect(service.deleteUser(1)).resolves.not.toThrow();
    });

    it('should throw NotFoundException if user not found', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(service.deleteUser(1)).rejects.toThrow(NotFoundException);
    });
  });
});
