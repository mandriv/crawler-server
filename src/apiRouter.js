import { Router } from 'express';

import UserController from './controllers/user.controller';

const routes = new Router();
// Users
routes.get('/user', UserController.findAll);
routes.get('/user/:id', UserController.findById);
routes.post('/user', UserController.create);
routes.put('/user/:id', UserController.update);
routes.put('/user/:id/role/:role', UserController.assignRole);
routes.delete('/user/:id', UserController.delete);

export default routes;
