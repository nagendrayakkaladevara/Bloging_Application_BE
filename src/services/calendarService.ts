import { prisma } from '../config/database';
import { CalendarEvent } from '../types';
import { AppError } from '../middleware/errorHandler';

export class CalendarService {
  async getEvents(params: {
    startDate?: string;
    endDate?: string;
    blogId?: string;
  }): Promise<CalendarEvent[]> {
    // Default to current month
    const now = new Date();
    const monthStart = params.startDate
      ? new Date(params.startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = params.endDate
      ? new Date(params.endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const events = await prisma.calendarEvent.findMany({
      where: {
        eventDate: {
          gte: monthStart,
          lte: monthEnd,
        },
        blogId: params.blogId || undefined,
      },
      include: {
        blog: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
      orderBy: [
        { eventDate: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      event_date: event.eventDate,
      start_time: event.startTime,
      end_time: event.endTime,
      color: event.color as 'blue' | 'green' | 'purple' | 'orange',
      blog_id: event.blogId,
      created_at: event.createdAt,
      updated_at: event.updatedAt,
      blog_slug: event.blog?.slug,
      blog_title: event.blog?.title,
    })) as any;
  }

  async getEventById(id: string): Promise<CalendarEvent | null> {
    const event = await prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        blog: {
          select: {
            slug: true,
            title: true,
          },
        },
      },
    });

    if (!event) {
      return null;
    }

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      event_date: event.eventDate,
      start_time: event.startTime,
      end_time: event.endTime,
      color: event.color as 'blue' | 'green' | 'purple' | 'orange',
      blog_id: event.blogId,
      created_at: event.createdAt,
      updated_at: event.updatedAt,
      blog_slug: event.blog?.slug,
      blog_title: event.blog?.title,
    } as any;
  }

  async createEvent(data: {
    title: string;
    description?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange';
    blogId?: string;
  }): Promise<CalendarEvent> {
    // Validate end time is after start time
    if (data.startTime && data.endTime) {
      const start = new Date(`2000-01-01T${data.startTime}`);
      const end = new Date(`2000-01-01T${data.endTime}`);
      if (end <= start) {
        throw new AppError('VALIDATION_ERROR', 'End time must be after start time', 400);
      }
    }

    // Validate blog exists if provided
    if (data.blogId) {
      const blog = await prisma.blog.findUnique({
        where: { id: data.blogId },
        select: { id: true },
      });
      if (!blog) {
        throw new AppError('NOT_FOUND', 'Blog not found', 404);
      }
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description || null,
        eventDate: new Date(data.date),
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        color: data.color || 'blue',
        blogId: data.blogId || null,
      },
    });

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      event_date: event.eventDate,
      start_time: event.startTime,
      end_time: event.endTime,
      color: event.color as 'blue' | 'green' | 'purple' | 'orange',
      blog_id: event.blogId,
      created_at: event.createdAt,
      updated_at: event.updatedAt,
    };
  }

  async updateEvent(id: string, data: Partial<{
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
    blogId: string;
  }>): Promise<CalendarEvent> {
    // Get existing event
    const existing = await this.getEventById(id);
    if (!existing) {
      throw new AppError('NOT_FOUND', 'Event not found', 404);
    }

    // Validate end time is after start time
    const startTime = data.startTime || existing.start_time;
    const endTime = data.endTime || existing.end_time;
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      if (end <= start) {
        throw new AppError('VALIDATION_ERROR', 'End time must be after start time', 400);
      }
    }

    // Validate blog exists if provided
    if (data.blogId) {
      const blog = await prisma.blog.findUnique({
        where: { id: data.blogId },
        select: { id: true },
      });
      if (!blog) {
        throw new AppError('NOT_FOUND', 'Blog not found', 404);
      }
    }

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title: data.title ?? undefined,
        description: data.description ?? undefined,
        eventDate: data.date ? new Date(data.date) : undefined,
        startTime: data.startTime ?? undefined,
        endTime: data.endTime ?? undefined,
        color: data.color ?? undefined,
        blogId: data.blogId ?? undefined,
      },
    });

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      event_date: event.eventDate,
      start_time: event.startTime,
      end_time: event.endTime,
      color: event.color as 'blue' | 'green' | 'purple' | 'orange',
      blog_id: event.blogId,
      created_at: event.createdAt,
      updated_at: event.updatedAt,
    };
  }

  async deleteEvent(id: string): Promise<void> {
    await prisma.calendarEvent.delete({
      where: { id },
    });
  }
}

export const calendarService = new CalendarService();
