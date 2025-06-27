export class Service<Repository, Registry> {
    protected _repository: Repository;
    protected _registry: Registry;

    constructor(repository: Repository, registry: Registry) {
        this._repository = repository;
        this._registry = registry;
    }
}
