import {Controller} from "./Controller";
import {BuildNearestUseCase} from "../usecases/building/BuildNearestUseCase";
import {HarvestSourceByCreepIdUseCase} from "../usecases/resources/HarvestSourceByCreepIdUseCase";
import {DropResourcesUseCase} from "../usecases/resources/DropResourcesUseCase";

export class BuilderController implements Controller {

  constructor(
    private readonly _harvestUseCase: HarvestSourceByCreepIdUseCase,
    private readonly _buildNearestUseCase: BuildNearestUseCase,
    private readonly _dropResourcesUseCase: DropResourcesUseCase,
  ) {
  }

  public gameTick(creep: Creep) {
    if (creep.memory.building && creep.store.energy === 0) {
      creep.memory.building = false;
    }

    if (!creep.memory.building && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      creep.memory.building = true;
    }

    if (creep.memory.building) {
      if (!this._buildNearestUseCase.execute(creep)) {
        this._dropResourcesUseCase.execute(creep);
      }
    } else {
      this._harvestUseCase.execute(creep);
    }
  }

}
