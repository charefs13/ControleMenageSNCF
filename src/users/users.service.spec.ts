import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('signed.invitation.token'),
  verify: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  const prismaService = {
    utilisateur: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const mailService = {
    sendCreatePasswordEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects duplicated CP or email during user creation', async () => {
    prismaService.utilisateur.findFirst.mockResolvedValue({ cp: '0123456A' });

    await expect(
      service.create({
        cp: '0123456A',
        email: 'agent@sncf.fr',
        nom: 'Durand',
        prenom: 'Alex',
      }),
    ).rejects.toThrow('Un utilisateur avec ce CP ou cet email existe déjà');
  });

  it('creates an invitation token compatible with reset-password validation', async () => {
    process.env.FRONTEND_URL = 'http://localhost:5173';
    process.env.JWT_SECRET = 'test-secret';
    prismaService.utilisateur.findFirst.mockResolvedValue(null);
    prismaService.utilisateur.create.mockResolvedValue({
      cp: '0123456A',
      email: 'agent@sncf.fr',
    });

    await service.create({
      cp: '0123456A',
      email: 'agent@sncf.fr',
      nom: 'Durand',
      prenom: 'Alex',
    });

    expect(jwt.sign).toHaveBeenCalledWith(
      {
        sub: '0123456A',
        cp: '0123456A',
        email: 'agent@sncf.fr',
        role: 'UTILISATEUR',
      },
      'test-secret',
      { expiresIn: '24h' },
    );
    expect(mailService.sendCreatePasswordEmail).toHaveBeenCalledWith(
      'agent@sncf.fr',
      'http://localhost:5173/update-password?cp=0123456A&token=signed.invitation.token',
    );
  });

  it('finds a user by CP', async () => {
    prismaService.utilisateur.findUnique.mockResolvedValue({ cp: '0123456A' });

    await expect(service.findOne('0123456A')).resolves.toEqual({ cp: '0123456A' });
    expect(prismaService.utilisateur.findUnique).toHaveBeenCalledWith({
      where: { cp: '0123456A' },
    });
  });
});
