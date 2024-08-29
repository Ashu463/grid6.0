import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { UserService } from './um.service';
import { LoginUserDto, RegisterUserDto, UpdateUserDto, UserResponseDto } from 'src/dto/um.dto';

@ApiTags('auth')
@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserDto, description: 'Data for registering a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body('data') registerUserDto: RegisterUserDto) {
    console.log("Request received ", registerUserDto);
    return this.userService.registerUser(registerUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginUserDto, description: 'Data for logging in a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully and token returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body('data') loginUserDto: LoginUserDto): Promise<{ token: string }> {
    const token = await this.userService.loginUser(loginUserDto);
    return { token };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout a user' })
  @ApiBody({ description: 'User ID for logging out' })
  @ApiResponse({ status: 200, description: 'User logged out successfully.' })
  async logout(@Body('userId') userId: string): Promise<void> {
    return this.userService.logoutUser(userId);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user details by user ID' })
  @ApiParam({ name: 'userId', description: 'The ID of the user to retrieve' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('userId') userId: string) {
    return this.userService.getUserById(userId);
  }

  @Put('users/:userId')
  @ApiOperation({ summary: 'Update user details by user ID' })
  @ApiParam({ name: 'userId', description: 'The ID of the user to update' })
  @ApiBody({ type: UpdateUserDto, description: 'Updated user data' })
  @ApiResponse({ status: 200, description: 'User details updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('userId') userId: string,
    @Body('data') updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    console.log(userId, ' is the user ID in controller');
    console.log(updateUserDto, " is the DTO in service");

    return this.userService.updateUser(userId, updateUserDto);
  }

  @Delete('users/:userId')
  @ApiOperation({ summary: 'Delete a user by user ID' })
  @ApiParam({ name: 'userId', description: 'The ID of the user to delete' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('userId') userId: string): Promise<any> {
    return this.userService.deleteUser(userId);
  }
}
