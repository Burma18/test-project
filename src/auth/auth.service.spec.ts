import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        id: 10,
        email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>) //@ts-ignore
        .mockResolvedValue(true);

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user);

      const result = await authService.validateUser(email, password);

      expect(result).toEqual({
        id: 10,
        email,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      (bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>) //@ts-ignore
        .mockResolvedValue(false);

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
        id: 10,
        email,
        password: await bcrypt.hash('password', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(authService.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should return a JWT token', async () => {
      const user = { id: 10, email: 'test@example.com' };
      const accessToken = 'jwt_token';

      jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      const result = await authService.login(user);

      expect(result).toEqual({ access_token: accessToken });
    });

    it('should throw BadRequestException on error', async () => {
      const user = { id: 10, email: 'test@example.com' };

      jest.spyOn(jwtService, 'sign').mockImplementation(() => {
        throw new Error('Error');
      });

      await expect(authService.login(user)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
