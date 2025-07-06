import { Request } from 'express';
import { IncomingMessage } from 'http';

export interface RequestWithLogger extends Request {
  log: IncomingMessage['log'];
}
