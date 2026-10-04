import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateAccountDto } from './dto/create-account.dto';

interface AuditActor {
  id: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CategoryBreakdown {
  label: string;
  value: number;
  pct: string;
}

export interface MonthlyTrendPoint {
  month: string;
  income: number;
  expenses: number;
}

export interface FinanceOverviewData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  pendingApprovals: number;
  thisMonthCollections: number;
  openingBalance: number;
  incomeByCategory: CategoryBreakdown[];
  expenseByCategory: CategoryBreakdown[];
  monthlyTrend: MonthlyTrendPoint[];
}

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listTransactions(query: QueryTransactionDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.paymentMethod && { paymentMethod: query.paymentMethod }),
      ...(query.accountId && { accountId: query.accountId }),
      ...(query.category && {
        OR: [
          { categoryId: query.category },
          { category: { name: { contains: query.category, mode: 'insensitive' } } },
        ],
      }),
      ...(query.search && {
        description: { contains: query.search, mode: 'insensitive' },
      }),
      ...((query.startDate || query.endDate) && {
        transactionDate: {
          ...(query.startDate && { gte: query.startDate }),
          ...(query.endDate && { lte: query.endDate }),
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          account: true,
          category: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getTransactionById(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        account: true,
        category: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction record not found.');
    }

    return transaction;
  }

  async createTransaction(dto: CreateTransactionDto, actor: AuditActor) {
    const account = await this.prisma.financeAccount.findUnique({
      where: { id: dto.accountId },
    });
    if (!account) {
      throw new UnprocessableEntityException('Specified finance account does not exist.');
    }

    const category = await this.prisma.transactionCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new UnprocessableEntityException('Specified transaction category does not exist.');
    }

    const isSettled = dto.status === 'Paid' || dto.status === 'Approved';
    const balanceDelta = isSettled
      ? dto.type === 'Income'
        ? dto.amount
        : -dto.amount
      : 0;

    const transaction = await this.prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          accountId: dto.accountId,
          categoryId: dto.categoryId,
          type: dto.type,
          description: dto.description.trim(),
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          status: dto.status ?? 'Pending',
          createdById: actor.id,
          transactionDate: dto.transactionDate ?? new Date(),
        },
        include: {
          account: true,
          category: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (balanceDelta !== 0) {
        await tx.financeAccount.update({
          where: { id: dto.accountId },
          data: {
            currentBalance: { increment: balanceDelta },
          },
        });
      }

      return created;
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'Transaction',
      entityId: transaction.id,
      status: 'Success',
      description: `Created ${dto.type} transaction of ${dto.amount} ETB in account "${account.name}" (${category.name})`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return transaction;
  }

  async updateTransaction(id: string, dto: UpdateTransactionDto, actor: AuditActor) {
    const existing = await this.prisma.transaction.findUnique({
      where: { id },
      include: { account: true, category: true },
    });

    if (!existing) {
      throw new NotFoundException('Transaction record not found.');
    }

    if (dto.accountId && dto.accountId !== existing.accountId) {
      const targetAccount = await this.prisma.financeAccount.findUnique({
        where: { id: dto.accountId },
      });
      if (!targetAccount) {
        throw new UnprocessableEntityException('Target finance account does not exist.');
      }
    }

    if (dto.categoryId && dto.categoryId !== existing.categoryId) {
      const targetCategory = await this.prisma.transactionCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!targetCategory) {
        throw new UnprocessableEntityException('Target transaction category does not exist.');
      }
    }

    const wasSettled = existing.status === 'Paid' || existing.status === 'Approved';
    const oldDelta = wasSettled
      ? existing.type === 'Income'
        ? Number(existing.amount)
        : -Number(existing.amount)
      : 0;

    const newType = dto.type ?? existing.type;
    const newAmount = dto.amount !== undefined ? dto.amount : Number(existing.amount);
    const newStatus = dto.status ?? existing.status;
    const newAccountId = dto.accountId ?? existing.accountId;
    const isNowSettled = newStatus === 'Paid' || newStatus === 'Approved';
    const newDelta = isNowSettled
      ? newType === 'Income'
        ? newAmount
        : -newAmount
      : 0;

    const transaction = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          ...(dto.accountId && { accountId: dto.accountId }),
          ...(dto.categoryId && { categoryId: dto.categoryId }),
          ...(dto.type && { type: dto.type }),
          ...(dto.description !== undefined && { description: dto.description.trim() }),
          ...(dto.amount !== undefined && { amount: dto.amount }),
          ...(dto.paymentMethod && { paymentMethod: dto.paymentMethod }),
          ...(dto.status && { status: dto.status }),
          ...(dto.transactionDate && { transactionDate: dto.transactionDate }),
        },
        include: {
          account: true,
          category: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (existing.accountId === newAccountId) {
        const netAdjustment = newDelta - oldDelta;
        if (netAdjustment !== 0) {
          await tx.financeAccount.update({
            where: { id: existing.accountId },
            data: { currentBalance: { increment: netAdjustment } },
          });
        }
      } else {
        if (oldDelta !== 0) {
          await tx.financeAccount.update({
            where: { id: existing.accountId },
            data: { currentBalance: { increment: -oldDelta } },
          });
        }
        if (newDelta !== 0) {
          await tx.financeAccount.update({
            where: { id: newAccountId },
            data: { currentBalance: { increment: newDelta } },
          });
        }
      }

      return updated;
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'UPDATE',
      entity: 'Transaction',
      entityId: transaction.id,
      status: 'Success',
      description: `Updated transaction #${transaction.id} (${transaction.description})`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return transaction;
  }

  async deleteTransaction(id: string, actor: AuditActor) {
    const existing = await this.prisma.transaction.findUnique({
      where: { id },
      include: { account: true },
    });

    if (!existing) {
      throw new NotFoundException('Transaction record not found.');
    }

    const wasSettled = existing.status === 'Paid' || existing.status === 'Approved';
    const revertDelta = wasSettled
      ? existing.type === 'Income'
        ? -Number(existing.amount)
        : Number(existing.amount)
      : 0;

    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.delete({ where: { id } });

      if (revertDelta !== 0) {
        await tx.financeAccount.update({
          where: { id: existing.accountId },
          data: { currentBalance: { increment: revertDelta } },
        });
      }
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'DELETE',
      entity: 'Transaction',
      entityId: id,
      status: 'Success',
      description: `Deleted transaction #${id} of ${existing.amount} ETB`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return { message: 'Transaction deleted successfully.' };
  }

  async overview(): Promise<FinanceOverviewData> {
    const [incomeRows, expenseRows, pendingApprovals, account] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { type: 'Income', status: { in: ['Paid', 'Approved'] } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { type: 'Expense', status: { in: ['Paid', 'Approved'] } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.count({ where: { status: 'Pending' } }),
      this.prisma.financeAccount.findFirst({ orderBy: { createdAt: 'asc' } }),
    ]);

    const totalIncome = Number(incomeRows._sum.amount ?? 0);
    const totalExpenses = Number(expenseRows._sum.amount ?? 0);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCollections = await this.prisma.transaction.aggregate({
      where: {
        type: 'Income',
        status: { in: ['Paid', 'Approved'] },
        transactionDate: { gte: monthStart },
      },
      _sum: { amount: true },
    });

    const [incomeByCategory, expenseByCategory, monthlyTrend] = await Promise.all([
      this.getCategoryBreakdown('Income'),
      this.getCategoryBreakdown('Expense'),
      this.getMonthlyTrend(),
    ]);

    return {
      totalIncome,
      totalExpenses,
      netBalance: Number(account?.currentBalance ?? totalIncome - totalExpenses),
      pendingApprovals,
      thisMonthCollections: Number(thisMonthCollections._sum.amount ?? 0),
      openingBalance: Number(account?.openingBalance ?? 0),
      incomeByCategory,
      expenseByCategory,
      monthlyTrend,
    };
  }

  async listCategories(type?: 'Income' | 'Expense') {
    return this.prisma.transactionCategory.findMany({
      where: { ...(type && { type }) },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(dto: CreateCategoryDto, actor: AuditActor) {
    const name = dto.name.trim();
    const existing = await this.prisma.transactionCategory.findUnique({
      where: { name },
    });

    if (existing) {
      throw new ConflictException(`Transaction category "${name}" already exists.`);
    }

    const category = await this.prisma.transactionCategory.create({
      data: {
        name,
        type: dto.type,
      },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'TransactionCategory',
      entityId: category.id,
      status: 'Success',
      description: `Created ${dto.type} category "${category.name}"`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return category;
  }

  async listAccounts() {
    return this.prisma.financeAccount.findMany({
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createAccount(dto: CreateAccountDto, actor: AuditActor) {
    const openingBalance = dto.openingBalance ?? 0;
    const account = await this.prisma.financeAccount.create({
      data: {
        name: dto.name.trim(),
        openingBalance,
        currentBalance: openingBalance,
      },
    });

    await this.recordAudit({
      userId: actor.id,
      action: 'CREATE',
      entity: 'FinanceAccount',
      entityId: account.id,
      status: 'Success',
      description: `Created finance account "${account.name}" with opening balance ${openingBalance} ETB`,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });

    return account;
  }

  private async getCategoryBreakdown(type: 'Income' | 'Expense'): Promise<CategoryBreakdown[]> {
    type GroupRow = { categoryId: string; _sum: { amount: Prisma.Decimal | null } };
    const rows = (await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { type, status: { in: ['Paid', 'Approved'] } },
      _sum: { amount: true },
    })) as unknown as GroupRow[];

    if (rows.length === 0) return [];

    const categories = await this.prisma.transactionCategory.findMany({
      where: { id: { in: rows.map((r) => r.categoryId) } },
    });
    const categoryMap = new Map<string, string>(categories.map((c) => [c.id, c.name]));

    const total = rows.reduce((sum, r) => sum + Number(r._sum.amount ?? 0), 0);

    return rows
      .map((r) => {
        const value = Number(r._sum.amount ?? 0);
        return {
          label: categoryMap.get(r.categoryId) ?? 'Unknown',
          value,
          pct: total > 0 ? `${((value / total) * 100).toFixed(0)}%` : '0%',
        };
      })
      .sort((a, b) => b.value - a.value);
  }

  private async getMonthlyTrend(): Promise<MonthlyTrendPoint[]> {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const rows = await this.prisma.transaction.findMany({
      where: {
        transactionDate: { gte: yearStart },
        status: { in: ['Paid', 'Approved'] },
      },
      select: { type: true, amount: true, transactionDate: true },
    });

    const buckets = new Map<string, { income: number; expenses: number }>();
    for (const r of rows) {
      const key = r.transactionDate.toLocaleDateString('en-US', { month: 'short' });
      const bucket = buckets.get(key) ?? { income: 0, expenses: 0 };
      if (r.type === 'Income') bucket.income += Number(r.amount);
      else bucket.expenses += Number(r.amount);
      buckets.set(key, bucket);
    }

    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthOrder.map((m) => ({
      month: m,
      income: buckets.get(m)?.income ?? 0,
      expenses: buckets.get(m)?.expenses ?? 0,
    }));
  }

  private async recordAudit(data: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    status: 'Success' | 'Failed';
    description?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          status: data.status,
          description: data.description,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (err) {
      this.logger.error(`Audit log creation failed: ${(err as Error).message}`);
    }
  }
}
