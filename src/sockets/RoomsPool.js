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
      const { robot } = room;
      const isUserIdMatching = robot.owner.id === user.id;
      const isUsersInstititionMatching = robot.owner.id === user.institution;
      if (isUserIdMatching && robot.owner.type === 'User') {
        availableRooms.push(room);
      } else if (isUsersInstititionMatching && robot.owner.type === 'Institution') {
        availableRooms.push(room);
      }
    }
    return availableRooms;
  }

  findUsersRoom = user => this.rooms.find(room => room.user.id === user.id);

  findRobotsRoom = robot => this.rooms.find(room => room.robot.id === robot.id);

  removeRoomById = id => this.rooms.filter(room => room.id !== id);

}
