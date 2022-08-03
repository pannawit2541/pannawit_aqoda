import { Command, getCommandsFromFileName } from "./readfile";

class Room {
  private roomNumber: number;
  private guest: Guest | undefined;
  private keycard: Keycard | undefined;

  constructor(roomNumber: number) {
    this.roomNumber = roomNumber;
  }

  public getGuest = () => this.guest;

  public getKeycard = () => this.keycard;

  public getRoomNumber = () => this.roomNumber;

  public isOwn = (guestName: string, keycardNumber: number) =>
    guestName === this.guest.getName() && keycardNumber === this.keycard.getKeycardNumber();

  public checkAvailable = () => !this.guest;

  public book = (guest: Guest, keycard: Keycard) => {
    this.guest = guest;
    keycard.book(this.roomNumber);
    this.keycard = keycard;
  };

  public checkout = () => {
    this.guest = undefined;
    this.keycard.checkout();
    this.keycard = undefined;
  };
}

class Guest {
  private name: string;
  private age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  public getName = () => this.name;

  public getAge = () => this.age;

  public isSameGuest = (otherGuest: Guest) => {
    if (otherGuest.getName() === this.name && otherGuest.getAge() === this.age) return true;
    false;
  };
}

class Keycard {
  private keycardNumber: number;
  private roomNumber: number | undefined;

  constructor(keycardNumber: number) {
    this.keycardNumber = keycardNumber;
  }

  public getKeycardNumber = () => this.keycardNumber;

  public checkAvailable = () => {
    if (!this.roomNumber) {
      return true;
    }
    return false;
  };

  public book = (roomNumber: number) => {
    this.roomNumber = roomNumber;
  };

  public checkout = () => (this.roomNumber = undefined);
}

class Hotel {
  private rooms: Room[];
  private guests: Guest[];
  private keycards: Keycard[];

  public createRooms = (floorNumber: number, roomPerFloor: number): void => {
    const totalRoom = [...Array(roomPerFloor + 1).keys()].slice(1); // ? do not collect room zero
    const totalFloor = [...Array(floorNumber + 1).keys()].slice(1).map((f: number) => f * 100);
    const allRooms = totalFloor.map((f: number) => totalRoom.map((r: number) => f + r)).flat();

    const allKeycards = [...Array(roomPerFloor * floorNumber + 1).keys()].slice(1);

    this.rooms = allRooms.map((roomNumber: number) => new Room(roomNumber));

    this.keycards = allKeycards.map((keycardNumber: number) => {
      return new Keycard(keycardNumber);
    });

    this.guests = [];
    console.log(`Hotel created with ${floorNumber} floor(s), ${roomPerFloor} room(s) per floor.`);
  };

  public getAvailableRoom = () => {
    const rooms: Room[] = this.rooms.filter((room: Room) => room.checkAvailable());
    console.log(`${rooms.map((room) => room.getRoomNumber())}`);
  };

  public bookByRoom = (roomNumber: number, guestName: string, guestAge: number) => {
    const room: Room = this.rooms.find((r: Room) => r.getRoomNumber() === roomNumber);
    const bookGuest = new Guest(guestName, guestAge);
    if (room.checkAvailable()) {
      const keycard: Keycard = this.book(room, bookGuest);
      console.log(`Room ${room.getRoomNumber()} is booked by ${guestName} with keycard number ${keycard.getKeycardNumber()}.`);
    } else {
      console.log(`Cannot book room ${roomNumber} for ${guestName}, The room is currently booked by ${room.getGuest().getName()}.`);
    }
  };

  public bookByFloor = (floorNumber: number, guestName: string, guestAge: number) => {
    const availableRoom: Room[] = this.rooms.filter((room: Room) => this.getFloorOfRoom(room.getRoomNumber()) === floorNumber);
    const isAllRoomAvailable: boolean = availableRoom.every((room: Room) => room.checkAvailable());

    if (isAllRoomAvailable) {
      const guest: Guest = new Guest(guestName, guestAge);
      availableRoom.forEach((room: Room) => this.book(room, guest));
      console.log(
        `Room ${availableRoom.map((room: Room) => room.getRoomNumber())} are booked with keycard number ${availableRoom.map((room: Room) =>
          room.getKeycard().getKeycardNumber()
        )}`
      );
      return;
    }
    console.log(`Cannot book floor ${floorNumber} for ${guestName}.`);
  };

