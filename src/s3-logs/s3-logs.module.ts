import { Module } from '@nestjs/common';
import { S3LogsService } from './s3-logs.service';

@Module({
  providers: [S3LogsService],
})
export class S3LogsModule {}
