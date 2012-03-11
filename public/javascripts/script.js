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
        this.keys = {
            65: 'C',
            87: 'Cs',
            83: 'D',
            69: 'Ds',
            68: 'E',
            70: 'F',
            84: 'Fs',
            71: 'G',
            89: 'Gs',
            72: 'A',
            85: 'As',
            74: 'B'
        };
        this.controlKeys = {
            90: 'octaveDown',
            88: 'octaveUp'
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
            var self = this,
                note, key, code, pressed = {};

            // Click
            this._el.find('.key').on('mousedown touchstart',function(e){
                e.preventDefault();
                note = $(this).attr('rel');
                noteDown.call(self,note);
            }).on('mouseup touchend',function(e){
                e.preventDefault();
                note = $(this).attr('rel');
                noteUp.call(self,note);
            });

            // Keyboard
            $(window).on('keydown',function(e){
                if ( self.keys[e.keyCode] ) {
                    e.preventDefault();
                    note = self.notes[self.keys[e.keyCode]];
                    key = getKey.call(self,note).addClass('active');
                    if ( pressed[note] !== true ) {
                        pressed[note] = true;
                        noteDown.call(self,note);
                    }
                } else if ( self.controlKeys[e.keyCode] ) {
                    code = self.controlKeys[e.keyCode];
                    if ( code === 'octaveUp' ) {
                        octaveUp.call(self);
                    } else if ( code === 'octaveDown') {
                        octaveDown.call(self);
                    }
                }
            }).on('keyup',function(e){
                if ( self.keys[e.keyCode] ) {
                    e.preventDefault();
                    note = self.notes[self.keys[e.keyCode]];
                    key = getKey.call(self,note).removeClass('active');
                    pressed[note] = false;
                    noteUp.call(self,note);
                }
            });

            // Remote Click
            socket.on('playeddown', function(data){
                getKey.call(self,data.message).addClass('active');
            });

            socket.on('playedup', function(data){
                getKey.call(self,data.message).removeClass('active');
            });
        },
        getKey = function(message) {
            return this._el.find('div[rel="'+message+'"]');
        },
        noteDown = function(note){
            var octavedNote = getNoteInOctave.call(this,note);
            socket.emit('notedown',{message: octavedNote});
        },
        noteUp = function(note){
            var octavedNote = getNoteInOctave.call(this,note);
            socket.emit('noteup',{message: octavedNote});
        },
        getNoteInOctave = function(note){
            var octave = this.octave;
            if ( octave === 0 ) {
                return note;
            } else if ( octave < 0 ) {
                return ~~note + ( 12 * octave );
            } else {
                return ~~note + ( 12 * octave );
            }
        },
        octaveUp = function() {
            if ( this.octave === 4 ) { return; }
            this.octave += 1;
        },
        octaveDown = function() {
            if ( this.octave === -4 ) { return; }
            this.octave -= 1;
        };
        return {
            init: init
        };
    }();

    var keyboard = new KeyBoard($('#keyboard'));

    ////////////


    // send message on click
    $('#controller a').on('click', function(e){
        e.preventDefault();
        socket.emit('controller',{ message: $(this).data('message') });
    });

})(jQuery);