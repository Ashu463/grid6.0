import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './um.controller';
import { UserService } from './um.service';
import { LoginUserDto, RegisterUserDto, UpdateUserDto, updatePasswordDTO } from 'src/dto/um.dto';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const requestingUserId = 'userId';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            validateOAuthLogin: jest.fn(),
            registerUser: jest.fn(),
            loginUser: jest.fn(),
            logoutUser: jest.fn(),
            getUserById: jest.fn(),
            updateUser: jest.fn(),
            updatePassword: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should register a new user', async () => {
    const registerUserDto: RegisterUserDto = { username: 'testuser', email: 'test@example.com', password: 'password123' };
    const userResponse = { ...registerUserDto, id: 'userId', createdAt: new Date(), updatedAt: new Date() };

    jest.spyOn(service, 'registerUser').mockResolvedValue({
      success: true,
      message: 'User registered successfully',
      data: userResponse,
    });

    const result = await controller.register(registerUserDto);

    expect(service.registerUser).toHaveBeenCalledWith(registerUserDto);
    expect(result).toMatchObject({
      success: true,
      message: 'User registered successfully',
      data: { ...registerUserDto, id: 'userId' },
    });
  });

  it('should login a user', async () => {
    const loginUserDto: LoginUserDto = { email: 'test@example.com', password: 'password123' };
    const token = 'jwt-token';
    jest.spyOn(service, 'loginUser').mockResolvedValue({
      success: true,
      message: 'Login successful',
      data: { token },
    });

    const result = await controller.login(loginUserDto);

    expect(service.loginUser).toHaveBeenCalledWith(loginUserDto);
    expect(result).toEqual({
      success: true,
      message: 'Login successful',
      data: { token },
    });
  });

  it('should logout the authenticated user', async () => {
    jest.spyOn(service, 'logoutUser').mockResolvedValue({
      success: true,
      message: 'Logged out successfully',
    });

    const result = await controller.logout(requestingUserId);

    expect(service.logoutUser).toHaveBeenCalledWith(requestingUserId);
    expect(result).toEqual({
      success: true,
      message: 'Logged out successfully',
    });
  });

  it('should get user details by user ID', async () => {
    const userId = requestingUserId;
    const user = { id: userId, username: 'testuser', createdAt: new Date(), updatedAt: new Date(), email: 'test@gmail.com' };
    jest.spyOn(service, 'getUserById').mockResolvedValue({
      success: true,
      message: 'User found successfully',
      data: user,
    });

    const result = await controller.getUser(userId, requestingUserId);

    expect(service.getUserById).toHaveBeenCalledWith(userId, requestingUserId);
    expect(result).toEqual({
      success: true,
      message: 'User found successfully',
      data: user,
    });
  });

  it('should propagate NotFoundException from getUserById', async () => {
    const userId = 'nonExistentUserId';
    jest.spyOn(service, 'getUserById').mockRejectedValue(new NotFoundException('User not found'));

    await expect(controller.getUser(userId, requestingUserId)).rejects.toThrow(NotFoundException);
  });

  it('should update user details by user ID', async () => {
    const userId = requestingUserId;
    const updateUserDto: UpdateUserDto = { username: 'updateduser' };
    const updatedUser = { id: userId, username: 'updateduser', createdAt: new Date(), updatedAt: new Date(), email: 'test@gmail.com' };
    jest.spyOn(service, 'updateUser').mockResolvedValue({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });

    const result = await controller.updateUser(userId, updateUserDto, requestingUserId);

    expect(service.updateUser).toHaveBeenCalledWith(userId, updateUserDto, requestingUserId);
    expect(result).toEqual({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  });

  it('should propagate InternalServerErrorException from updateUser', async () => {
    const userId = requestingUserId;
    const updateUserDto: UpdateUserDto = { username: 'updateduser' };
    jest.spyOn(service, 'updateUser').mockRejectedValue(new InternalServerErrorException('Internal server error occurred'));

    await expect(controller.updateUser(userId, updateUserDto, requestingUserId)).rejects.toThrow(InternalServerErrorException);
  });

  it('should update user password by user ID', async () => {
    const userId = requestingUserId;
    const updatePasswordDto: updatePasswordDTO = { oldPassword: 'oldpass', newPassword: 'newpass', email: 'test@example.com', username: 'test-user' };
    const res = { id: userId, createdAt: new Date(), updatedAt: new Date(), email: 'test@gmail.com', username: 'testuser' };
    jest.spyOn(service, 'updatePassword').mockResolvedValue({
      success: true,
      message: 'Password updated successfully',
      data: res,
    });

    const result = await controller.updatePassword(userId, updatePasswordDto, requestingUserId);

    expect(service.updatePassword).toHaveBeenCalledWith(userId, updatePasswordDto, requestingUserId);
    expect(result).toEqual({
      success: true,
      message: 'Password updated successfully',
      data: res,
    });
  });

  it('should delete a user by user ID', async () => {
    const userId = requestingUserId;
    jest.spyOn(service, 'deleteUser').mockResolvedValue({
      success: true,
      message: 'User deleted successfully',
    });

    const result = await controller.deleteUser(userId, requestingUserId);

    expect(service.deleteUser).toHaveBeenCalledWith(userId, requestingUserId);
    expect(result).toEqual({
      success: true,
      message: 'User deleted successfully',
    });
  });
});
