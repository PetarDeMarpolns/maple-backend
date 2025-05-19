import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const publicPaths = [
      '/auth/login',
      '/auth/register',
    ];

    if (publicPaths.includes(req.path)) {
      return true;
    }

    return super.canActivate(context);
  }
}