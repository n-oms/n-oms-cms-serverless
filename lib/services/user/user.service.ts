import { Logger } from '@aws-lambda-powertools/logger';
import { UserModel } from '../../dynamodb/models/users';
import { BadRequestException } from '../../errors/badrequestException';
import { bindMethods } from '../../utils';
import { CreateUser, GetUser, UpdateUser } from './user.types';

export class UserService {
    constructor() {
        bindMethods(this);
    }

    async createUser(input: CreateUser) {
        const existingUser = await this.getUser({
            email: input.email,
            tenantId: input.tenantId,
            logger: input.logger,
        });

        if (existingUser) {
            input.logger.info('User already exists. Skipping creation', { email: input.email });
            return existingUser;
        }

        return await UserModel.createUser({
            data: input.data,
            email: input.email,
            tenantId: input.tenantId,
            logger: input.logger,
        });
    }

    async getUser(input: GetUser) {
        return await UserModel.getUser({
            email: input.email,
            tenantId: input.tenantId,
            logger: input.logger,
        });
    }

    async getAllUsers(input: { tenantId: string; logger: Logger }) {
        return await UserModel.getAllUsers({
            tenantId: input.tenantId,
            logger: input.logger,
        });
    }

    async updateUser(input: UpdateUser) {
        const data = input.data;

        if (!data || Object.keys(data).length === 0) {
            throw new BadRequestException('No value provided for update');
        }

        if ('email' in data) {
            throw new BadRequestException('Email cannot be updated');
        }

        return await UserModel.updateUser({
            email: input.email,
            tenantId: input.tenantId,
            data: input.data,
            logger: input.logger,
        });
    }
}
