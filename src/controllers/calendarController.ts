import { Request, Response, NextFunction } from 'express';
import { calendarService } from '../services/calendarService';
import { ApiResponse } from '../types';

export class CalendarController {
  async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const blogId = req.query.blogId as string | undefined;

      const events = await calendarService.getEvents({ startDate, endDate, blogId });

      const response: ApiResponse = {
        success: true,
        data: {
          events: events.map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.event_date.toISOString().split('T')[0],
            startTime: event.start_time,
            endTime: event.end_time,
            color: event.color,
            blogId: event.blog_id,
            blog: event.blog_id ? {
              slug: (event as any).blog_slug,
              title: (event as any).blog_title,
            } : null,
          })),
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await calendarService.createEvent(req.body);

      const response: ApiResponse = {
        success: true,
        data: {
          event: {
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.event_date.toISOString().split('T')[0],
            startTime: event.start_time,
            endTime: event.end_time,
            color: event.color,
            blogId: event.blog_id,
          },
        },
        message: 'Event created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const event = await calendarService.updateEvent(id, req.body);

      const response: ApiResponse = {
        success: true,
        data: {
          event: {
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.event_date.toISOString().split('T')[0],
            startTime: event.start_time,
            endTime: event.end_time,
            color: event.color,
            blogId: event.blog_id,
          },
        },
        message: 'Event updated successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await calendarService.deleteEvent(id);

      const response: ApiResponse = {
        success: true,
        message: 'Event deleted successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const calendarController = new CalendarController();
