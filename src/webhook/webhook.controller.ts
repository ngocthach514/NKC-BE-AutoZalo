import { Controller, Post, Body, UseGuards, Put, Get } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { UpdateZaloStatusDto } from '../users/dto/update-zalo-status.dto';
import { WebhookAuthGuard } from '../common/guards/webhook-auth.guard';

@Controller('webhook')
@UseGuards(WebhookAuthGuard)
export class WebhookController {
  constructor(private readonly userService: UserService) {}

  @Put('zalo-link-status')
  async updateZaloLinkStatus(@Body() updateZaloStatusDto: UpdateZaloStatusDto) {
    const { userId } = updateZaloStatusDto;

    try {
      const result = await this.userService.updateZaloLinkStatus(userId, 2);
      return {
        success: true,
        message: 'Zalo link status updated successfully',
        data: {
          userId: result?.id,
          zaloLinkStatus: result?.zaloLinkStatus,
          updatedAt: result?.updatedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update zalo link status',
        error: error.message,
      };
    }
  }

  @Get('check-auth')
  async checkAuth() {
    try {
      const currentTime = new Date().toISOString();
      return {
        success: true,
        message: 'Thành công',
        data: {
          timestamp: currentTime,
          server: 'NKC-AutoZalo-V2',
          status: 'Thành công',
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Thất bại',
        error: error.message,
      };
    }
  }
}
