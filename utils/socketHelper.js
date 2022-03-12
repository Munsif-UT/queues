// const BaseHelper = require("./baseHelper");

class SocketHelper {
    constructor() {
      // super();
    }
  
    static init(io) {
      this.io = io;
      this.onConnection = this.onConnection;
      this.onBeginConnection = this.onBeginConnection;
      this.bindEvents;
    }
    bindEvents() {
      this.io.on("connection", this.onConnection);
  
      this.io.use(this.onBeginConnection);
    }
  
    unBindEvents() {
      this.io.off("connection", this.onConnection);
    }
  
    onConnection(socket) {
      socket.on("disconnect", reason => {});
  
      socket.on("chat message", function(msg) {});
    }
  
    static pushNotification(id,payload) {
      try {
        if(this.io){
         console.log(payload,"payload----")
        this.io.emit(
          id+"notification",
          payload
        );
       }
        // this.io.emit(
        //   `notification`,
        //   payload
        // );
      } catch (error) {
        console.error("error", error);
      }
    }
  }
  
export default SocketHelper
  