export abstract class Repository<D, E, R> {
    protected _registry: R;

    constructor(registry: R) {
        this._registry = registry;
    }

    public abstract hydrate(dto: D): E
}
