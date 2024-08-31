import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './um.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException, InternalServerErrorException, BadGatewayException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/dto/um.dto';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should validate OAuth login', async () => {
    const profile = { user: { id: 'userId' } };
    const result = await service.validateOAuthLogin(profile);
    expect(result).toEqual({
      success : true,
      message: 'user info from google',
      data : profile.user
    });
  });

  it('should register a new user', async () => {
    const registerUserDto = { username: 'testuser', email: 'test@example.com', password: 'password123', secretKey : 'test-key' ,  createdAt: new Date(), updatedAt: new Date() };
    const hashedPassword = 'hashedPassword';
    const user = { id: 'userId', ...registerUserDto, password: hashedPassword};
    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
    jest.spyOn(prismaService.user, 'create').mockResolvedValue(user);
// '{ id: string; createdAt: Date; updatedAt: Date; email: string; username: string; password: string; secretKey: string; } 
    const result = await service.registerUser(registerUserDto);

    expect(result).toEqual({
      success: true,
      message: 'user registered successfully',
      data: user
    });
  });

  it('should throw BadRequestException if no registration data provided', async () => {
    await expect(service.registerUser(null)).rejects.toThrow(BadRequestException);
  });

  it('should login a user and generate a JWT token', async () => {
    const loginUserDto: LoginUserDto = { email: 'test@example.com', password: 'password123', secretKey: 'test-key' };
    const user = {username : 'testUser', id: 'userId', email: 'test@example.com', password: 'hashedPassword', createdAt: new Date(), updatedAt: new Date(), ...loginUserDto };
    const token = 'jwt-token';
//   '{ id: string; createdAt: Date; updatedAt: Date; email: string; username: string; password: string; secretKey: string; }'
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
  
    // Mock the JWT token generation
    jest.spyOn(service as any, 'generateJWT').mockReturnValue(token); // Use 'as any' to bypass type checking
  
    const result = await service.loginUser(loginUserDto);
  
    expect(result).toEqual({
      success: true,
      message: 'congrats you were verified',
      data: token
    });
    expect(service['generateJWT']).toHaveBeenCalledWith({ email: loginUserDto.email }, loginUserDto.secretKey);
  });
  

  it('should throw BadRequestException if login credentials are invalid', async () => {
    const loginUserDto = { username: 'testuser', email: 'test@example.com', password: 'password123', secretKey : 'test-key' ,  createdAt: new Date(), updatedAt: new Date() };
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    await expect(service.loginUser(loginUserDto)).rejects.toThrow(BadRequestException);
  });

  it('should update user details', async () => {
    const userId = 'userId';
    const updateUserDto = { username: 'testuser', email: 'test@example.com', password: 'password123', secretKey : 'test-key' ,  createdAt: new Date(), updatedAt: new Date() };
    const updatedUser = { id: userId, ...updateUserDto };
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(updatedUser);
    jest.spyOn(prismaService.user, 'update').mockResolvedValue(updatedUser);

    const result = await service.updateUser(userId, updateUserDto);

    expect(result).toEqual({
      success: true,
      message: 'user updated successfully',
      data: updatedUser
    });
  });

  it('should throw BadGatewayException if update fails', async () => {
    const userId = 'userId';
    const updateUserDto = { username: 'updateduser' };
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

    await expect(service.updateUser(userId, updateUserDto)).rejects.toThrow(BadGatewayException);
  });

  it('should update user password', async () => {
    const userId = 'userId';
    // { username: 'testuser', secretKey : 'test-key' ,  createdAt: new Date(), updatedAt: new Date() };
    const updatePasswordDto = { oldPassword: 'oldpass', newPassword: 'newpass', email: 'test@example.com', username : 'test-user' };
    const user = { id: userId, email: updatePasswordDto.email, password: 'hashedOldPassword', username: 'testuser', secretKey : 'test-key' ,  createdAt: new Date(), updatedAt: new Date() };
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
    jest.spyOn(prismaService.user, 'update').mockResolvedValue({ ...user, password: updatePasswordDto.newPassword });

    const result = await service.updatePassword(userId, updatePasswordDto);

    expect(result).toEqual({
      success: true,
      message: 'user updated successfully',
      data: { ...user, password: updatePasswordDto.newPassword }
    });
  });

  it('should delete a user', async () => {
    const userId = 'userId';
    const deletedUser = {id : userId, username: 'testuser', email: 'test@example.com', password: 'password123', secretKey : 'test-key' ,  createdAt: new Date(), updatedAt: new Date() };
    
    jest.spyOn(prismaService.user, 'delete').mockResolvedValue(deletedUser);

    const result = await service.deleteUser(userId);

    expect(result).toEqual({
      success: true,
      message: 'user deleted successfully'
    });
  });
});
