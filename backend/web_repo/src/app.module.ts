import { Module } from '@nestjs/common';
import { AuthModule } from './interface_adapters/auth.module';

@Module({
  imports: [AuthModule],
})
export class AppModule {}
