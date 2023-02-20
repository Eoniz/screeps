import {HarvesterController} from "./controllers/HarvesterController";
import {BuilderController} from "./controllers/BuilderController";
import {UpgraderController} from "./controllers/UpgraderController";
import {ResourcesServiceImpl} from "./services/resources/ResourcesServiceImpl";
import {HarvestNearestSourceUseCase} from "./usecases/resources/HarvestNearestSourceUseCase";
import {DropResourcesUseCase} from "./usecases/resources/DropResourcesUseCase";
import {ControllerServiceImpl} from "./services/controller/ControllerServiceImpl";
import {UpgradeRoomControllerUseCase} from "./usecases/controller/UpgradeRoomControllerUseCase";
import {HarvestSourceByCreepIdUseCase} from "./usecases/resources/HarvestSourceByCreepIdUseCase";
import {BuildingServiceImpl} from "./services/building/BuildingServiceImpl";
import {BuildNearestUseCase} from "./usecases/building/BuildNearestUseCase";

export function provideHarvesterController() {
  const resourcesService = new ResourcesServiceImpl();

  const harvestUseCase = new HarvestSourceByCreepIdUseCase(resourcesService);
  const dropResourcesUseCase = new DropResourcesUseCase(resourcesService);

  return new HarvesterController(
    harvestUseCase,
    dropResourcesUseCase,
  );
}

export function provideBuilderController() {
  const resourcesService = new ResourcesServiceImpl();
  const buildingService = new BuildingServiceImpl();

  const harvestUseCase = new HarvestSourceByCreepIdUseCase(resourcesService);
  const buildNearestUseCase = new BuildNearestUseCase(buildingService);
  const dropResourcesUseCase = new DropResourcesUseCase(resourcesService);

  return new BuilderController(
    harvestUseCase,
    buildNearestUseCase,
    dropResourcesUseCase,
  );
}

export function provideUpgraderController() {
  const resourcesService = new ResourcesServiceImpl();
  const controllerService = new ControllerServiceImpl();

  const harvestUseCase = new HarvestSourceByCreepIdUseCase(resourcesService);
  const upgradeRoomControllerUseCase = new UpgradeRoomControllerUseCase(controllerService);
  const dropResourcesUseCase = new DropResourcesUseCase(resourcesService);

  return new UpgraderController(
    harvestUseCase,
    upgradeRoomControllerUseCase,
    dropResourcesUseCase,
  );
}
