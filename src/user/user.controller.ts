import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiBearerAuth()
@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @ApiQuery({ name: 'page', nullable: true })
  @ApiQuery({ name: 'itemsPerPage', nullable: true })
  @ApiQuery({ name: 'search', nullable: true })
  @Get()
  findAll(@Query() query: FilterUserDto): Promise<{ data: User[] }> {
    return this.userService.findAll(query);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<{ data: User }> {
    const data = await this.userService.findOne(Number(id));
    return {
      data,
    };
  }

  @UseGuards(AuthGuard)
  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ data: Omit<User, 'password'> }> {
    const user = await this.userService.create(createUserDto);
    const { password, ...data } = user;
    return { data };
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{
    message: string;
    data: Omit<User, 'password' | 'refreshToken'>;
  }> {
    const user = await this.userService.update(Number(id), updateUserDto);
    const { password, refreshToken, ...data } = user;
    return { message: 'User updated successfully', data };
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    const result = await this.userService.delete(Number(id));
    if (result.affected === 0) {
      return { message: `User with id ${id} not found` };
    }
    return { message: 'User deleted successfully' };
  }
}
