import { Express, Request, Response } from 'express';
// Import route modules
// import userRoutes from '../modules/users/routes';
// import authRoutes from '../modules/auth/routes';


export function setupRoutes(app: Express): void {
  // API health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'API is running',
      timestamp: new Date().toISOString(),
    });
  });

  // Base API route
  app.get('/api', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Welcome to the API',
    });
  });
 

  // Mount feature routes
  // app.use('/api/users', userRoutes);
  // app.use('/api/auth', authRoutes);

  // Add more routes as your application grows
}
