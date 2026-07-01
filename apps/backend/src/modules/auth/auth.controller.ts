import { Body, Controller, Post , Patch, Put , Param ,Res} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/registerUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
@Controller({
	path: 'auth',
	version: '3',
})
export class AuthController {
	constructor(private readonly authService: AuthService , 
		private readonly configService: ConfigService
	) {}

	@Post('register')
	register(@Body() registerUserDto: RegisterUserDto) {
		return this.authService.register(registerUserDto);
	}

	@Post('login')
	async login(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: Response) {
  		const token = await this.authService.login(loginUserDto);
		res.cookie('bookit-access-token', token, {
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 1000 * 60 * 60 * 24, 
		});
  		return { message: 'Logged in successfully' };
}

	@Put('logout/:email')
	async logout(@Param('email') email: string) {
		await this.authService.logout(email);
		return { message: 'Logged out successfully' };
	}
	@Patch('refresh-token/:userId')
	async refreshToken(@Param('userId') userId: string, @Body('refreshToken') refreshToken: string) {
		const newAccessToken = await this.authService.refreshToken(userId, refreshToken);
		return { accessToken: newAccessToken };
	}
}
