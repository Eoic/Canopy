export class Service<REP, REG> {
    protected _repository: REP;
    protected _registry: REG;

    constructor(repository: REP, registry: REG) {
        this._repository = repository;
        this._registry = registry;
    }
}
