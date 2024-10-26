import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../modules/prisma.service';
import { AuthService } from '../auth/auth.service';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;
  let authService: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockAuthService = {
    generateAccessToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  const mockUserData = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '1234567890',
    kraPin: 'KRA123',
    address: '123 Test St',
  };

  describe('createEngineer', () => {
    it('should create an engineer successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const mockToken = 'mockToken123';
      const mockCreatedUser = {
        ...mockUserData,
        id: 1,
        password: hashedPassword,
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);
      mockAuthService.generateAccessToken.mockReturnValue(mockToken);

      const result = await service.createEngineer(mockUserData);

      expect(result).toEqual({
        token: mockToken,
        message: 'Success. Engineer account created successfully',
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...mockUserData,
          password: hashedPassword,
        },
      });
    });

    it('should throw BadRequestException if required fields are missing', async () => {
      const incompleteData = { email: 'test@example.com' };

      await expect(
        service.createEngineer(incompleteData as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUserData);

      await expect(service.createEngineer(mockUserData)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if KRA PIN already exists', async () => {
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUserData);

      await expect(service.createEngineer(mockUserData)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('createAdmin', () => {
    it('should create an admin successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const mockToken = 'mockToken123';
      const mockCreatedUser = {
        ...mockUserData,
        id: 1,
        password: hashedPassword,
        role: 'ADMIN',
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);
      mockAuthService.generateAccessToken.mockReturnValue(mockToken);

      const result = await service.createAdmin(mockUserData);

      expect(result).toEqual({
        token: mockToken,
        message: 'Success. Admin created successfully.',
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...mockUserData,
          role: 'ADMIN',
          password: hashedPassword,
        },
      });
    });

    it('should throw BadRequestException if required fields are missing', async () => {
      const incompleteData = { email: 'test@example.com' };

      await expect(service.createAdmin(incompleteData as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createProjectManager', () => {
    it('should create a project manager successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const mockToken = 'mockToken123';
      const mockCreatedUser = {
        ...mockUserData,
        id: 1,
        password: hashedPassword,
        role: 'PROJECT_MANAGER',
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);
      mockAuthService.generateAccessToken.mockReturnValue(mockToken);

      const result = await service.createProjectManager(mockUserData);

      expect(result).toEqual({
        token: mockToken,
        message: 'Success. Project manager account created successfully',
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...mockUserData,
          role: 'PROJECT_MANAGER',
          password: hashedPassword,
        },
      });
    });

    it('should throw BadRequestException if required fields are missing', async () => {
      const incompleteData = { email: 'test@example.com' };

      await expect(
        service.createProjectManager(incompleteData as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('loginUser', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      const mockToken = 'mockToken123';
      const mockUser = {
        ...mockUserData,
        id: 1,
        password: 'hashedPassword123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockAuthService.generateAccessToken.mockReturnValue(mockToken);

      const result = await service.loginUser(loginData);

      expect(result).toEqual({
        token: mockToken,
        message: 'Success. User logged in successfully.',
      });
    });

    it('should throw BadRequestException if required fields are missing', async () => {
      const incompleteData = { email: 'test@example.com' };

      await expect(service.loginUser(incompleteData as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.loginUser(loginData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if password is invalid', async () => {
      const mockUser = {
        ...mockUserData,
        id: 1,
        password: 'hashedPassword123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.loginUser(loginData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
