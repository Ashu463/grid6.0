import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { UserService } from './um.service';
import { LoginUserDto, RegisterUserDto, updatePasswordDTO, UpdateUserDto, UserResponseDto } from 'src/dto/um.dto';
import { AuthGuard } from '@nestjs/passport';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('User Management')
@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req): Promise<UniversalResponseDTO>{
    return this.userService.validateOAuthLogin(req)
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserDto, description: 'Data for registering a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body('data') registerUserDto: RegisterUserDto): Promise<UniversalResponseDTO> {
    return this.userService.registerUser(registerUserDto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginUserDto, description: 'Data for logging in a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully and token returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body('data') loginUserDto: LoginUserDto): Promise<UniversalResponseDTO> {
    return this.userService.loginUser(loginUserDto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout the current user' })
  @ApiResponse({ status: 200, description: 'User logged out successfully.' })
  async logout(@CurrentUser('sub') userId: string): Promise<UniversalResponseDTO>{
    return this.userService.logoutUser(userId);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user details by user ID' })
  @ApiParam({ name: 'userId', description: 'The ID of the user to retrieve' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(
    @Param('userId') userId: string,
    @CurrentUser('sub') requestingUserId: string,
  ): Promise<UniversalResponseDTO> {
    return this.userService.getUserById(userId, requestingUserId);
  }

  @Put('users/:userId')
  @ApiOperation({ summary: 'Update user details by user ID' })
  @ApiParam({ name: 'userId', description: 'The ID of the user to update' })
  @ApiBody({ type: UpdateUserDto, description: 'Updated user data' })
  @ApiResponse({ status: 200, description: 'User details updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('userId') userId: string,
    @Body('data') updateUserDto: UpdateUserDto,
    @CurrentUser('sub') requestingUserId: string,
  ): Promise<UniversalResponseDTO>{
    return this.userService.updateUser(userId, updateUserDto, requestingUserId);
  }
  @Put('reset-password/:userId')
  @ApiOperation({ summary: 'Update user password by user ID' })
  @ApiParam({ name: 'userId', description: 'The ID of the user to update' })
  @ApiBody({ type: UpdateUserDto, description: 'Updated user data' })
  @ApiResponse({ status: 200, description: 'User details updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePassword(
    @Param('userId') userId: string,
    @Body('data') data: updatePasswordDTO,
    @CurrentUser('sub') requestingUserId: string,
  ): Promise<UniversalResponseDTO>{
    return this.userService.updatePassword(userId, data, requestingUserId);
  }

  @Delete('users/:userId')
  @ApiOperation({ summary: 'Delete a user by user ID' })
  @ApiParam({ name: 'userId', description: 'The ID of the user to delete' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(
    @Param('userId') userId: string,
    @CurrentUser('sub') requestingUserId: string,
  ): Promise<UniversalResponseDTO>{
    return this.userService.deleteUser(userId, requestingUserId);
  }
}
