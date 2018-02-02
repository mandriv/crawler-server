import { Router } from 'express';
// middlesware
import checkToken from '../middleware/checkToken';
// controllers
import UserController from '../controllers/user.controller';
import LoginController from '../controllers/login.controller';
import EmailController from '../controllers/email.controller';

const routes = new Router();
// Users
routes.get('/users', checkToken, UserController.findAll);
routes.get('/users/:id', checkToken, UserController.findById);
routes.post('/users', UserController.create);
routes.put('/users/:id', checkToken, UserController.update);
routes.put('/users/:id/role/:role', checkToken, UserController.assignRole);
routes.delete('/users/:id', checkToken, UserController.delete);
routes.delete('/users', checkToken, UserController.deleteAll);
// Mailing
routes.post('/users/:id/email', checkToken, EmailController.sendToId);
// Login
routes.post('/login', LoginController.login);

export default routes;
