const gravatar = require('gravatar');

module.exports = (app, io) => {
	app.get('/', (req, response) => {
		response.render('home')
	})

	app.get('/create', (request, response) => {
		var id = Math.round((Math.random() * 1000000));
		response.redirect('/chat/'+id);
	})

	app.get('/chat/:id', (request, response) => {
		response.render('chat');
	});

	let chat = io.on('connection', socket => {
		socket.on('load',function(data){
			let room = findClientsSocket(io, data);
			if(room.length === 0 ) {
				socket.emit('peopleinchat', {number: 0});
			}
			else if(room.length === 1) {
				socket.emit('peopleinchat', {
					number: 1,
					user: room[0].username,
					avatar: room[0].avatar,
					id: data
				})
			}
			else if(room.length >= 2) {
				chat.emit('tooMany', {boolean: true})
			}
		})

		socket.on('login', function(data) {
			let room = findClientsSocket(io, data.id)
			if (room.length < 2) {

				socket.username = data.user
				socket.room = data.id
				socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'})

				socket.emit('img', socket.avatar)
				socket.join(data.id)

				if (room.length == 1) {

					let usernames = []
					let avatars = [];

					usernames.push(room[0].username);
					usernames.push(socket.username);

					avatars.push(room[0].avatar);
					avatars.push(socket.avatar);

					chat.in(data.id).emit('startChat', {
						boolean: true,
						id: data.id,
						users: usernames,
						avatars: avatars
					});
				}
			}
			else {
				socket.emit('tooMany', {boolean: true});
			}
		});

		socket.on('disconnect', () => {

			socket.broadcast.to(this.room).emit('leave', {
				boolean: true,
				room: this.room,
				user: this.username,
				avatar: this.avatar
			});

			socket.leave(socket.room);
		});

		socket.on('msg', data => {
			socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
		});
	});
};

function findClientsSocket(io,roomId, namespace) {
	var response = [],
		ns = io.of(namespace ||"/");    // the default namespace is "/"

	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
				var index = ns.connected[id].rooms.indexOf(roomId) ;
				if(index !== -1) {
					response.push(ns.connected[id]);
				}
			}
			else {
				response.push(ns.connected[id]);
			}
		}
	}
	return response;
}
