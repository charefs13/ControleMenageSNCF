import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    login: jest.fn(),
    verifyToken: jest.fn(),
    acceptTerms: jest.fn(),
    resetPassword: jest.fn(),
    updatePassword: jest.fn(),
  };
  const usersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('sets an HttpOnly cookie after a successful login', async () => {
    authService.login.mockResolvedValue({
      accessToken: 'jwt-token',
      acceptedTerms: true,
    });
    const response = { cookie: jest.fn() };

    await expect(
      controller.login({ cp: '0123456A', mdp: 'secret' }, response as never),
    ).resolves.toEqual({ acceptedTerms: true });
    expect(response.cookie).toHaveBeenCalledWith(
      'accessToken',
      'jwt-token',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' }),
    );
  });
});
