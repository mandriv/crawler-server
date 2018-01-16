import { Router } from 'express';
// middlesware
import checkToken from '../middleware/checkToken';
// controllers
import UserController from '../controllers/user.controller';
import LoginController from '../controllers/login.controller';

const routes = new Router();
// Users
routes.get('/user', checkToken, UserController.findAll);
routes.get('/user/:id', checkToken, UserController.findById);
routes.post('/user', UserController.create);
routes.put('/user/:id', checkToken, UserController.update);
routes.put('/user/:id/role/:role', checkToken, UserController.assignRole);
routes.delete('/user/:id', checkToken, UserController.delete);
// Login
routes.post('/login', LoginController.login);

export default routes;
