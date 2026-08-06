import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ForbiddenException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('rejects non-admin users on agent lookup', async () => {
    await expect(
      controller.getAgent({ role: 'UTILISATEUR' }, '0123456A'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns an agent for an admin user', async () => {
    usersService.findOne.mockResolvedValue({ cp: '0123456A', role: 'UTILISATEUR' });

    await expect(
      controller.getAgent({ role: 'ADMIN' }, '0123456A'),
    ).resolves.toEqual({ cp: '0123456A', role: 'UTILISATEUR' });
  });
});
