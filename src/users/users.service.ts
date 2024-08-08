import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUser(email: string, password: string): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = this.usersRepository.create({
        email,
        password: hashedPassword,
      });
      return await this.usersRepository.save(user);
    } catch (error) {
      this.logger.error('Error creating user: ', error);
      throw new BadRequestException('Error creating user');
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await this.usersRepository.findOneBy({ email });
      return user || undefined;
    } catch (error) {
      this.logger.error('Error finding user: ', error);
      throw new BadRequestException('Error finding user by email');
    }
  }

  async findOneById(id: number): Promise<User | undefined> {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      return user || undefined;
    } catch (error) {
      this.logger.error(`Error finding user by id ${id}: `, error);
      throw new BadRequestException('Error finding user by id');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.usersRepository.find();
    } catch (error) {
      this.logger.error('Error retrieving users: ', error);
      throw new BadRequestException('Error retrieving users');
    }
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    try {
      const user = await this.findOneById(id);
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      await this.usersRepository.update(id, updateData);
      return this.findOneById(id);
    } catch (error) {
      this.logger.error('Error updating user: ', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error updating user');
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      const result = await this.usersRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
    } catch (error) {
      this.logger.error('Error deleting user: ', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error deleting user');
    }
  }
}
