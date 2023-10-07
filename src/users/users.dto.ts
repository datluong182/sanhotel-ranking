import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UserRegisterDto {
    @ApiProperty()
    @IsString()
    username: string;
    
    @ApiProperty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsString()
    staffId: string;
}
