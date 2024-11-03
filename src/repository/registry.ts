import { Entity } from './entity';

type OnAddCallback<T> = (entity: T) => void;
type OnRemoveCallback<T> = (entity: T) => void;
type OnUpdateCallback<T> = (entity: T, keys: string[]) => void

export class Registry<T extends Entity<U>, U> {
    protected _entities: Map<string, T> = new Map();
    protected _onAddCallback?: OnAddCallback<T>;
    protected _onRemoveCallback?: OnRemoveCallback<T>;
    protected _onUpdateCallback?: OnUpdateCallback<T>;

    public addEntity(entity: T): void {
        this._entities.set(entity.id, entity);
        this._onAddCallback?.(entity);
    };

    public removeEntity(id: string): void {
        const entity = this._entities.get(id);

        if (!entity) {
            console.warn('Entity does not exist!');
            return;
        }

        this._entities.delete(id);
        this._onRemoveCallback?.(entity);
    }

    public updateEntity(id: string, entityData: Partial<U>) {
        const entity = this._entities.get(id);

        if (!entity)
            throw new Error(`Cannot update entity - it does not exist: ${id}.`);

        const updatedKeys = entity.update(entityData);
        this._onUpdateCallback?.(entity, updatedKeys);
    }

    public onAdd(callback: OnAddCallback<T>): void {
        this._onAddCallback = callback;
    }

    public onUpdate(callback: OnUpdateCallback<T>): void {
        this._onUpdateCallback = callback;
    }

    public onRemove(callback: OnRemoveCallback<T>): void {
        this._onRemoveCallback = callback;
    }
};
