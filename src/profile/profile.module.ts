import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { AuthModule } from 'src/auth/auth.module'; // 👈 ¡Importante!

@Module({
  imports: [AuthModule], // 👈 Añade AuthModule aquí
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
