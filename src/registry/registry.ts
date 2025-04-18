import { Entity } from './entities/entity';

type OnAddCallback<T> = (entities: T[]) => void;
type OnRemoveCallback<T> = (entities: T[]) => void;
type OnUpdateCallback<T, U> = (entities: T[], keys: (keyof U)[]) => void

export class Registry<T extends Entity<U>, U> {
    protected _entities: Map<string, T> = new Map();
    protected _onAddCallback?: OnAddCallback<T>;
    protected _onRemoveCallback?: OnRemoveCallback<T>;
    protected _onUpdateCallback?: OnUpdateCallback<T, U>;

    public get entities(): Map<string, T> {
        return this._entities;
    }

    public getEntity(id: string): T | null {
        return this._entities.get(id) || null;
    }

    public getEntities(): T[] {
        return Array.from(this._entities.values());
    }

    public addEntity(entity: T) {
        this._entities.set(entity.id, entity);
        this._onAddCallback?.([entity]);
    };

    public hasEntity(id: string): boolean {
        return this._entities.has(id);
    }

    public updateEntity(id: string, entityData: Pick<U, keyof U>) {
        const entity = this._entities.get(id);

        if (!entity)
            throw new Error(`Cannot update entity - it does not exist: ${id}.`);

        const updatedKeys = entity.setData(entityData);
        this._onUpdateCallback?.([entity], updatedKeys);
    }

    public removeEntity(id: string) {
        const entity = this._entities.get(id);

        if (!entity) {
            console.warn('Entity does not exist!');
            return;
        }

        this._entities.delete(id);
        this._onRemoveCallback?.([entity]);
    }

    public onAdd(callback: OnAddCallback<T>) {
        this._onAddCallback = callback;
    }

    public onUpdate(callback: OnUpdateCallback<T, U>) {
        this._onUpdateCallback = callback;
    }

    public onRemove(callback: OnRemoveCallback<T>) {
        this._onRemoveCallback = callback;
    }
};
