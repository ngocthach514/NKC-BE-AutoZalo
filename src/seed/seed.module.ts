import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Permission } from '../permissions/permission.entity';
import { Role } from '../roles/role.entity';
import { User } from '../users/user.entity';
import { Department } from '../departments/department.entity';
import { RolePermission } from '../roles_permissions/roles-permissions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission, 
      Role, 
      User, 
      Department,
      RolePermission
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
