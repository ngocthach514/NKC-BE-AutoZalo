import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
  Req,
  HttpCode,
} from '@nestjs/common';
import { DebtService } from './debt.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as ExcelJS from 'exceljs';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Permission } from '../common/guards/permission.decorator';
import { PermissionGuard } from '../common/guards/permission.guard';

@Controller('debts')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class DebtController {
  constructor(private readonly debtService: DebtService) {}

  @Get()
  @Permission('cong-no', 'read')
  async findAll(@Query() query: any, @Req() req) {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const pageSize = Number(query.pageSize) > 0 ? Number(query.pageSize) : 10;

    try {
      const result = await this.debtService.findAll(
        query,
        req.user,
        page,
        pageSize,
      );

      // QUAN TRỌNG: Luôn đảm bảo return object, không bao giờ undefined
      return {
        data: result?.data || [],
        total: result?.total || 0,
        page,
        pageSize,
      };
    } catch (error) {
      // Log error
      console.error('Error in findAll controller:', error);

      // Vẫn return empty data
      return {
        data: [],
        total: 0,
        page,
        pageSize,
      };
    }
  }

  @Get('customers')
  @Permission('cong-no', 'read')
  async getUniqueCustomers(@Req() req) {
    return this.debtService.getUniqueCustomerList(req.user);
  }

  @Get('stats')
  @Permission('cong-no', 'read')
  async getStats(@Query() query: any, @Req() req) {
    // Lấy toàn bộ dữ liệu theo filter (nếu có), không phân trang
    const result = await this.debtService.findAll(query, req.user, 1, 1000000); // lấy tối đa 1 triệu bản ghi
    const debts = result.data || [];

    // Tổng tiền của tất cả các phiếu
    const totalAmount = debts.reduce(
      (sum, d) => sum + (Number(d.total_amount) || 0),
      0,
    );

    // Tổng số phiếu
    const totalBills = debts.length;

    // 1. Tổng tiền các phiếu có trạng thái "paid" (đã thanh toán)
    const totalPaidAmount = debts
      .filter((d) => d.status === 'paid')
      .reduce((sum, d) => sum + (Number(d.total_amount) || 0), 0);

    // 2. Tổng tiền thực tế đã thu (từ tất cả các phiếu)
    const totalCollected = debts.reduce(
      (sum, d) =>
        sum + ((Number(d.total_amount) || 0) - (Number(d.remaining) || 0)),
      0,
    );

    const totalRemaining = debts.reduce(
      (sum, d) => sum + (Number(d.remaining) || 0),
      0,
    );

    // Số phiếu đã thanh toán
    const totalPaidBills = debts.filter((d) => d.status === 'paid').length;

    return {
      totalAmount: totalAmount || 0,
      totalBills: totalBills || 0,
      totalCollected: totalCollected || 0,
      totalPaidAmount: totalPaidAmount || 0,
      totalPaidBills: totalPaidBills || 0,
      totalRemaining: totalRemaining || 0,
    };
  }

  @Get('stats/overview')
  @Permission('cong-no', 'read')
  async getStatsOverview(@Query() query: any, @Req() req) {
    return this.debtService.getStatsOverview(query, req.user);
  }

  @Get('stats/aging')
  @Permission('cong-no', 'read')
  async getAgingAnalysis(@Query() query: any, @Req() req) {
    return this.debtService.getAgingAnalysis(query, req.user);
  }

  @Get('stats/trends')
  @Permission('cong-no', 'read')
  async getTrends(@Query() query: any, @Req() req) {
    return this.debtService.getTrends(query, req.user);
  }

  @Get('stats/employee-performance')
  @Permission('cong-no', 'read')
  async getEmployeePerformance(@Query() query: any, @Req() req) {
    return this.debtService.getEmployeePerformance(query, req.user);
  }

  @Get('stats/department-breakdown')
  @Permission('cong-no', 'read')
  async getDepartmentBreakdown(@Query() query: any, @Req() req) {
    return this.debtService.getDepartmentBreakdown(query, req.user);
  }

  @Get('employees')
  @Permission('cong-no', 'read')
  async getUniqueEmployees(@Req() req) {
    return this.debtService.getUniqueEmployeeList(req.user);
  }

  @Get('import-history')
  @Permission('cong-no', 'read')
  async getImportHistory(@Query('date') date?: string) {
    return this.debtService.getImportHistory(date);
  }

  @Post('import-rollback')
  @Permission('cong-no', 'delete')
  async rollbackImport(@Body('import_session_id') sessionId: string) {
    if (!sessionId) {
      throw new BadRequestException('import_session_id là bắt buộc');
    }
    return this.debtService.rollbackImport(sessionId);
  }

  @Get(':id')
  @Permission('cong-no', 'read')
  findOne(@Param('id') id: string) {
    const numId = Number(id);
    if (isNaN(numId) || !isFinite(numId)) {
      throw new BadRequestException('ID không hợp lệ');
    }
    return this.debtService.findOne(numId);
  }

  @Post()
  @Permission('cong-no', 'create')
  create(@Body() body: any) {
    return this.debtService.create(body);
  }

  @Patch(':id')
  @Permission('cong-no', 'update')
  update(@Param('id') id: number, @Body() body: any) {
    return this.debtService.update(id, body);
  }

  @Delete(':id')
  @Permission('cong-no', 'delete')
  async softDelete(@Param('id') id: number) {
    if (!id) throw new BadRequestException('ID không hợp lệ');
    await this.debtService.remove(id);
    return { success: true };
  }

  @Post('import-excel')
  @Permission('cong-no', 'import')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    const worksheet = workbook.worksheets[0];
    const rows: Record<string, any>[] = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Bỏ qua header nếu cần
      const rowData: Record<string, any> = {};
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        rowData[cell.value as string] = row.getCell(colNumber).value;
      });
      rows.push(rowData);
    });

    const userId = req.user?.id;
    return this.debtService.importExcelRows(rows, userId);
  }

  @Post('update-pay-later')
  @Permission('cong-no', 'update')
  async updatePayLater(
    @Body() body: { customerCodes: string[]; payDate: string },
  ) {
    if (!Array.isArray(body.customerCodes) || !body.payDate) {
      throw new BadRequestException('customerCodes và payDate là bắt buộc');
    }
    const payDate = new Date(body.payDate);
    const updated = await this.debtService.updatePayLaterForCustomers(
      body.customerCodes,
      payDate,
    );
    return { updated };
  }

  @Delete('bulk/today')
  @Permission('cong-no', 'delete')
  async deleteAllTodayDebts() {
    const deleted = await this.debtService.deleteAllTodayDebts();
    return {
      success: true,
      deleted,
      message: `Đã xóa ${deleted} phiếu công nợ có ngày cập nhật hôm nay`,
    };
  }

  @Patch(':id/note-status')
  @Permission('cong-no', 'update')
  async updateNoteAndStatus(
    @Param('id') id: number,
    @Body() body: { note?: string; status?: string },
  ) {
    return this.debtService.updateNoteAndStatusKeepUpdatedAt(id, body);
  }
}
