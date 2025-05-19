import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('test')
export class AuthController {
  @Get('public')
  getPublic() {
    return '누구나 접근 가능';
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin')
  getAdminOnly(@Req() req: any) {
    return `관리자만 접근 가능, 환영합니다 ${req.user.userId}`;
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return { user: req.user };
  }
}