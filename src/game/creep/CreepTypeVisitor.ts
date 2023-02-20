
export interface CreepTypeVisitor<T> {
  harvester: () => T;
  builder: () => T;
  upgrader: () => T;
}
