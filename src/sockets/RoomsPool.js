export default class RoomsPool {

  rooms = [];

  createRoom = (room) => {
    this.rooms.push(room);
  }

  getRoomByName = (name) => {
    for (const room of this.rooms) {
      if (room.name === name) return room;
    }
    return undefined;
  }

  getAvailableRooms = (user) => {
    const availableRooms = [];
    for (const room of this.rooms) {
      if (room.robot && room.robot.owners) {
        for (const owner of room.robot.owners) {
          // is user's robot
          const isUsrs = owner.id === user.id && owner.type === 'User';
          // or is it institution's that user is part of
          const isInsts = owner.id === user.institution && owner.type === 'Institution';
          if (isUsrs || isInsts) {
            availableRooms.push(room);
            break;
          }
        }
      }
    }
    return availableRooms;
  }

  findUsersRoom = user => this.rooms.find(room => room.user && room.user.id === user.id);

  findRobotsRoom = robot => this.rooms.find(room => room.robot && room.robot.id === robot.id);

  removeRoomById = id => this.rooms.filter(room => room.id !== id);

}
