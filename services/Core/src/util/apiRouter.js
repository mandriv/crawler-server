import { Router } from 'express';
// middlesware
import checkToken from '../middleware/checkToken';
// controllers
import UserController from '../controllers/user.controller';
import AuthController from '../controllers/auth.controller';
import EmailController from '../controllers/email.controller';
import CrawlersController from '../controllers/crawlers.controller';

const routes = new Router();
// Users
routes.get('/users', checkToken, UserController.findAll);
routes.get('/users/:id', checkToken, UserController.findById);
routes.post('/users', UserController.create);
routes.put('/users/:id', checkToken, UserController.update);
routes.delete('/users/:id', checkToken, UserController.delete);
routes.delete('/users', checkToken, UserController.deleteAll);

routes.put('/users/:id/role/:role', checkToken, UserController.assignRole);
routes.put('/users/:id/verify', UserController.verifyEmail);
routes.post('/users/:id/email', checkToken, EmailController.sendToId);

// Login
routes.post('/login', AuthController.login);
routes.get('/auth', checkToken, AuthController.authenticate);
routes.post('/crawlers/login', AuthController.loginCrawler);

// Crawlers
routes.get('/crawlers', checkToken, CrawlersController.findAll);
routes.get('/crawlers/:id', checkToken, CrawlersController.findById);
routes.post('/crawlers', checkToken, CrawlersController.create);
routes.put('/crawlers/:id', checkToken, CrawlersController.update);
routes.put('/crawlers/:id/user/:uid', checkToken, CrawlersController.assignUser);
routes.patch('/crawlers/:id/user/:uid/remove', checkToken, CrawlersController.deassignUser);
routes.get('/crawlers/user/:id', checkToken, CrawlersController.findByUserId);

export default routes;
