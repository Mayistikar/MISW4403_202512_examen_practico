import { HttpException, HttpStatus } from '@nestjs/common';

export enum BusinessError {
  NOT_FOUND = 'NOT_FOUND',
  PRECONDITION_FAILED = 'PRECONDITION_FAILED',
}

const BusinessErrorStatusMap: Record<BusinessError, HttpStatus> = {
  [BusinessError.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [BusinessError.PRECONDITION_FAILED]: HttpStatus.PRECONDITION_FAILED,
};

export class BusinessLogicException extends HttpException {
  constructor(message: string, error: BusinessError) {
    super(message, BusinessErrorStatusMap[error]);
    this.name = 'BusinessLogicException';
  }
}
