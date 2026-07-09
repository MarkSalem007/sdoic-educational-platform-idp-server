import usersRoutes from '../modules/users/users.endpoints.js';
import authenticationRoutes from '../modules/authentication/authentication.endpoints.js';

export default function routes(app) {
    app.use('/api/v1/users', usersRoutes);
    app.use('/api/v1/authentication', authenticationRoutes);
}