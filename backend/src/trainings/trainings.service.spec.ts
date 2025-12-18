import { Test, TestingModule } from '@nestjs/testing';
import { TrainingsService } from './trainings.service';
import { PrismaService } from '../prisma/prisma.service';
import { AutomationService } from '../automation/automation.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('TrainingsService', () => {
  let service: TrainingsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    training: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockAutomationService = {
    triggerMaterialDistribution: jest.fn(),
  };

  const mockAuditLogsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AutomationService,
          useValue: mockAutomationService,
        },
        {
          provide: AuditLogsService,
          useValue: mockAuditLogsService,
        },
      ],
    }).compile();

    service = module.get<TrainingsService>(TrainingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated trainings', async () => {
      const mockTrainings = [
        { id: '1', name: 'Test Training', status: 'SCHEDULED' },
      ];
      const mockCount = 1;

      mockPrismaService.training.findMany.mockResolvedValue(mockTrainings);
      mockPrismaService.training.count.mockResolvedValue(mockCount);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockTrainings);
      expect(result.total).toBe(mockCount);
      expect(mockPrismaService.training.findMany).toHaveBeenCalled();
    });
  });
});

