import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ description: 'The username of the new user' })
  username: string;

  @ApiProperty({ description: 'The email address of the new user' })
  email: string;

  @ApiProperty({ description: 'The password for the new user' })
  password: string;
}

export class LoginUserDto {
  @ApiProperty({ description: 'The email address of the user' })
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  password: string;
}

export class UpdateUserDto {
  @ApiProperty({ description: 'The new username of the user', required: false })
  username?: string;

  @ApiProperty({ description: 'The new email address of the user', required: false })
  email?: string;

  @ApiProperty({ description: 'The new password for the user', required: false })
  password?: string;
}

export class UserResponseDto {
  @ApiProperty({ description: 'The unique ID of the user' })
  id: string;

  @ApiProperty({ description: 'The username of the user' })
  username: string;

  @ApiProperty({ description: 'The email address of the user' })
  email: string;

  @ApiProperty({ description: 'The date the user was created' })
  createdAt: Date;

  @ApiProperty({ description: 'The date the user was last updated' })
  updatedAt: Date;
}
