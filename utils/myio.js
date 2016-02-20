var _io;
module.exports = {
  set : function(io){
    _io = io;
  },
  get : function(){
    return _io;
  },
  emit : function(key, value){
    _io.sockets.emit(key, value);
  }
};
