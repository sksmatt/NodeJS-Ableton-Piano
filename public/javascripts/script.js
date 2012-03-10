(function($){
	// connect to socket.io
	var socket = io.connect('http://localhost');

	////////////

	var KeyBoard = function(el) {
		this._el = el;
		this.octave = 0;
		this.notes = {
			C:  60,
			Cs: 61,
			D:  62,
			Ds: 63,
			E:  64,
			F:  65,
			Fs: 66,
			G:  67,
			Gs: 68,
			A:  69,
			As: 70,
			B:  71
		};
		this.init();
	};
	
	KeyBoard.prototype = function(){
		var init = function(){
			createKeys.call(this);
			bindEvents.call(this);
		},
		createKeys = function(){
			var self = this;
			$.each(this.notes, function(index,item){
				createKey.call(self,index,item);
			});
		},
		createKey = function(note,message){
			var key = $('<div/>').attr('rel',message).addClass(note).addClass('key').appendTo(this._el);
			if ( note.indexOf('s') > 0 ) {
				key.addClass('sharp');
			}
		},
		bindEvents = function(){
			var self = this;

			// Click
			this._el.find('.key').on('mousedown',function(e){
				e.preventDefault();
				var note = $(this).attr('rel');
				socket.emit('notedown',{message: note});
			}).on('mouseup',function(e){
				e.preventDefault();
				var note = $(this).attr('rel');
				socket.emit('noteup',{message: note});
			});

			// Remote Click
			socket.on('played', function(data){
				var note = self._el.find('div[rel="'+data.message+'"]');
				fauxKeyPress.call(self,note);
			});
		},
		fauxKeyPress = function(note) {
			var key = note.css('background','brown');
			setTimeout(function(){
				key.css('background','');
			},100);
		};
		return {
			init: init
		};
	}();

	var piano = new KeyBoard($('#piano'));

	////////////


	// send message on click
	$('#controller a').on('click', function(e){
		e.preventDefault();
		socket.emit('controller',{ message: $(this).data('message') });
	});

})(jQuery);