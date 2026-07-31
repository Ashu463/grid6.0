import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import * as bcrypt from 'bcrypt';
import { LoginUserDto, RegisterUserDto, updatePasswordDTO, UpdateUserDto, UserResponseDto } from 'src/dto/um.dto';
import { JwtService } from '@nestjs/jwt';
import { UniversalResponseDTO } from 'src/dto/universal.response.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UserService {
  private readonly logger: Logger;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    this.logger = new Logger(UserService.name);
  }
 
  // A02 — strip password and secretKey before returning any user object
  private toSafeUser(user: any): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // password and secretKey intentionally omitted
    };
  }
 
  async validateOAuthLogin(profile: any): Promise<UniversalResponseDTO> {
    if (!profile) {
      return { success: false, message: 'No profile received from OAuth provider' };
    }
    // A02 — only return safe fields, never the raw profile
    return { success: true, message: 'OAuth profile received', data: this.toSafeUser(profile.user) };
  }
 
  async registerUser(registerUserDto: RegisterUserDto): Promise<UniversalResponseDTO> {
    if (!registerUserDto?.email || !registerUserDto?.username || !registerUserDto?.password) {
      throw new BadRequestException({ success: false, message: 'Email, username and password are required' });
    }
 
    const existing = await this.prismaService.user.findUnique({
      where: { email: registerUserDto.email },
    });
    if (existing) {
      throw new BadRequestException({ success: false, message: 'Registration failed' });
    }
 
    const hashedPassword = await bcrypt.hash(registerUserDto.password, BCRYPT_ROUNDS);
 
    try {
      const user = await this.prismaService.user.create({
        data: { ...registerUserDto, password: hashedPassword },
      });
      return { success: true, message: 'User registered successfully', data: this.toSafeUser(user) };
    } catch (error) {
      this.logger.error('registerUser failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
 
  async loginUser(loginUserDto: LoginUserDto): Promise<UniversalResponseDTO> {
    if (!loginUserDto) {
      throw new BadRequestException({ success: false, message: 'Login data is required' });
    }
 
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: loginUserDto.email },
      });
 
      const passwordValid = user
        ? await bcrypt.compare(loginUserDto.password, user.password)
        : false;
 
      if (!user || !passwordValid) {
        throw new UnauthorizedException({ success: false, message: 'Invalid credentials' });
      }
 
      // A07 — sign using server-managed secret configured in JwtModule (env variable).
      //        The old per-user secretKey pattern is REMOVED — it allowed token forgery.
      const token = this.jwtService.sign({ sub: user.id, email: user.email });
 
      return { success: true, message: 'Login successful', data: { token } };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('loginUser failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
 
  async logoutUser(userId: string): Promise<UniversalResponseDTO> {
    // BUG FIX (Critical) — original code DELETED the user account on logout.
    // A04 — Insecure Design: logout must invalidate the session/token, not destroy the user.
    //
    // To fully implement token revocation, add a RevokedToken table to your Prisma schema:
    //   model RevokedToken { id String @id, userId String, revokedAt DateTime }
    // Then uncomment:
    //   await this.prismaService.revokedToken.create({ data: { id: randomUUID(), userId, revokedAt: new Date() } });
    // And check for revoked tokens in your JWT guard.
 
    if (!userId) {
      throw new BadRequestException({ success: false, message: 'User ID is required' });
    }
 
    const user = await this.prismaService.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({ success: false, message: 'User not found' });
    }
 
    // logSecurityEvent('USER_LOGOUT', { userId });
    return { success: true, message: 'Logged out successfully' };
  }
 
  async getUserById(userId: string, requestingUserId: string): Promise<UniversalResponseDTO> {
    if (!userId) {
      throw new BadRequestException({ success: false, message: 'User ID is required' });
    }
 
    // A01 — users can only fetch their own profile (add role check at controller for admins)
    if (userId !== requestingUserId) {
      // logSecurityEvent('USER_GET_UNAUTHORIZED', { requestingUserId, targetUserId: userId });
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
 
    const user = await this.prismaService.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException({ success: false, message: 'User not found' });
    }
 
    // A02 — strip sensitive fields
    return { success: true, message: 'User found successfully', data: this.toSafeUser(user) };
  }
 
  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    requestingUserId: string,
  ): Promise<UniversalResponseDTO> {
    if (!userId || !updateUserDto) {
      throw new BadRequestException({ success: false, message: 'User ID and update data are required' });
    }
 
    // A01 — users can only update their own profile
    if (userId !== requestingUserId) {
      // logSecurityEvent('USER_UPDATE_UNAUTHORIZED', { requestingUserId, targetUserId: userId });
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
 
    try {
      const user = await this.prismaService.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException({ success: false, message: 'User not found' });
      }
 
      const res = await this.prismaService.user.update({ where: { id: userId }, data: updateUserDto });
      return { success: true, message: 'User updated successfully', data: this.toSafeUser(res) };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('updateUser failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
 
  async updatePassword(
    userId: string,
    data: updatePasswordDTO,
    requestingUserId: string,
  ): Promise<UniversalResponseDTO> {
    if (!userId || !data) {
      throw new BadRequestException({ success: false, message: 'User ID and password data are required' });
    }
 
    // A01 — users can only change their own password
    if (userId !== requestingUserId) {
      // logSecurityEvent('PASSWORD_UPDATE_UNAUTHORIZED', { requestingUserId, targetUserId: userId });
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
 
    try {
      // BUG FIX — was looking the user up by data.email while writing to
      // where: { id: userId }. If they disagreed, this validated one user's
      // password and rewrote a different user's password hash.
      const user = await this.prismaService.user.findUnique({ where: { id: userId } });

      const passwordValid = user
        ? await bcrypt.compare(data.oldPassword, user.password)
        : false;
 
      if (!user || !passwordValid) {
        // logSecurityEvent('PASSWORD_UPDATE_FAILED', { userId });
        throw new UnauthorizedException({ success: false, message: 'Invalid credentials' });
      }
 
      // A02 — enforce bcrypt work factor on the new password
      const newHash = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS);
 
      const res = await this.prismaService.user.update({
        where: { id: userId },
        data: { password: newHash },
      });
 
      return { success: true, message: 'Password updated successfully', data: this.toSafeUser(res) };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('updatePassword failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
 
  async deleteUser(userId: string, requestingUserId: string): Promise<UniversalResponseDTO> {
    if (!userId) {
      throw new BadRequestException({ success: false, message: 'User ID is required' });
    }
 
    // A01 — users can only delete their own account (admins handled via role guard at controller)
    if (userId !== requestingUserId) {
      // logSecurityEvent('USER_DELETE_UNAUTHORIZED', { requestingUserId, targetUserId: userId });
      throw new ForbiddenException({ success: false, message: 'Access denied' });
    }
 
    try {
      await this.prismaService.user.delete({ where: { id: userId } });
      // logSecurityEvent('USER_DELETED', { userId });
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      this.logger.error('deleteUser failed', error);
      throw new InternalServerErrorException({ success: false, message: 'Internal server error' });
    }
  }
}
