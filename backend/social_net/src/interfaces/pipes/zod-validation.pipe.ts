import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodType, ZodError, treeifyError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType<any>) { }

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (err) {
      if (err instanceof ZodError) {
        const formatted = treeifyError(err);
        throw new BadRequestException({
          message: 'Validation failed',
          fieldErrors: formatted.errors,
        });
      }
      throw err;
    }
  }
}
