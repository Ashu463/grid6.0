import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './um.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException, UnauthorizedException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto, RegisterUserDto, UpdateUserDto, updatePasswordDTO } from 'src/dto/um.dto';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const requestingUserId = 'userId';

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

  it('should validate OAuth login and strip sensitive fields', async () => {
    const profile = { user: { id: 'userId', username: 'a', email: 'a@test.com', createdAt: new Date(), updatedAt: new Date(), password: 'hash' } };
    const result = await service.validateOAuthLogin(profile);
    expect(result).toEqual({
      success: true,
      message: 'OAuth profile received',
      data: {
        id: profile.user.id,
        username: profile.user.username,
        email: profile.user.email,
        createdAt: profile.user.createdAt,
        updatedAt: profile.user.updatedAt,
      },
    });
  });

  describe('registerUser', () => {
    it('should throw BadRequestException if no registration data provided', async () => {
      await expect(service.registerUser(null)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if the email is already registered', async () => {
      const registerUserDto: RegisterUserDto = { username: 'testuser', email: 'test@example.com', password: 'password123' };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({ id: 'existing' } as any);

      await expect(service.registerUser(registerUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should hash the password and strip sensitive fields from the response', async () => {
      const registerUserDto: RegisterUserDto = { username: 'testuser', email: 'test@example.com', password: 'password123' };
      const hashedPassword = 'hashedPassword';
      const user = { id: 'userId', username: 'testuser', email: 'test@example.com', password: hashedPassword, createdAt: new Date(), updatedAt: new Date() };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(user);

      const result = await service.registerUser(registerUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerUserDto.password, 12);
      expect(result).toEqual({
        success: true,
        message: 'User registered successfully',
        data: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt },
      });
    });
  });

  describe('loginUser', () => {
    it('should throw BadRequestException if no login data provided', async () => {
      await expect(service.loginUser(null)).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if the user does not exist', async () => {
      const loginUserDto: LoginUserDto = { email: 'test@example.com', password: 'password123' };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.loginUser(loginUserDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if the password is invalid', async () => {
      const loginUserDto: LoginUserDto = { email: 'test@example.com', password: 'wrongpassword' };
      const user = { id: 'userId', email: loginUserDto.email, password: 'hashedPassword' };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.loginUser(loginUserDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should sign a JWT with the server-managed secret and return it', async () => {
      const loginUserDto: LoginUserDto = { email: 'test@example.com', password: 'password123' };
      const user = { id: 'userId', email: loginUserDto.email, password: 'hashedPassword' };
      const token = 'jwt-token';

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await service.loginUser(loginUserDto);

      // A07 — payload carries only sub/email; signing key comes from JwtModule config, never the request
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: user.id, email: user.email });
      expect(result).toEqual({
        success: true,
        message: 'Login successful',
        data: { token },
      });
    });
  });

  describe('logoutUser', () => {
    it('should throw BadRequestException if userId is missing', async () => {
      await expect(service.logoutUser('')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      await expect(service.logoutUser('missingUser')).rejects.toThrow(NotFoundException);
    });

    it('should not delete the account on logout (regression: old code deleted the user)', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({ id: requestingUserId } as any);

      const result = await service.logoutUser(requestingUserId);

      expect(prismaService.user.delete).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: 'Logged out successfully' });
    });
  });

  describe('getUserById', () => {
    it('should throw ForbiddenException if requesting another user\'s profile (BOLA)', async () => {
      await expect(service.getUserById('someoneElse', requestingUserId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      await expect(service.getUserById(requestingUserId, requestingUserId)).rejects.toThrow(NotFoundException);
    });

    it('should return the safe user for the owning user', async () => {
      const user = { id: requestingUserId, username: 'testuser', email: 'test@example.com', password: 'hash', createdAt: new Date(), updatedAt: new Date() };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await service.getUserById(requestingUserId, requestingUserId);

      expect(result).toEqual({
        success: true,
        message: 'User found successfully',
        data: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt },
      });
    });
  });

  describe('updateUser', () => {
    it('should throw ForbiddenException if updating another user\'s profile (BOLA)', async () => {
      const updateUserDto: UpdateUserDto = { username: 'updateduser' };
      await expect(service.updateUser('someoneElse', updateUserDto, requestingUserId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      const updateUserDto: UpdateUserDto = { username: 'updateduser' };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.updateUser(requestingUserId, updateUserDto, requestingUserId)).rejects.toThrow(NotFoundException);
    });

    it('should update user details', async () => {
      const updateUserDto: UpdateUserDto = { username: 'updateduser' };
      const existing = { id: requestingUserId, username: 'testuser', email: 'test@example.com', password: 'hash', createdAt: new Date(), updatedAt: new Date() };
      const updated = { ...existing, username: 'updateduser' };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(existing);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(updated);

      const result = await service.updateUser(requestingUserId, updateUserDto, requestingUserId);

      expect(result).toEqual({
        success: true,
        message: 'User updated successfully',
        data: { id: updated.id, username: updated.username, email: updated.email, createdAt: updated.createdAt, updatedAt: updated.updatedAt },
      });
    });
  });

  describe('updatePassword', () => {
    it('should throw ForbiddenException if updating another user\'s password (BOLA)', async () => {
      const updatePasswordDto: updatePasswordDTO = { oldPassword: 'oldpass', newPassword: 'newpass', email: 'test@example.com', username: 'testuser' };
      await expect(service.updatePassword('someoneElse', updatePasswordDto, requestingUserId)).rejects.toThrow(ForbiddenException);
    });

    it('should look the user up by id, not by the email in the body (regression)', async () => {
      // BUG FIX regression test — the original code fetched by data.email while writing
      // to where: { id: userId }. If the email in the body belonged to a different
      // account, this validated one user's password and overwrote another's.
      const updatePasswordDto: updatePasswordDTO = { oldPassword: 'oldpass', newPassword: 'newpass', email: 'someoneElse@example.com', username: 'testuser' };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.updatePassword(requestingUserId, updatePasswordDto, requestingUserId)).rejects.toThrow(UnauthorizedException);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: requestingUserId } });
    });

    it('should throw UnauthorizedException if the old password is invalid', async () => {
      const updatePasswordDto: updatePasswordDTO = { oldPassword: 'wrong', newPassword: 'newpass', email: 'test@example.com', username: 'testuser' };
      const user = { id: requestingUserId, email: updatePasswordDto.email, password: 'hashedOldPassword' };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.updatePassword(requestingUserId, updatePasswordDto, requestingUserId)).rejects.toThrow(UnauthorizedException);
    });

    it('should update the password with a freshly hashed value', async () => {
      const updatePasswordDto: updatePasswordDTO = { oldPassword: 'oldpass', newPassword: 'newpass', email: 'test@example.com', username: 'testuser' };
      const user = { id: requestingUserId, email: updatePasswordDto.email, username: 'testuser', password: 'hashedOldPassword', createdAt: new Date(), updatedAt: new Date() };
      const newHash = 'hashedNewPassword';
      const updated = { ...user, password: newHash };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(newHash as never);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(updated);

      const result = await service.updatePassword(requestingUserId, updatePasswordDto, requestingUserId);

      expect(bcrypt.hash).toHaveBeenCalledWith(updatePasswordDto.newPassword, 12);
      expect(prismaService.user.update).toHaveBeenCalledWith({ where: { id: requestingUserId }, data: { password: newHash } });
      expect(result).toEqual({
        success: true,
        message: 'Password updated successfully',
        data: { id: updated.id, username: updated.username, email: updated.email, createdAt: updated.createdAt, updatedAt: updated.updatedAt },
      });
    });
  });

  describe('deleteUser', () => {
    it('should throw ForbiddenException if deleting another user\'s account (BOLA)', async () => {
      await expect(service.deleteUser('someoneElse', requestingUserId)).rejects.toThrow(ForbiddenException);
    });

    it('should delete the user', async () => {
      jest.spyOn(prismaService.user, 'delete').mockResolvedValue({ id: requestingUserId } as any);

      const result = await service.deleteUser(requestingUserId, requestingUserId);

      expect(result).toEqual({ success: true, message: 'User deleted successfully' });
    });

    it('should throw InternalServerErrorException if deletion fails', async () => {
      jest.spyOn(prismaService.user, 'delete').mockRejectedValue(new Error('db error'));

      await expect(service.deleteUser(requestingUserId, requestingUserId)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
