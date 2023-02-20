import {CreepTypeVisitor} from "./CreepTypeVisitor";

export class CreepType {

  private static readonly _TYPES: Record<string, CreepType> = {};

  public static readonly HARVESTER = new CreepType('harvester', (visitor) => visitor.harvester());
  public static readonly BUILDER = new CreepType('builder', (visitor) => visitor.builder());
  public static readonly UPGRADER = new CreepType('upgrader', (visitor) => visitor.upgrader());

  constructor(
    private readonly _kind: string,
    private readonly _accept: <T> (visitor: CreepTypeVisitor<T>) => T,
  ) {
    CreepType._TYPES[_kind] = this;
  }

  public get kind() {
    return this._kind;
  }

  public accept<T>(visitor: CreepTypeVisitor<T>) {
    return this._accept(visitor);
  }

  public static fromType(type: string) {
    if (type in CreepType._TYPES) {
      return CreepType._TYPES[type];
    }

    return CreepType.HARVESTER;
  }
}
