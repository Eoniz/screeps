import {Empire} from "./Empire";
import {RoomUtils} from "../utils/RoomUtils";

export class Colony {

  private readonly _empire: Empire;

  private readonly _coreRoom!: Room;
  private readonly _rooms!: Array<Room>;
  private readonly _sources!: Record<string, Source>;

  constructor(
    coreRoom: string,
    empire: Empire,
  ) {
    this._empire = empire;

    if (RoomUtils.isRoomVisible(coreRoom)) {
      this._coreRoom = Game.rooms[coreRoom];
      this._rooms = [this._coreRoom];
      this._sources = {};
    } else {
      console.log(`[Colony] Colony ${coreRoom} canno't be build --> room does not exist`);
    }

    this.findSources();
    this.updateSourcesInMemory();
  }

  private findSources() {
    this._coreRoom.find(FIND_SOURCES)
      .forEach((source) => {
        this._sources[source.id] = source;
      });
  }

  private updateSourcesInMemory() {
    // if (!Memory.kernel.colonies[this._coreRoom.name].sources) {
    //   Memory.kernel.colonies[this._coreRoom.name].sources = {};
    // }
  }

}
