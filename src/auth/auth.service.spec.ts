import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service.js';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findOne: jest.fn(),
  };
  const prismaService = {
    utilisateur: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const jwtService = {
    sign: jest.fn().mockReturnValue('signed-token'),
    verify: jest.fn(),
  };
  const mailService = {
    sendResetPasswordEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: PrismaService, useValue: prismaService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('generates a JWT with the user CP and role', async () => {
    const result = await service.getToken({
      cp: '0123456A',
      email: 'agent@sncf.fr',
      role: 'ADMIN',
    } as never);

    expect(jwtService.sign).toHaveBeenCalledWith(
      { sub: '0123456A', role: 'ADMIN', user: 'agent@sncf.fr' },
      { secret: process.env.JWT_SECRET, expiresIn: '2h' },
    );
    expect(result).toEqual({ accessToken: 'signed-token' });
  });

  it('rejects login when CP or password is missing', async () => {
    await expect(service.login('', '')).rejects.toThrow('CP et mot de passe requis');
  });

  it('validates a reset token that matches the stored user token', async () => {
    jwtService.verify.mockReturnValue({ sub: '0123456A', email: 'agent@sncf.fr', role: 'ADMIN' });
    usersService.findOne.mockResolvedValue({ cp: '0123456A', authToken: 'reset-token' });

    await expect(service.validateResetToken('reset-token')).resolves.toEqual({
      valid: true,
      cp: '0123456A',
    });
  });

  it('rejects a reset token that no longer matches the stored user token', async () => {
    jwtService.verify.mockReturnValue({ sub: '0123456A', email: 'agent@sncf.fr', role: 'ADMIN' });
    usersService.findOne.mockResolvedValue({ cp: '0123456A', authToken: null });

    await expect(service.validateResetToken('reset-token')).rejects.toThrow('Token invalide ou expiré');
  });
});
