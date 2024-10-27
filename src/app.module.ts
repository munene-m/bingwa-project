import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';
import { UserModule } from './user/user.module';
import { ProjectModule } from './projects/project.module';

@Module({
  imports: [UserModule, ProjectModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}
