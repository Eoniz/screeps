import {Controller} from "./Controller";
import {DropResourcesUseCase} from "../usecases/resources/DropResourcesUseCase";
import {HarvestSourceByCreepIdUseCase} from "../usecases/resources/HarvestSourceByCreepIdUseCase";

export class HarvesterController implements Controller {

  constructor(
    private readonly _harvestUseCase: HarvestSourceByCreepIdUseCase,
    private readonly _dropResourcesUseCase: DropResourcesUseCase,
  ) {
  }

  public gameTick(creep: Creep) {
    if (!creep.memory.harvesting && creep.store.energy === 0) {
      creep.memory.harvesting = true;
    }

    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      creep.memory.harvesting = false;
    }

    if (creep.memory.harvesting) {
      this._harvestUseCase.execute(creep);
    } else {
      this._dropResourcesUseCase.execute(creep);
    }
  }

}
