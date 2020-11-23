var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;

var clients = [];

function getUsersList() {
	var usersList = [];
	for (var i = 0; i < clients.length; i++) {
		usersList[i] = clients[i].n;
	}
	return usersList;
}

function setUserTyping(index) {
	var usersList = [];
	for (var i = 0; i < clients.length; i++) {
		usersList[i] = clients[i].n;
	}
	usersList[index] = "💬 " + clients[index].n;
	return usersList;
}

app.get("/", function (req, res) {
	res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
	clients.push(socket);

	socket.on("start", function () {
		socket.emit("nick", "guest");
		clients[clients.indexOf(socket)].n = "guest";
		io.emit("users list", getUsersList());
	});

	socket.on("send chat message", function (msg) {
		io.emit("chat message", msg);
	});

	socket.on("set nick", function (nick) {
		io.emit("info", "New user: " + nick);
		clients[clients.indexOf(socket)].n = nick;
		io.emit("users list", getUsersList());
	});

	socket.on("typing", function () {
		io.emit("typing signal", setUserTyping(clients.indexOf(socket)));
	});

	socket.on("not typing", function () {
		io.emit("typing signal", getUsersList());
	});

	socket.on("disconnect", function () {
		if (clients[clients.indexOf(socket)].n == null) {
			console.log("Guest disconnect!");
		} else {
			console.log(clients[clients.indexOf(socket)].n + " disconnect!");
			io.emit(
				"info",
				"User " + clients[clients.indexOf(socket)].n + " disconnected."
			);
		}
	});
});

http.listen(port, function () {
	console.log("listening on *:" + port);
});
