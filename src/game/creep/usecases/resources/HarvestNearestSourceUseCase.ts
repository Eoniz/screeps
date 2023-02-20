import {ResourcesService} from "../../services/resources/ResourcesService";

export class HarvestNearestSourceUseCase {

  constructor(
    private readonly _resourcesService: ResourcesService,
  ) {
  }

  public execute(creep: Creep) {
    this._resourcesService.harvestNearestSource(creep);
  }

}
