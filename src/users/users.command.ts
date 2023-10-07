
export class RegisterUserCommand {
    constructor(
        public readonly username: string,
        public readonly password: string,
        public readonly staffId: string,
        public readonly enabled: boolean,
        public readonly executionTime: Date,
    ) {
    }
}