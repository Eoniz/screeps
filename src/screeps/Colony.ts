import {Empire} from "./Empire";
import {RoomUtils} from "../utils/RoomUtils";
import {CreepType} from "../factories/CreepFactory";

export class Colony {

  private readonly _empire: Empire;

  private readonly _coreRoom!: Room;
  private readonly _rooms!: Array<Room>;
  private readonly _sources!: Record<string, Source>;
  private readonly _spawners!: Array<StructureSpawn>;
  private readonly _spawnQueue!: Array<SerializedCreepToSpawn>;

  constructor(
    coreRoom: string,
    empire: Empire,
  ) {
    this._empire = empire;

    if (RoomUtils.isRoomVisible(coreRoom)) {
      this._coreRoom = Game.rooms[coreRoom];
      this._rooms = [this._coreRoom];
      this._sources = {};
      this._spawners = [];
      this._spawnQueue = [];
    } else {
      console.log(`[Colony] Colony ${coreRoom} canno't be build --> room does not exist`);
      throw new Error(`[Colony] Colony ${coreRoom} canno't be build --> room does not exist`);
    }

    this.initialize();
  }

  public inEachRoom(cb: (room: Room) => void) {
    this._rooms.forEach(cb);
  }

  public addRoom(roomName: string) {
    if (!Memory.kernel.colonies[this._coreRoom.name]) {
      return;
    }

    if (RoomUtils.isRoomVisible(roomName)) {
      const room = Game.rooms[roomName];
      Memory.kernel.colonies[this._coreRoom.name].rooms.push(room);
      this._rooms.push(room);
    }
  }

  public spawnCreep(creepType: CreepType, meta: Record<string, unknown> = {}, priority: number = 1) {
    const creenToSpawn = {
      meta: meta,
      type: creepType,
      priority: priority,
    } satisfies SerializedCreepToSpawn;

    this._spawnQueue.push(creenToSpawn);
    Memory.kernel.colonies[this._coreRoom.name].spawnQueue.push(creenToSpawn);

    return creenToSpawn;
  }

  public getNextCreepToSpawn() {
    if (!this._spawnQueue.length) {
      return null;
    }

    return (
      [...this._spawnQueue]
        .sort((a, b) => b.priority - a.priority)[0]
    );
  }

  public removeFirstCreepFromSpawnQueue() {
    const removedCreep = this._spawnQueue.pop() ?? null;
    Memory.kernel.colonies[this._coreRoom.name].spawnQueue = this._spawnQueue;
    return removedCreep;
  }

  private initialize() {
    if (!Memory.kernel.colonies[this._coreRoom.name]) {
      this.findSources();
      this.findSpawners();
      this.updateKernelMemory();

      return;
    }

    this.loadSpawnQueueFromKernelMemory();
    this.loadSourcesFromKernelMemory();
    this.findSpawners();
  }

  private loadSpawnQueueFromKernelMemory() {
    Memory.kernel.colonies[this._coreRoom.name].spawnQueue
      .forEach((_creepToSpawn) => {
        this._spawnQueue.push({..._creepToSpawn});
      });
  }

  private findSpawners() {
    const spawners = this._coreRoom.find(FIND_MY_SPAWNS);

    spawners.forEach((_spawner) => {
      this._spawners.push(_spawner);
    });
  }

  private loadSourcesFromKernelMemory() {
    if (!Memory.kernel.colonies[this._coreRoom.name]) {
      return;
    }

    Object.values(Memory.kernel.colonies[this._coreRoom.name].sources)
      .forEach((serializedSource) => {
        const source = Game.getObjectById<Source>(<Id<Source>> serializedSource.id);
        if (!source) {
          return;
        }

        this._sources[source.id] = source;
      });
  }

  private updateKernelMemory() {
    Memory.kernel.colonies[this._coreRoom.name] = {
      rooms: [RoomUtils.serializedRoom(this._coreRoom)],
      sources: this.serializedSources(),
      spawnQueue: this._spawnQueue,
      sourceContainers: Memory.kernel.colonies[this._coreRoom.name]?.sourceContainers ?? {},
    }
  }

  private serializedSources(): Record<string, SerializedSource> {
    return (
      Object.values(this._sources)
        .reduce((prev, curr) => ({
          ...prev,
          [curr.id]: {
            id: curr.id,
            energy: curr.energy,
            energyCapacity: curr.energyCapacity,
          }
        }), {})
    );
  }

  private findSources() {
    this._coreRoom.find(FIND_SOURCES)
      .forEach((source) => {
        this._sources[source.id] = source;
      });
  }

  public hasRoom(roomName: string) {
    return Boolean(this._rooms.find((_room) => _room.name === roomName));
  }

  public get coreRoom() {
    return this._coreRoom;
  }

  public get spawners() {
    return this._spawners;
  }

  public source(sourceId: string): Source {
    return this._sources[sourceId];
  }

  public sourceContainer(sourceId: string): StructureContainer | null {
    if (Memory.kernel.colonies[this.coreRoom.name].sourceContainers[sourceId]) {
      const serializedContainer = Memory.kernel.colonies[this.coreRoom.name].sourceContainers[sourceId];
      const container = Game.getObjectById<StructureContainer>(<Id<StructureContainer>> serializedContainer.id);

      if (container) {
        return container;
      }

      delete Memory.kernel.colonies[this.coreRoom.name].sourceContainers[sourceId];
    }

    const source = this.source(sourceId);
    if (!source) {
      return null;
    }

    const containers = source.room.find(
      FIND_STRUCTURES,
      {
        filter: (structure) => {
          return structure.structureType === STRUCTURE_CONTAINER
        }
      }
    );

    for (const container of containers) {
      const sourcesNearContainer = container.pos.findInRange(FIND_SOURCES, 1);

      if (sourcesNearContainer.length) {
        const containerSource = sourcesNearContainer[0];
        Memory.kernel.colonies[this.coreRoom.name].sourceContainers[sourceId] = {
          sourceId: containerSource.id,
          id: containerSource.id
        };

        return <StructureContainer> container;
      }
    }

    return null;
  }

  public get sources() {
    return Object.values(this._sources);
  }
}
