export class HttpError extends Error {
    readonly status: number;
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
