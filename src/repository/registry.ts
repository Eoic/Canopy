export type WithId<T> = T & { id: string };

export class Registry<T> {
    protected entities: Map<string, T> = new Map();

    public addEntity(entity: WithId<T>): void {
        this.entities.set(entity.id, entity);
    };

    public removeEntity(id: string): void {
        this.entities.delete(id);
    }
};
