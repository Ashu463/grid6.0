import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { DoesNotEndWithHyphen } from 'src/utils/hyphen';

export class RegisterUserDto {
  @IsString()
  @DoesNotEndWithHyphen({ message: 'Username should not end with a hyphen.' })
  @ApiProperty({ description: 'The username of the new user' })
  username: string;

  @IsString()
  @DoesNotEndWithHyphen({ message: 'Email ID should not end with a hyphen.' })
  @ApiProperty({ description: 'The email address of the new user' })
  email: string;

  @IsString()
  @DoesNotEndWithHyphen({ message: 'Password should not end with a hyphen.' })
  @ApiProperty({ description: 'The password for the new user' })
  password: string;

  @IsString()
  @DoesNotEndWithHyphen({ message: 'Secret Key should not end with a hyphen.' })
  @ApiProperty({ description: 'The secret key associated with the new user' })
  secretKey : string
}

export class LoginUserDto {
  @IsString()
  @DoesNotEndWithHyphen({ message: 'Email ID should not end with a hyphen.' })
  @ApiProperty({ description: 'The email address of the user' })
  email: string;

  @IsString()
  @DoesNotEndWithHyphen({ message: 'Password should not end with a hyphen.' })
  @ApiProperty({ description: 'The password of the user' })
  password: string;
  
  @IsString()
  @DoesNotEndWithHyphen({ message: 'Secret Key should not end with a hyphen.' })
  @ApiProperty({ description: 'The secret key associated with the new user' })
  secretKey : string;
}


export class UpdateUserDto {
  @IsString()
  @DoesNotEndWithHyphen({ message: 'Username should not end with a hyphen.' })
  @ApiProperty({ description: 'The new username of the user', required: false })
  username?: string;

  @IsString()
  @DoesNotEndWithHyphen({ message: 'Email Id should not end with a hyphen.' })
  @ApiProperty({ description: 'The new email address of the user', required: false })
  email?: string;

  @IsString()
  @DoesNotEndWithHyphen({ message: 'Password should not end with a hyphen.' })
  @ApiProperty({ description: 'The new password for the user', required: false })
  password?: string;
}

export class updatePasswordDTO{
  @IsString()
  @DoesNotEndWithHyphen({ message: 'Username should not end with a hyphen.' })
  username : string;

  @IsString()
  @DoesNotEndWithHyphen({ message: 'Email ID should not end with a hyphen.' })
  email : string;

  @IsString()
  @DoesNotEndWithHyphen({ message: 'Password should not end with a hyphen.' })
  oldPassword : string;

  @IsString()
  @DoesNotEndWithHyphen({ message: 'Password should not end with a hyphen.' })
  newPassword : string;
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
