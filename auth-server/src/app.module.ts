import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true,  envFilePath: '.env' }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    AuthModule, 
  ],
})
export class AppModule {}
