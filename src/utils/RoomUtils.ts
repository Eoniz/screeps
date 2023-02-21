
export class RoomUtils {

  public static isRoomVisible(roomName: string) {
    return roomName in Game.rooms;
  }

  public static isMyRoom(roomName: string | Room) {
    let room: Room;

    if (typeof roomName === "string") {
      if (!RoomUtils.isRoomVisible(roomName)) {
        return false;
      }

      room = Game.rooms[roomName];
    } else {
      room = roomName;
    }

    if (!room.controller) {
      return false;
    }

    return room.controller.my;
  }

}
