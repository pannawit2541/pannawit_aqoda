var fs = require("fs");
var Command = /** @class */ (function () {
    function Command(name, params) {
        this.name = name;
        this.params = params;
    }
    return Command;
}());
function main() {
    var filename = "input.txt";
    var commands = getCommandsFromFileName(filename);
    commands.forEach(function (command) {
        switch (command.name) {
            case "create_hotel":
                var _a = command.params, floor = _a[0], roomPerFloor = _a[1];
                var hotel = { floor: floor, roomPerFloor: roomPerFloor };
                console.log("Hotel created with ".concat(floor, " floor(s), ").concat(roomPerFloor, " room(s) per floor."));
                return;
            default:
                return;
        }
    });
}
function getCommandsFromFileName(fileName) {
    var file = fs.readFileSync(fileName, "utf-8");
    return file
        .split("\n")
        .map(function (line) { return line.split(" "); })
        .map(function (_a) {
        var commandName = _a[0], params = _a.slice(1);
        return new Command(commandName, params.map(function (param) {
            var parsedParam = parseInt(param, 10);
            return Number.isNaN(parsedParam) ? param : parsedParam;
        }));
    });
}
main();
