$(() => {

	let id = String(window.location.pathname.match(/\/chat\/(\d+)$/));
	let socket = io();
	let name = "",
		email = "",
		img = "",
		friend = "";

	let section = $(".section"),
		footer = $("footer"),
		onConnect = $(".connected"),
		inviteSomebody = $(".invite-textfield"),
		personInside = $(".personinside"),
		chatScreen = $(".chatscreen"),
		left = $(".left"),
		noMessages = $(".nomessages"),
		tooManyPeople = $(".toomanypeople");

	let chatNickname = $(".nickname-chat"),
		leftNickname = $(".nickname-left"),
		loginForm = $(".loginForm"),
		yourName = $("#yourName"),
		yourEmail = $("#yourEmail"),
		yourPicture = $("#yourPicture"),
		theirName = $("#theirName"),
		theirEmail = $("#theirEmail"),
		chatForm = $("#chatform"),
		textarea = $("#message"),
		messageTimeSent = $(".timesent"),
		chats = $(".chats");

	let ownerImage = $("#ownerImage"),
		leftImage = $("#leftImage"),
		noMessagesImage = $("#noMessagesImage");

	socket.on('connect', () => {
		socket.emit('load', id);
	})

	socket.on('img', data => {
		img = data;
	})

	socket.on('peopleinchat', data => {
		if(data.number === 0){
			showMessage("connected");
			loginForm.on('submit', event => {
				event.preventDefault();
				name = $.trim(yourName.val());
				email = yourEmail.val();

				if(!isValid(email)) {
					alert("Please enter a valid email!");
				}
				else {
					showMessage("inviteSomebody");
					socket.emit('login', {user: name, avatar: email, id: id});
				}

			});
		}
		else if(data.number === 1) {
			showMessage("personinchat",data);

			loginForm.on('submit', event => {
				event.preventDefault();

				name = $.trim(theirName.val());
				if (name == data.user){
					alert("There already is a \"" + name + "\" in this room!");
					return;
				} else {
					socket.emit('login', {user: name, avatar: email, id: id});
				}
			});
		}
		else {
			showMessage("tooManyPeople");
		}
	})

	socket.on('startChat', (data) => {
		console.log(data);
		if(data.boolean && data.id == id) {
			chats.empty();
			name === data.users[0] ? showMessage("youStartedChatWithNoMessages",data) : showMessage("heStartedChatWithNoMessages",data)
			chatNickname.text(friend);
		}
	});

	socket.on('leave',(data) => {
		if(data.boolean && id==data.room){
			showMessage("somebodyLeft", data);
			chats.empty();
		}
	});

	socket.on('tooMany', (data) => {
		if(data.boolean && name.length === 0) {
			showMessage('tooManyPeople');
		}
	});

	socket.on('receive', (data) => {
		showMessage('chatStarted');
		if(data.msg.trim().length) {
			createChatMessage(data.msg, data.user, data.img, moment());
			scrollToBottom();
		}
	});
	textarea.keypress( event => {
		if(event.which == 13) {
			event.preventDefault();
			chatForm.trigger('submit');
		}
	});

	chatForm.on('submit', event => {
		event.preventDefault();
		showMessage("chatStarted");

		if(textarea.val().trim().length) {
			createChatMessage(textarea.val(), name, img, moment());
			scrollToBottom();
			socket.emit('msg', {msg: textarea.val(), user: name, img: img});
		}
		textarea.val("");
	});

	setInterval(function(){

		messageTimeSent.each(function(){
			var each = moment($(this).data('time'));
			$(this).text(each.fromNow());
		});

	},60000);

	function createChatMessage(msg,user,img, now){

		var who = '';

		if(user===name) {
			who = 'me';
		}
		else {
			who = 'you';
		}

		var li = $(
			'<li class=' + who + '>'+
				'<div class="image">' +
					'<img src=' + img + ' />' +
					'<b></b>' +
					'<i class="timesent" data-time=' + now + '></i> ' +
				'</div>' +
				'<p></p>' +
			'</li>');

		li.find('p').text(msg);
		li.find('b').text(user);

		chats.append(li);

		messageTimeSent = $(".timesent");
		messageTimeSent.last().text(now.fromNow());
	}

	function scrollToBottom(){
		$("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
	}

	function isValid(thatemail) {

		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(thatemail);
	}

	function showMessage(status,data){

		if(status === "connected"){

			section.children().css('display', 'none');
			onConnect.fadeIn(1200);
		}

		else if(status === "inviteSomebody"){

			// Set the invite link content
			$("#link").text(window.location.href);

			onConnect.fadeOut(1200, function(){
				inviteSomebody.fadeIn(1200);
			});
		}

		else if(status === "personinchat"){

			onConnect.css("display", "none");
			personInside.fadeIn(1200);

			chatNickname.text(data.user);
			ownerImage.attr("src",data.avatar);
		}

		else if(status === "youStartedChatWithNoMessages") {

			left.fadeOut(1200, function() {
				inviteSomebody.fadeOut(1200,function(){
					noMessages.fadeIn(1200);
					footer.fadeIn(1200);
				});
			});

			friend = data.users[1];
			noMessagesImage.attr("src",data.avatars[1]);
		}

		else if(status === "heStartedChatWithNoMessages") {

			personInside.fadeOut(1200,function(){
				noMessages.fadeIn(1200);
				footer.fadeIn(1200);
			});

			friend = data.users[0];
			noMessagesImage.attr("src",data.avatars[0]);
		}

		else if(status === "chatStarted"){

			section.children().css('display','none');
			chatScreen.css('display','block');
		}

		else if(status === "somebodyLeft"){

			leftImage.attr("src",data.avatar);
			leftNickname.text(data.user);

			section.children().css('display','none');
			footer.css('display', 'none');
			left.fadeIn(1200);
		}

		else if(status === "tooManyPeople") {

			section.children().css('display', 'none');
			tooManyPeople.fadeIn(1200);
		}
	}

});
