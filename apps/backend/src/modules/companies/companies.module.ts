import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { JwtAuthGuard } from '../../common/auth-guard';

@Module({
  imports: [PrismaModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, JwtAuthGuard],
})
export class CompaniesModule {}
