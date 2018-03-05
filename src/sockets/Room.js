import uuidv4 from 'uuid/v4';

export default class Room {

  constructor(name) {
    this.name = name;
    this.robot = null;
    this.user = null;
    this.id = uuidv4();
  }

  joinRobot = (robot) => {
    this.robot = robot;
  }

  leaveRobot = () => {
    this.robot = null;
  }

  joinUser = (user) => {
    this.user = user;
  }

  leaveUser = () => {
    this.user = null;
  }

  isEmpty = () => this.robot === null && this.user === null;

}
