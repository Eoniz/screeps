import {Colony} from "./Colony";
import {RoomUtils} from "../utils/RoomUtils";

export class Empire {

  constructor() {
    if (!Memory.kernel.colonies) {
      Memory.kernel.colonies = {};
    }

    Object.values(Game.rooms)
      .filter(RoomUtils.isMyRoom)
      .forEach((room) => {
        Memory.kernel.colonies[room.name] = new Colony(room.name, this);
      })
  }

}
