import { mapUserResponse } from './user-response.dto.js';

export const mapUsersListResponse = ({ users }) => {
    return users.map((user) => mapUserResponse({ user }));
};