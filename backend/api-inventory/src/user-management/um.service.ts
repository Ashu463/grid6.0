import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import * as bcrypt from 'bcrypt';
import { LoginUserDto, RegisterUserDto, UpdateUserDto, UserResponseDto } from 'src/dto/um.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    console.log("Reguest aa gyi ", registerUserDto)
    if(!registerUserDto){
      throw new BadRequestException({
        success : false, 
        message : 'pls send registeration data along with that'
      })
    }
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    const user = await this.prismaService.user.create({
      data: {
        ...registerUserDto,
        password: hashedPassword,
      },
    });
    return this.toUserResponseDto(user);
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<string> {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginUserDto.email },
    });

    if (!user || !(await bcrypt.compare(loginUserDto.password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    // Simulate JWT token return (use a real JWT service in production)
    return 'fake-jwt-token';
  }

  async logoutUser(userId: string): Promise<void> {
    // Invalidate user session logic here (e.g., remove token from DB)
    // This is a placeholder
  }

  async getUserById(userId: string) {
    
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return this.toUserResponseDto(user);
  }
  
  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    console.log(userId, ' is the user id in service')
    console.log(updateUserDto, " is the dto in service")
    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: updateUserDto,
    });

    return this.toUserResponseDto(user);
  }

  async deleteUser(userId: string): Promise<any> {
    await this.prismaService.user.delete({
      where: { id: userId },
    });
    return {
      success : true, 
      message : 'user deleted successfully'

    }
  }

  private toUserResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
