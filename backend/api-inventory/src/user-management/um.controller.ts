import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { UserService } from './um.service';
import { LoginUserDto, RegisterUserDto, UpdateUserDto, UserResponseDto } from 'src/dto/um.dto';


@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body('data') registerUserDto: RegisterUserDto)  {
    console.log("Reguest gyi ", registerUserDto)
    return this.userService.registerUser(registerUserDto);
  }

  @Post('login')
  async login(@Body('data') loginUserDto: LoginUserDto): Promise<{ token: string }> {
    const token = await this.userService.loginUser(loginUserDto);
    return { token };
  }

  @Post('logout')
  async logout(@Body('userId') userId: string): Promise<void> {
    return this.userService.logoutUser(userId);
  }
  @Get('users/:userId')
  async getUser(@Param('userId') userId: string) {
    return this.userService.getUserById(userId);
  }
  
  @Put('users/:userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body('data') updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    console.log(userId, ' is the user id in controller')
    console.log(updateUserDto, " is the dto in service")

    return this.userService.updateUser(userId, updateUserDto);
  }

  @Delete('users/:userId')
  async deleteUser(@Param('userId') userId: string): Promise<any> {
    return this.userService.deleteUser(userId);
  }
}
