import {CreepType} from "../creep/CreepType";
import {CreepTypeVisitor} from "../creep/CreepTypeVisitor";

export interface CreepBuilder {
  name: string;
  actions: Array<BodyPartConstant>;
  opts: SpawnOptions;
}

export class CreepFactory {

  public static build(creepType: CreepType) {

    const visitor: CreepTypeVisitor<CreepBuilder> = {
      harvester: () => {
        return this.buildHarvester(creepType);
      },
      upgrader: () => {
        return this.buildUpgrader(creepType);
      },
      builder: () => {
        return this.buildBuilder(creepType);
      }
    }

    return creepType.accept(visitor);
  }

  private static buildHarvester(creepType: CreepType): CreepBuilder {
    return {
      name: `${creepType.kind} ${Game.time}`,
      actions: [MOVE, WORK, CARRY],
      opts: {
        memory: {
          role: creepType.kind,
        }
      }
    }
  }

  private static buildUpgrader(creepType: CreepType): CreepBuilder {
    return {
      name: `${creepType.kind} ${Game.time}`,
      actions: [MOVE, WORK, CARRY],
      opts: {
        memory: {
          role: creepType.kind,
        }
      }
    }
  }

  private static buildBuilder(creepType: CreepType): CreepBuilder {
    return {
      name: `${creepType.kind} ${Game.time}`,
      actions: [MOVE, WORK, CARRY],
      opts: {
        memory: {
          role: creepType.kind,
        }
      }
    }
  }

}
