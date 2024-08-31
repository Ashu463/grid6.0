import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './um.controller';
import { UserService } from './um.service';
import { LoginUserDto, RegisterUserDto, UpdateUserDto, updatePasswordDTO } from 'src/dto/um.dto';
import { BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

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

  // it('should handle Google auth redirect', async () => {
  //   const req = { user: { id: 'userId' } };
  //   jest.spyOn(service, 'validateOAuthLogin').mockResolvedValue(req.user);

  //   const result = await controller.googleAuthRedirect(req);

  //   expect(service.validateOAuthLogin).toHaveBeenCalledWith(req);
  //   expect(result).toEqual(req.user);
  // });

  it('should register a new user', async () => {
    const registerUserDto: RegisterUserDto = { username: 'testuser', email: 'test@example.com', password: 'password123', secretKey: 'test-secret' };
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
      data: { ...registerUserDto, id: 'userId' }, // Matching only essential properties
    });
  });
  

  it('should login a user', async () => {
    const loginUserDto: LoginUserDto = { email: 'test@example.com', password: 'password123', secretKey: 'secret' };
    const token = 'jwt-token';
    jest.spyOn(service, 'loginUser').mockResolvedValue({
        success: true,  // Corrected property name
        message: 'congrats you were verified',
        data: token,
    });

    const result = await controller.login(loginUserDto);

    // expect(service.loginUser).toHaveBeenCalledWith(loginUserDto);
    expect(result).toEqual({
        success: true,  // Corrected property name
        message: 'congrats you were verified',
        data: token,
    });
});

  it('should logout a user', async () => {
    const loginDto: LoginUserDto = { email: 'test@example.com', password: 'password123', secretKey : 'test-key' };
    jest.spyOn(service, 'logoutUser').mockResolvedValue({
      success: true,
      message: 'User logged out successfully',
    });

    const result = await controller.logout(loginDto);

    expect(service.logoutUser).toHaveBeenCalledWith(loginDto);
    expect(result).toEqual({
      success: true,
      message: 'User logged out successfully',
    });
  });

  it('should get user details by user ID', async () => {
    const userId = 'userId';
    const user = { id: userId, username: 'testuser', createdAt : new Date(), updatedAt : new Date(), email : 'test@gmail.com', password : 'password', secretKey : 'test-key' };
    jest.spyOn(service, 'getUserById').mockResolvedValue({
      success: true,
      message: 'User details retrieved successfully',
      data: user,
    });

    const result = await controller.getUser(userId);

    expect(service.getUserById).toHaveBeenCalledWith(userId);
    expect(result).toEqual({
      success: true,
      message: 'User details retrieved successfully',
      data: user,
    });
  });

  it('should handle user not found case for get user', async () => {
    const userId = 'nonExistentUserId';
    jest.spyOn(service, 'getUserById').mockRejectedValue(new NotFoundException('User not found'));

    await expect(controller.getUser(userId)).rejects.toThrow(NotFoundException);
  });

  it('should update user details by user ID', async () => {
    const userId = 'userId';
    const updateUserDto: UpdateUserDto = { username: 'updateduser' };
    const updatedUser = { id: userId, username: 'testuser', createdAt : new Date(), updatedAt : new Date(), email : 'test@gmail.com', password : 'password', secretKey : 'test-key' };
    jest.spyOn(service, 'updateUser').mockResolvedValue({
      success: true,
      message: 'User details updated successfully',
      data: updatedUser,
    });

    const result = await controller.updateUser(userId, updateUserDto);

    expect(service.updateUser).toHaveBeenCalledWith(userId, updateUserDto);
    expect(result).toEqual({
      success: true,
      message: 'User details updated successfully',
      data: updatedUser,
    });
  });

  it('should handle update user failure', async () => {
    const userId = 'userId';
    const updateUserDto: UpdateUserDto = { username: 'updateduser' };
    jest.spyOn(service, 'updateUser').mockRejectedValue(new InternalServerErrorException('Internal server error occurred'));

    await expect(controller.updateUser(userId, updateUserDto)).rejects.toThrow(InternalServerErrorException);
  });

  it('should update user password by user ID', async () => {
    const userId = 'userId';
    const updatePasswordDto: updatePasswordDTO = { oldPassword: 'oldpass', newPassword: 'newpass', email: 'test@example.com', username : 'test-user' };
    const res = {id : userId, createdAt: new Date(), updatedAt: new Date(), email : 'test@gmail.com', username : 'testuser', password : 'test-passwrod',secretKey : 'hellosceret'}
    jest.spyOn(service, 'updatePassword').mockResolvedValue({
      success: true,
      message: 'User password updated successfully',
      data : res
    });
    // data: { id: string; createdAt: Date; updatedAt: Date; email: string; username: string; password: string; secretKey: string; }; 

    const result = await controller.updatePassword(userId, updatePasswordDto);

    expect(service.updatePassword).toHaveBeenCalledWith(userId, updatePasswordDto);
    expect(result).toEqual({
      success: true,
      message: 'User password updated successfully',
      data : res
    });
  });

  it('should delete a user by user ID', async () => {
    const userId = 'userId';
    jest.spyOn(service, 'deleteUser').mockResolvedValue({
      success: true,
      message: 'User deleted successfully',
    });

    const result = await controller.deleteUser(userId);

    expect(service.deleteUser).toHaveBeenCalledWith(userId);
    expect(result).toEqual({
      success: true,
      message: 'User deleted successfully',
    });
  });
});
