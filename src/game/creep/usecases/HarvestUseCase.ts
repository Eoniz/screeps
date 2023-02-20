import {ResourcesService} from "../services/ResourcesService";

export class HarvestUseCase {

  constructor(
    private readonly _resourcesService: ResourcesService,
  ) {
  }

  public execute(creep: Creep) {
    this._resourcesService.harvest(creep);
  }

}
