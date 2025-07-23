import { prisma } from "@/lib/prisma";
import type { Competition as PrismaCompetition, User as PrismaUser } from '@prisma/client';

export type CompetitionStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export interface CreateCompetitionData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: CompetitionStatus;
  organizerId: string;
  rules: string;
  prize: string;
  maxParticipants: number;
  location: string;
  image?: string;
}

export interface UpdateCompetitionData {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: CompetitionStatus;
  rules?: string;
  prize?: string;
  maxParticipants?: number;
  location?: string;
  image?: string;
}

export class CompetitionModel {
  static async create(data: CreateCompetitionData) {
    const { organizerId, ...competitionData } = data;
    return prisma.competition.create({
      data: {
        ...competitionData,
        organizer: {
          connect: { id: organizerId }
        }
      },
      include: {
        organizer: true,
        participants: {
          include: {
            user: true
          }
        },
        winners: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async findById(id: string) {
    return prisma.competition.findUnique({
      where: { id },
      include: {
        organizer: true,
        participants: {
          include: {
            user: true
          }
        },
        winners: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async update(id: string, data: UpdateCompetitionData) {
    return prisma.competition.update({
      where: { id },
      data,
      include: {
        organizer: true,
        participants: {
          include: {
            user: true
          }
        },
        winners: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async delete(id: string) {
    return prisma.competition.delete({
      where: { id }
    });
  }

  static async list() {
    return prisma.competition.findMany({
      include: {
        organizer: true,
        participants: {
          include: {
            user: true
          }
        },
        winners: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async findByStatus(status: CompetitionStatus) {
    return prisma.competition.findMany({
      where: { status },
      include: {
        organizer: true,
        participants: {
          include: {
            user: true
          }
        },
        winners: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async findByOrganizer(organizerId: string) {
    return prisma.competition.findMany({
      where: { organizerId },
      include: {
        organizer: true,
        participants: {
          include: {
            user: true
          }
        },
        winners: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async search(query: string) {
    return prisma.competition.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        organizer: true,
        participants: {
          include: {
            user: true
          }
        },
        winners: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async addParticipant(competitionId: string, userId: string) {
    return prisma.competition.update({
      where: { id: competitionId },
      data: {
        participants: {
          create: {
            userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async removeParticipant(competitionId: string, userId: string) {
    const participant = await prisma.competitionParticipant.findFirst({
      where: {
        competitionId,
        userId
      }
    });

    if (participant) {
      return prisma.competitionParticipant.delete({
        where: {
          id: participant.id
        }
      });
    }

    return null;
  }

  static async addWinner(competitionId: string, userId: string, rank: number) {
    return prisma.competition.update({
      where: { id: competitionId },
      data: {
        winners: {
          create: {
            userId,
            rank
          }
        }
      },
      include: {
        winners: {
          include: {
            user: true
          }
        }
      }
    });
  }
} 