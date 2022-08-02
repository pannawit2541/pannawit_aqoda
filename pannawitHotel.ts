const fs = require("fs");

class Command {
  name: string;
  params: Array<string>;
  constructor(name, params) {
    this.name = name;
    this.params = params;
  }
}

function getCommandsFromFileName(fileName) {
  const file = fs.readFileSync(fileName, "utf-8");

  return file
    .split("\n")
    .map((line) => line.split(" "))
    .map(
      ([commandName, ...params]) =>
        new Command(
          commandName,
          params.map((param) => {
            const parsedParam = parseInt(param, 10);

            return Number.isNaN(parsedParam) ? param : parsedParam;
          })
        )
    );
}

class Customer {
  private name: string;
  private age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  public getName = () => this.name;

  public getAge = () => this.age;
}

class Room {
  private roomNumber: number;
  private isBooked: boolean;
  private booker: Customer | undefined;
  private keycard: Keycard | undefined;

  constructor(roomNumber: number) {
    this.roomNumber = roomNumber;
    this.isBooked = false;
  }

  public getIsBook = () => this.isBooked;

  public getRoomNumber = () => this.roomNumber;

  public getKeycard = () => this.keycard;

  public book = (customer: Customer, keycard: Keycard) => {
    if (!this.isBooked) {
      this.isBooked = true;
      this.booker = customer;
      this.keycard = keycard;
    }
    return this.isBooked;
  };

  public getCustomer = () => this.booker;

  public checkout = () => {
    this.booker = undefined;
    this.isBooked = false;
    this.keycard.disuse();
    this.keycard = undefined;
  };
}

class Keycard {
  private keycardNumber: number;
  private roomNumber: number | undefined;

  constructor(keycardNumber: number) {
    this.keycardNumber = keycardNumber;
  }

  public checkAvailable = () => !this.roomNumber;

  public getKeycardNumber = () => this.keycardNumber;

  public use = (roomNumber: number) => (this.roomNumber = roomNumber);

  public disuse = () => (this.roomNumber = undefined);
}

class Hotel {
  private rooms: Room[];
  private customers: Customer[];
  private keycards: Keycard[];

  public createRooms = (numFloor: number, roomPerFloor: number) => {
    const totalRoom = [...Array(roomPerFloor + 1).keys()].slice(1); // ? do not collect room zero
    const totalFloor = [...Array(numFloor + 1).keys()].slice(1).map((f: number) => f * 100);
    const allRooms = totalFloor.map((f: number) => totalRoom.map((r: number) => f + r)).flat();

    const allKeycards = [...Array(allRooms.length + 1).keys()].slice(1);

    this.rooms = allRooms.map((fr: number) => {
      return new Room(fr);
    });

    this.keycards = allKeycards.map((keycardNumber: number) => {
      return new Keycard(keycardNumber);
    });

    this.customers = [];

    console.log(`Hotel created with ${numFloor} floor(s), ${roomPerFloor} room(s) per floor.`);
  };

  public getAvailableRooms = () => {
    const availableRooms = this.rooms.filter((r) => !r.getIsBook());
    const list_rooms = availableRooms.map((room) => room.getRoomNumber());

    return list_rooms;
  };

  private getRoomByFloor = (floorNumber: number) => {
    const floorConvert = floorNumber * 100;

    return this.rooms.filter((r) => r.getRoomNumber() >= floorConvert && r.getRoomNumber() < floorConvert + 100);
  };

  public getCustomer = () => this.customers.map((c) => c.getName());

  public getCustomerByRoomNumber = (roomNumber: number) => this.rooms.find((r) => r.getRoomNumber() === roomNumber);

  public getCustomerByAge = (condition: string, age: number) => {
    let customerList: Customer[] = [];
    switch (condition) {
      case ">":
        customerList = this.customers.filter((c) => c.getAge() > age);
      case ">=":
        customerList = this.customers.filter((c) => c.getAge() >= age);
      case "<":
        customerList = this.customers.filter((c) => c.getAge() < age);
      case "<=":
        customerList = this.customers.filter((c) => c.getAge() <= age);
    }
    return customerList.map((c) => c.getName());
  };

  public getCustomerByFloor = (floorNumber: number) => {
    let rooms = this.getRoomByFloor(floorNumber);

    rooms = rooms.filter((r) => r.getIsBook());

    const customerList = rooms.map((r) => r.getCustomer());
    return customerList.map((c) => c.getName());
  };

