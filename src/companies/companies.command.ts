export class CreateCompaniesCommand {
  constructor(
    public readonly name: string,
    public readonly address: string,
    public readonly avatar: string,
    public readonly links: string[],
  ) {}
}
