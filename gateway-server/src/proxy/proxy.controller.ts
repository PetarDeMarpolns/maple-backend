import {
  Controller,
  All,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

@Controller()
export class ProxyController {
  constructor(private readonly httpService: HttpService) {}

  @All('auth/*')
  async proxyToAuth(@Req() req: Request, @Res() res: Response) {
    const path = req.originalUrl.replace(/^\/auth\//, '');
    const targetUrl = `http://localhost:3000/auth/${path}`;

    try {
      const result = await lastValueFrom(
        this.httpService.request({
          method: req.method,
          url: targetUrl,
          data: req.body,
          headers: {
            ...req.headers,
            'Content-Length': undefined,   
            'Transfer-Encoding': undefined,
            'Content-Type': 'application/json', 
        },
        timeout: 5000,
        }),
      );
      const response = result as AxiosResponse;
      return res.status(response.status).json(response.data);
    } catch (error) {
      console.error('[GATEWAY][auth] Proxy error:', error?.response?.data || error.message);
      return res.status(error?.response?.status || 500).json({
        message: 'Auth Gateway Proxy Error',
        error: error?.response?.data || error.message,
      });
    }
  }

  @All('events/*')
  async proxyToEvents(@Req() req: Request, @Res() res: Response) {
    const path = req.originalUrl.replace(/^\/events\//, '');
    const targetUrl = `http://localhost:3002/events/${path}`;

    try {
      const result = await lastValueFrom(
        this.httpService.request({
          method: req.method,
          url: targetUrl,
          data: req.body,
          headers: { 
            ...req.headers, 
            'Content-Length': undefined,
            'Transfer-Encoding': undefined, 
            'Content-Type': 'application/json', 
          },
          timeout: 5000,
        }),
      );
      const response = result as AxiosResponse;
      return res.status(response.status).json(response.data);
    } catch (error) {
      console.error('[GATEWAY][events] Proxy error:', error?.response?.data || error.message);
      return res.status(error?.response?.status || 500).json({
        message: 'Events Gateway Proxy Error',
        error: error?.response?.data || error.message,
      });
    }
  }
}