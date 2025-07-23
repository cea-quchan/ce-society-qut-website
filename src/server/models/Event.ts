import { prisma } from "@/lib/prisma";

export interface CreateEventData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  capacity: number;
  organizerId: string;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  capacity?: number;
}

export class EventModel {
  static async create(data: CreateEventData) {
    return prisma.event.create({
      data,
      include: {
        organizer: true,
        participants: {
          include: {
            user: true
          }
        },
        likes: {
          include: {
            user: true
          }
        },
        comments: {
          include: {
            author: true
          }
        }
      }
    });
  }

  static async findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: {
        organizer: true,
        participants: {
          include: {
            user: true
          }
        },
        likes: {
          include: {
            user: true
          }
        },
        comments: {
          include: {
            author: true
          }
        }
      }
    });
  }

  static async update(id: string, data: UpdateEventData) {
    return prisma.event.update({
      where: { id },
      data,
      include: {
        organizer: true,
        participants: {
          include: {
            user: true
          }
        },
        likes: {
          include: {
            user: true
          }
        },
        comments: {
          include: {
            author: true
          }
        }
      }
    });
  }

  static async delete(id: string) {
    return prisma.event.delete({
      where: { id }
    });
  }

  static async list() {
    return prisma.event.findMany({
      include: {
        organizer: true,
        participants: {
          include: {
            user: true
          }
        },
        likes: {
          include: {
            user: true
          }
        },
        comments: {
          include: {
            author: true
          }
        }
      }
    });
  }

  static async findByOrganizer(organizerId: string) {
    return prisma.event.findMany({
      where: { organizerId },
      include: {
        organizer: true,
        participants: {
          include: {
            user: true
          }
        },
        likes: {
          include: {
            user: true
          }
        },
        comments: {
          include: {
            author: true
          }
        }
      }
    });
  }

  static async addParticipant(eventId: string, userId: string) {
    return prisma.eventParticipant.create({
      data: {
        eventId,
        userId,
        status: 'pending'
      },
      include: {
        event: true,
        user: true
      }
    });
  }

  static async updateParticipantStatus(eventId: string, userId: string, status: 'pending' | 'approved' | 'rejected') {
    return prisma.eventParticipant.update({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      },
      data: {
        status
      },
      include: {
        event: true,
        user: true
      }
    });
  }

  static async removeParticipant(eventId: string, userId: string) {
    return prisma.eventParticipant.delete({
      where: {
        eventId_userId: {
          eventId,
          userId
        }
      }
    });
  }
} 