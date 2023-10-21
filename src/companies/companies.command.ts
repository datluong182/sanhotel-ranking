export class CreateCompaniesCommand {
  constructor(
    public readonly name: string,
    public readonly address: string,
    public readonly avatar: string,
    public readonly links: string[],
  ) {}
}

export class UpdateCompaniesCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly address: string,
    public readonly avatar: string,
    public readonly links: string[],
  ) {}
}
