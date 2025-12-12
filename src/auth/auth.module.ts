import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { UsersModule } from '../users/users.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from '../mail/mail.module.js'; // ← import du module Mail

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    forwardRef(() => UsersModule),
    MailModule, // ← ajoute MailModule ici
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