  public checkoutByKeycard = (keycardNumber: number, guestName: string) => {
    const room: Room = this.rooms.find((room: Room) => room.getKeycard() && room.getKeycard().getKeycardNumber() === keycardNumber);

    if (room.isOwn(guestName, keycardNumber)) {
      room.checkout();
      this.removeGuest(guestName);
      console.log(`Room ${room.getRoomNumber()} is checkout.`);

      return;
    }

    console.log(`Only Thor can checkout with keycard number ${keycardNumber}.`);
  };

  public checkoutByFloor = (floorNumber: number) => {
    const rooms_checkout = this.rooms.filter((r: Room) => {
      const floor: number = this.getFloorOfRoom(r.getRoomNumber());
      if (floorNumber === floor && !r.checkAvailable()) {
        r.checkout();
        return r;
      }
    });
    console.log(`Room ${rooms_checkout.map((room: Room) => room.getRoomNumber())} are checkout.`);
  };

  public getAvailableGuest = () => console.log(`${this.guests.map((guest: Guest) => guest.getName())}`);

  public findGuestByAge = (condition: string, age: number) => {
    let guest: Guest[] = [];
    switch (condition) {
      case ">":
        guest = this.guests.filter((c) => c.getAge() > age);
      case ">=":
        guest = this.guests.filter((c) => c.getAge() >= age);
      case "<":
        guest = this.guests.filter((c) => c.getAge() < age);
      case "<=":
        guest = this.guests.filter((c) => c.getAge() <= age);
    }
    console.log(`${guest.map((c) => c.getName())}`);
  };

  public findGuestByRoom = (roomNumber: number) => {
    const room: Room = this.rooms.find((room: Room) => room.getRoomNumber() === roomNumber);
    console.log(`${room.getGuest().getName()}`);
  };

  public findGuestByFloor = (floorNumber: number) => {
    const rooms: Room[] = this.rooms.filter((room: Room) => !room.checkAvailable() && this.getFloorOfRoom(room.getRoomNumber()) === floorNumber);
    console.log(`${rooms.map((r: Room) => r.getGuest().getName())}`);
  };

  private removeGuest = (guestName: string) => {
    const isBookingRoom: boolean = this.rooms.some((room: Room) => room.getGuest() && room.getGuest().getName() === guestName);

    if (!isBookingRoom) {
      this.guests = this.guests.filter((c) => c.getName() !== guestName);
    }
  };

  private getFloorOfRoom = (roomNumber: number) => Math.floor(roomNumber / 100);

  private book = (room: Room, bookGuest: Guest) => {
    const keycard: Keycard = this.keycards.find((key: Keycard) => key.checkAvailable());
    let guest: Guest = this.guests.find((guest: Guest) => guest.isSameGuest(bookGuest));
    if (!guest) {
      guest = bookGuest;
      this.guests = [...this.guests, guest];
    }
    room.book(guest, keycard);

    return keycard;
  };
}

const main = () => {
  const filename = "input.txt";
  const commands: Command[] = getCommandsFromFileName(filename);

  const PannawitHotel = new Hotel();

  commands.forEach((command) => {
    switch (command.name) {
      case "create_hotel":
        const [floor, roomPerFloor] = command.params;
        PannawitHotel.createRooms(parseInt(floor), parseInt(roomPerFloor));

        return;

      case "list_available_rooms":
        PannawitHotel.getAvailableRoom();
        return;

      case "book":
        const [room, customerName, customerAge] = command.params;

        PannawitHotel.bookByRoom(parseInt(room), customerName, parseInt(customerAge));

        return;

      case "checkout":
        const [keycardNumber, customerNameCheckout] = command.params;

        PannawitHotel.checkoutByKeycard(parseInt(keycardNumber), customerNameCheckout);
        return;

      case "list_guest":
        PannawitHotel.getAvailableGuest();
        return;

      case "get_guest_in_room":
        const [roomNumber] = command.params;
        PannawitHotel.findGuestByRoom(parseInt(roomNumber));
        return;

      case "list_guest_by_age":
        const [condition, age] = command.params;
        PannawitHotel.findGuestByAge(condition, parseInt(age));

        return;

      case "list_guest_by_floor":
        const [floorNumber] = command.params;

        PannawitHotel.findGuestByFloor(parseInt(floorNumber));
        return;

      case "checkout_guest_by_floor":
        const [floorNumber2] = command.params;
        PannawitHotel.checkoutByFloor(parseInt(floorNumber2));
        return;

      case "book_by_floor":
        const [floorNumber3, customerName2, age2] = command.params;
        PannawitHotel.bookByFloor(parseInt(floorNumber3), customerName2, parseInt(age2));
        return;
      default:
        return;
    }
  });
};

main();
