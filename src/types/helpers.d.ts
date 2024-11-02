type Flatten<T> = T extends (infer U)[] ? U : never;
