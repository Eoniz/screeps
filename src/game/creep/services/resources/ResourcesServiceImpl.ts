import {ResourcesService} from "./ResourcesService";

export class ResourcesServiceImpl implements ResourcesService {

  public dropResources(creep: Creep) {
    const targets = creep.room.find(
      FIND_STRUCTURES,
      {
        filter: (structure) => {
          return (
            (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN)
            && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        }
      }
    );

    if (!targets.length) {
      creep.say('🟧 no more structures available');
      return;
    }

    if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } })
    }

  }

  public harvestNearestSource(creep: Creep) {
    const sources = creep.room.find(FIND_SOURCES);
    const sourcesWithEnergy = sources.filter((source) => source.energy > 0);

    if (!sourcesWithEnergy.length) {
      creep.say('🟧 no more sources with energy');
      return;
    }

    if (creep.harvest(sourcesWithEnergy[0]) === ERR_NOT_IN_RANGE) {
      creep.moveTo(sourcesWithEnergy[0], { visualizePathStyle: { stroke: '#ffaa00' } })
    }
  }

  public harvestSourceByCreepId(creep: Creep) {
    if (!creep.memory.id) {
      return this.harvestNearestSource(creep);
    }

    const sources = creep.room.find(FIND_SOURCES);
    const sourcesWithEnergy = sources.filter((source) => source.energy > 0);

    if (!sourcesWithEnergy.length) {
      creep.say('🟧 no more sources with energy');
      return;
    }

    const sourceIdx = creep.memory.id % sourcesWithEnergy.length;
    const source = sources[sourceIdx];

    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } })
    }
  }

}
