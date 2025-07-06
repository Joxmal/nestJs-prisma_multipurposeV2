// src/common/decorators/get-logger.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithLogger } from '../interfaces/request-with-logger.interface';

export const GetLogger = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithLogger>();
    return request.log;
  },
);
