import { Hotel } from "./Hotel";
import { Command, getCommandsFromFileName } from "./readfile";

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
