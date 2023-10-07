import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserRegisterDto } from "./users.dto";
import { UsersService } from "./users.service";
import { RegisterUserCommand } from "./users.command";

@Controller("users")
export class UsersController {
    
    constructor(
        private readonly userService: UsersService,
    ) {

    }

    @Post("register")
    async register(
        @Body() body: UserRegisterDto,
    ) {
        return this.userService.registerUser(
            new RegisterUserCommand(
                body.username,
                body.password,
                body.staffId,
                false,
                new Date(),
            )
        );
    }


    @Get("my")
    async getMy() {
        
    }
}