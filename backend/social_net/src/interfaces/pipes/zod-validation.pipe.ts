import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodType, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType<any>) {} 

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (err) {
      if (err instanceof ZodError) {
        const formatted = err.flatten();
        throw new BadRequestException({
          message: 'Validation failed',
          fieldErrors: formatted.fieldErrors,
          formErrors: formatted.formErrors,
        });
      }
      throw err;
    }
  }
}
