import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DeleteResult, Like, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async findAll(query: FilterUserDto): Promise<{
    data: User[];
    total: number;
    currentPage: number;
    nextPage: number | null;
    prevPage: number | null;
    lastPage: number;
  }> {
    const itemsPerPage = Number(query.itemsPerPage) || 10;
    const page = Number(query.page) || 1;
    const search = query.search ? `%${query.search}%` : '%';
    const skip = (page - 1) * itemsPerPage;

    const [result, total] = await this.userRepository.findAndCount({
      where: [
        { firstName: Like(search) },
        { lastName: Like(search) },
        { email: Like(search) },
      ],
      order: { createdAt: 'DESC' },
      take: itemsPerPage,
      skip,
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });
    const lastPage = Math.ceil(total / itemsPerPage);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;
    return {
      data: result,
      total,
      currentPage: page,
      nextPage,
      prevPage,
      lastPage,
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'firstName',
        'lastName',
        'email',
        'status',
        'createdAt',
        'updatedAt',
      ],
    });
    if (!user) {
      throw new HttpException(
        `User with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return await this.userRepository.save({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const updateResult = await this.userRepository.update(id, updateUserDto);
    if (updateResult.affected === 0) {
      throw new HttpException(
        `User with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    if (!updatedUser) {
      throw new HttpException(
        `Error retrieving updated user with id ${id}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return updatedUser;
  }

  async delete(id: number): Promise<DeleteResult> {
    const deleteResult = await this.userRepository.delete(id);
    if (deleteResult.affected === 0) {
      throw new HttpException(
        `User with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return deleteResult;
  }
}
