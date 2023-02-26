
export type CreepType =
  | "harvester"
  | "transporter"
  | "upgrader"
  ;

// https://screeps.fandom.com/wiki/Creep
const PART_COST: Record<BodyPartConstant, number> = {
  move: 50,
  work: 100,
  carry: 50,
  attack: 80,
  ranged_attack: 150,
  heal: 250,
  tough: 10,
  claim: 600
} as const;

const STANDARD_CREEP: Record<CreepType, Array<BodyPartConstant>> = {
  harvester: [WORK, WORK, CARRY, MOVE],
  transporter: [CARRY, MOVE],
  upgrader: [MOVE, CARRY, WORK],
};

const EXTANDED_CREEP: Record<CreepType, Array<BodyPartConstant>> = {
  harvester: [WORK, MOVE],
  transporter: [CARRY, MOVE],
  upgrader: [CARRY, WORK, MOVE]
};

export class CreepFactory {

  public static buildCreep(type: CreepType, maxCost: number) {
    const body = [...STANDARD_CREEP[type]];

    let creepCost = CreepFactory.bodyCost(body);
    let idx = 0;

    while (creepCost <= maxCost) {
      const nextPart = EXTANDED_CREEP[type][idx];

      if (!nextPart) {
        break;
      }

      const nextPartCost = PART_COST[nextPart];
      if (nextPartCost + creepCost > maxCost) {
        break;
      }

      creepCost += nextPartCost;
      body.push(nextPart);
    }

    return {
      body: body,
      cost: creepCost,
    };
  }

  private static bodyCost(body: BodyPartConstant[]) {
    return body.reduce((prev, bodyPart) => {
      return prev + PART_COST[bodyPart];
    }, 0);
  }

}
