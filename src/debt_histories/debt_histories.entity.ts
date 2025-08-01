import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DebtLogs } from '../debt_logs/debt_logs.entity';

@Entity({ name: 'debt_histories' })
@Index('idx_debt_log_id', ['debt_log_id'])
@Index('idx_remind_status', ['remind_status'])
@Index('idx_send_at', ['send_at'])
export class DebtHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  debt_log_id: number;

  @ManyToOne(() => DebtLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'debt_log_id' })
  debt_log: DebtLogs;

  @Column({ type: 'longtext', nullable: true })
  debt_msg: string;

  @Column({ type: 'datetime', nullable: true })
  send_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  full_name: string;

  @Column({ type: 'longtext', nullable: true })
  first_remind: string;

  @Column({ type: 'longtext', nullable: true })
  error_msg: string;

  @Column({ type: 'datetime', nullable: true })
  first_remind_at: Date;

  @Column({ type: 'longtext', nullable: true })
  second_remind: string;

  @Column({ type: 'datetime', nullable: true })
  second_remind_at: Date;

  @Column({ type: 'longtext', nullable: true })
  sale_msg: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  conv_id: string;

  @Column({ type: 'longtext', nullable: true })
  debt_img: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  remind_status: string;

  @Column({ type: 'text', nullable: true })
  gender: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
