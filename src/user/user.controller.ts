import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll(): Promise<{ data: User[] }> {
    const data = await this.userService.findAll();
    return {
      data,
    };
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<{ data: User }> {
    const data = await this.userService.findOne(Number(id));
    return {
      data,
    };
  }
}
