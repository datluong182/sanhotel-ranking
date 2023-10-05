import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";

export class AddPointForStaffDto {
    @ApiProperty()
    @IsString()
    staffId: string;


    @ApiProperty()
    @IsNumber()
    point: number;
}

export class AddPointRequestDto {
    @ApiProperty({
        isArray: true,
        type: AddPointForStaffDto
    })
    @IsArray()
    infos: AddPointForStaffDto[];
}