import { Controller, Post, Body, Get, Param, Put, Delete, Headers, UseGuards, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { UserService } from './um.service';
import { LoginUserDto, RegisterUserDto, updatePasswordDTO, UpdateUserDto, UserResponseDto } from 'src/dto/um.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  
  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req){
    return this.userService.validateOAuthLogin(req)
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserDto, description: 'Data for registering a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body('data') registerUserDto: RegisterUserDto) {
    return this.userService.registerUser(registerUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginUserDto, description: 'Data for logging in a user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully and token returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body('data') loginUserDto: LoginUserDto, @Headers('jwt-token') token ?: string) {
    return this.userService.loginUser(loginUserDto, token);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout a user' })
  @ApiBody({ description: 'User ID for logging out' })
  @ApiResponse({ status: 200, description: 'User logged out successfully.' })
  async logout(@Body('data') loginDTO: LoginUserDto){
    return this.userService.logoutUser(loginDTO);
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
  ){
    return this.userService.updateUser(userId, updateUserDto);
  }
  @Put('reset-password/:userId')
  @ApiOperation({ summary: 'Update user password by user ID' })
  @ApiParam({ name: 'userId', description: 'The ID of the user to update' })
  @ApiBody({ type: UpdateUserDto, description: 'Updated user data' })
  @ApiResponse({ status: 200, description: 'User details updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePassword(
    @Param('userId') userId: string,
    @Body('data') data: updatePasswordDTO
  ){
    return this.userService.updatePassword(userId, data);
  }

  @Delete('users/:userId')
  @ApiOperation({ summary: 'Delete a user by user ID' })
  @ApiParam({ name: 'userId', description: 'The ID of the user to delete' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('userId') userId: string){
    return this.userService.deleteUser(userId);
  }
}
