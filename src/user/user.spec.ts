import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../modules/prisma.service';
import { AuthService } from '../auth/auth.service';
import { UpdateUserDto } from './dto/update-user.dto';

import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;
  let authService: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
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
        role: Role.ADMIN,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockAuthService.generateAccessToken.mockReturnValue(mockToken);

      const result = await service.loginUser(loginData);

      expect(result).toEqual({
        token: mockToken,
        user: {
          id: expect.any(Number),
          role: expect.any(String),
          username: `${mockUserData.firstName} ${mockUserData.lastName}`,
        },
        message: 'Success. User logged in successfully.',
      });
    });

    it('should throw BadRequestException if required fields are missing', async () => {
      const incompleteData = { email: 'test@example.com' };

      await expect(service.loginUser(incompleteData as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.loginUser(loginData)).rejects.toThrow(
        BadRequestException,
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
  describe('getUsersById', () => {
    it('should return a user if found', async () => {
      const mockUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        address: '123 Main St',
        kraPin: 'KRA123',
        role: 'USER',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserById(1);
      expect(result).toEqual(mockUser);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          address: true,
          kraPin: true,
          role: true,
        },
      });
    });
    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserById(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const errorMessage = 'Database error';
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(service.getUserById(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
  describe('getAllUsers', () => {
    it('should return a list of users', async () => {
      const mockUsers = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          address: '123 Yellowstone ranch',
          kraPin: 'KRA123',
          role: 'USER',
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          address: '43 Block St',
          kraPin: 'KRA456',
          role: 'ADMIN',
        },
      ];
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers();
      expect(result).toEqual(mockUsers);
      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          address: true,
          kraPin: true,
          role: true,
        },
      });
    });
    it('should throw InternalServerErrorException on unexpected error', async () => {
      const errorMessage = 'Database error';
      mockPrismaService.user.findMany.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(service.getAllUsers()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
  describe('updateUser', () => {
    it('should update and return the updated user', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
        email: 'updated@example.com',
        phoneNumber: '0712345678',
        password: 'newPassword123',
        address: 'Updated Address',
        kraPin: 'A12345678',
        role: 'ENGINEER',
      };
      const existingUser = { id: userId, role: 'User' };
      const updatedUser = { ...existingUser, ...updateUserDto };

      prismaService.user.findUnique = jest.fn().mockResolvedValue(existingUser);
      prismaService.user.update = jest.fn().mockResolvedValue(updatedUser);

      const result = await service.updateUser(userId, updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(updateUserDto.password, 10);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          firstName: updateUserDto.firstName,
          lastName: updateUserDto.lastName,
          email: updateUserDto.email,
          phoneNumber: updateUserDto.phoneNumber,
          password: 'hashedPassword123',
          address: updateUserDto.address,
          kraPin: updateUserDto.kraPin,
          role: updateUserDto.role,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          address: true,
          kraPin: true,
          role: true,
        },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
        email: 'updated@example.com',
        phoneNumber: '0712345678',
        password: 'newPassword123',
        address: 'Updated Address',
        kraPin: 'A12345678',
        role: 'ENGINEER',
      };

      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.updateUser(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw InternalServerErrorException if an unexpected error occurs', async () => {
      const userId = 1;
      const updateUserDto: UpdateUserDto = {
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
        email: 'updated@example.com',
        phoneNumber: '0712345678',
        password: 'newPassword123',
        address: 'Updated Address',
        kraPin: 'A12345678',
        role: 'ENGINEER',
      };

      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue({ id: userId });
      prismaService.user.update = jest
        .fn()
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(service.updateUser(userId, updateUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
  describe('deleteUser', () => {
    it('should find user and delete their account', async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        address: '123 Main St',
        kraPin: 'KRA123',
        role: 'USER',
      };

      prismaService.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      prismaService.user.delete = jest
        .fn()
        .mockResolvedValue({ message: 'User deleted successfully' });
      const result = await service.deleteUser(userId);

      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 1;

      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.deleteUser(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(prismaService.user.delete).not.toHaveBeenCalled();
    });
    it('should throw InternalServerErrorException if an unexpected error occurs', async () => {
      const userId = 1;
      const mockError = new Error('Unexpected error');

      prismaService.user.findUnique = jest
        .fn()
        .mockResolvedValue({ id: userId });
      prismaService.user.delete = jest.fn().mockRejectedValue(mockError);

      await expect(service.deleteUser(userId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });
});
