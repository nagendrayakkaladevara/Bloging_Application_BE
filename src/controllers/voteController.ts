import { Request, Response, NextFunction } from 'express';
import { voteService } from '../services/voteService';
import { getClientIpAddress } from '../utils/ipAddress';
import { ApiResponse } from '../types';

export class VoteController {
  async vote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const { voteType } = req.body;
      const ipAddress = getClientIpAddress(req);
      const sessionId = req.headers['x-session-id'] as string | undefined;

      const voting = await voteService.vote(slug, voteType, ipAddress, sessionId);

      const response: ApiResponse = {
        success: true,
        data: { voting },
        message: 'Vote recorded successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async removeVote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const ipAddress = getClientIpAddress(req);
      const sessionId = req.headers['x-session-id'] as string | undefined;

      const voting = await voteService.removeVote(slug, ipAddress, sessionId);

      const response: ApiResponse = {
        success: true,
        data: { voting },
        message: 'Vote removed successfully',
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const voteController = new VoteController();
