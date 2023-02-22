import {Colony} from "./Colony";
import {RoomUtils} from "../utils/RoomUtils";

export class Empire {

  private colonies: Record<string, Colony> = {};

  constructor() {
    if (!Memory.kernel.colonies) {
      Memory.kernel.colonies = {};
    }

    Object.values(Game.rooms)
      .filter(RoomUtils.isMyRoom)
      .forEach((room) => {
        this.colonies[room.name] = new Colony(room.name, this);
      });
  }

  public hasColony(roomName: string) {
    return Boolean(this.colonies[roomName]);
  }

  public getColony(roomName: string) {
    if (this.colonies[roomName]) {
      return this.colonies[roomName];
    }

    for (const colony of Object.values(this.colonies)) {
      if (colony.hasRoom(roomName)) {
        return colony;
      }
    }

    return null;
  }

}
