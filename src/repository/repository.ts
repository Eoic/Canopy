export abstract class Repository<D, E, R> {
    protected _registry: R;

    constructor(registry: R) {
        this._registry = registry;
    }

    protected abstract _hydrate(dto: D): E
}
