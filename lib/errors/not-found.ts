import { HttpError } from './httpError';

export class NotFoundException extends HttpError {
    constructor(message) {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}
