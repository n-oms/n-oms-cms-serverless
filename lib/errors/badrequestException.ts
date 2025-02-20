import { HttpError } from './httpError';

export class BadRequestException extends HttpError {
    constructor(message) {
        super(message, 400);
        this.name = 'BadRequestException';
    }
}
