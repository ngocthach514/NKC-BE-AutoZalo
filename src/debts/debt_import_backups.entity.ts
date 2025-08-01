import { User } from "src/users/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('debt_import_backups')
export class DebtImportBackup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  import_session_id: string; // UUID để nhóm các backup trong 1 lần import

  @Column({ type: 'int' })
  original_debt_id: number;

  @Column({ type: 'json' })
  original_data: any; // Lưu toàn bộ data gốc

  @Column({ type: 'varchar', length: 50 })
  action_type: string; // 'UPDATE', 'CREATE', 'MARK_PAID'
  
  @Column({ type: 'int', nullable: true })
  user_id: number; // ID của user thực hiện import

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}