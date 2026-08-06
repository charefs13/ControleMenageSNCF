import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';

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

  it('finds a user by CP', async () => {
    prismaService.utilisateur.findUnique.mockResolvedValue({ cp: '0123456A' });

    await expect(service.findOne('0123456A')).resolves.toEqual({ cp: '0123456A' });
    expect(prismaService.utilisateur.findUnique).toHaveBeenCalledWith({
      where: { cp: '0123456A' },
    });
  });
});