  public bookingByRoom = (roomNumber: number, customerName: string, customerAge) => {
    let customer = new Customer(customerName, customerAge);
    let room = this.rooms.find((r) => r.getRoomNumber() === roomNumber);
    let keycard = this.keycards.find((keycard) => keycard.checkAvailable() === true);

    if (room.getIsBook()) {
      const customer = room.getCustomer();
      console.log(`Cannot book room ${roomNumber} for ${customer.getName()}, The room is currently booked by ${customer.getName()}.`);
      return;
    }

    keycard.use(roomNumber);
    room.book(customer, keycard);
    if (!this.customers.some((c) => c.getName() === customer.getName())) {
      this.customers = [...this.customers, customer];
    }

    console.log(`Room ${room.getRoomNumber()} is booked by ${customer.getName()} with keycard number ${keycard.getKeycardNumber()}.`);
  };

  public bookingByFloor = (floorNumber: number, customerName: string) => {
    let rooms = this.getRoomByFloor(floorNumber);

    rooms = rooms.filter((r) => !r.getIsBook());
    let roomNumberList = [];
    let keycardNumberList = [];
    if (rooms.length > 0) {
      rooms.forEach((r) => {
        let customer = this.customers.find((c) => c.getName() == customerName);
        let keycard = this.keycards.find((keycard) => keycard.checkAvailable() === true);
        keycard.use(r.getRoomNumber());
        r.book(customer, keycard);
        keycardNumberList = [...keycardNumberList, keycard.getKeycardNumber()];
        roomNumberList = [...roomNumberList, r.getRoomNumber()];
      });
      console.log(`Room ${roomNumberList} are booked with keycard number ${keycardNumberList}`);
      return;
    }
    console.log(`Cannot book floor ${floorNumber} for ${customerName}.`);
  };

  public checkoutByKeycard = (customerName: string, keycardNumber: number) => {
    const room = this.rooms.find((r) => {
      const keycard = r.getKeycard();
      if (keycard && keycard.getKeycardNumber() === keycardNumber) return r;
    });

    if (room.getCustomer().getName() === customerName) {
      room.checkout();
      this.customers = this.customers.filter((c) => c.getName() !== customerName);
      console.log(`Room ${room.getRoomNumber()} is checkout.`);
    } else {
      console.log(`Only Thor can checkout with keycard number ${keycardNumber}.`);
    }
  };

  public checkoutByFloor = (floorNumber: number) => {
    let rooms = this.getRoomByFloor(floorNumber);

    rooms = rooms.filter((r) => r.getIsBook());

    const roomNumberList = rooms.map((r) => {
      r.checkout();
      return r.getRoomNumber();
    });

    console.log(`Room ${roomNumberList} are checkout.`);
  };
}

const filename = "input.txt";
const commands: Command[] = getCommandsFromFileName(filename);
const hotel = new Hotel();

commands.forEach((command) => {
  switch (command.name) {
    case "create_hotel":
      const [floor, roomPerFloor] = command.params;

      hotel.createRooms(parseInt(floor), parseInt(roomPerFloor));

      return;

    case "list_available_rooms":
      console.log(hotel.getAvailableRooms());

      return;

    case "book":
      const [room, customerName, customerAge] = command.params;

      hotel.bookingByRoom(parseInt(room), customerName, parseInt(customerAge));

      return;

    case "checkout":
      const [keycardNumber, customerNameCheckout] = command.params;

      hotel.checkoutByKeycard(customerNameCheckout, parseInt(keycardNumber));

      return;

    case "list_guest":
      console.log(`${hotel.getCustomer()}`);

      return;

    case "get_guest_in_room":
      const [roomNumber] = command.params;

      const customer = hotel.getCustomerByRoomNumber(parseInt(roomNumber));

      console.log(customer.getCustomer().getName());

      return;

    case "list_guest_by_age":
      const [condition, age] = command.params;

      console.log(`${hotel.getCustomerByAge(condition, parseInt(age))}`);

      return;

    case "list_guest_by_floor":
      const [floorNumber] = command.params;

      console.log(`${hotel.getCustomerByFloor(parseInt(floorNumber))}`);

    case "checkout_guest_by_floor":
      const [floorNumber2] = command.params;

      hotel.checkoutByFloor(parseInt(floorNumber2));
      return;

    case "book_by_floor":
      const [floorNumber3, customerName2] = command.params;

      hotel.bookingByFloor(parseInt(floorNumber3), customerName2);

      return;

    default:
      return;
  }
});
