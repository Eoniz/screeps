import {ResourcesService} from "../../services/resources/ResourcesService";

export class HarvestSourceByCreepIdUseCase {

  constructor(
    private readonly _resourcesService: ResourcesService,
  ) {
  }

  public execute(creep: Creep) {
    this._resourcesService.harvestSourceByCreepId(creep);
  }

}
