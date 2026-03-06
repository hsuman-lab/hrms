import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { jwtConfig } from '../config/jwt';
import { AppError } from '../middlewares/errorHandler';

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true, employee: { include: { department: true } } },
    });

    if (!user || !user.is_active) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role?.role_name || '',
      employeeId: user.employee?.id,
    };

    const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn as jwt.SignOptions['expiresIn'] });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role?.role_name,
        employee: user.employee
          ? {
              id: user.employee.id,
              employee_code: user.employee.employee_code,
              first_name: user.employee.first_name,
              last_name: user.employee.last_name,
              department: user.employee.department?.department_name,
            }
          : null,
      },
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) throw new AppError('Current password is incorrect', 400);

    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password_hash: hash } });
  }
}

export default new AuthService();
