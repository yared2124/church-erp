import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid church credentials');
    }

    if (user.status !== 'Active') {
      throw new UnauthorizedException(
        `Account is ${user.status.toLowerCase()}. Please contact church administration.`,
      );
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid church credentials');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles: user.roles.map((r) => r.role.name),
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    // Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      status: user.status,
    };

    const accessToken = this.jwtService.sign(payload);
    this.logger.log(`🔑 User authenticated successfully: ${user.email} (${user.roles.join(', ')})`);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles: user.roles,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const normalizedEmail = registerDto.email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    // Look for default viewer role or create if not present
    let defaultRole = await this.prisma.role.findFirst({
      where: { name: 'Viewer' },
    });

    if (!defaultRole) {
      defaultRole = await this.prisma.role.findFirst();
    }

    const newUser = await this.prisma.user.create({
      data: {
        name: registerDto.name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: registerDto.phone?.trim() || null,
        status: 'Active',
        ...(defaultRole
          ? {
              roles: {
                create: {
                  roleId: defaultRole.id,
                },
              },
            }
          : {}),
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    this.logger.log(`👤 New user registered: ${newUser.email}`);

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      status: newUser.status,
      roles: newUser.roles.map((r) => r.role.name),
      createdAt: newUser.createdAt,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User profile not found');
    }

    const permissions = new Set<string>();
    user.roles.forEach((r) => {
      r.role.permissions.forEach((p) => {
        permissions.add(p.permission.key);
      });
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles: user.roles.map((r) => r.role.name),
      permissions: Array.from(permissions),
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }
}
