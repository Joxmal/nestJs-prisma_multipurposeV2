import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module'; // Necesario para JwtAuthGuard

@Module({
  imports: [PrismaModule, AuthModule], // Importamos PrismaModule y AuthModule
  controllers: [ArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
