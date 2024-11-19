require('dotenv').config();
import { Server } from "socket.io";
import Redis from "ioredis";
import { produceMessage } from "./kafka";

const pub = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT), // Convert to number
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});
const sub = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT), // Convert to number
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
});

class SocketService {
  private _io: Server;

  constructor() {
    console.log("Init Socket Service...");

    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });

    sub.subscribe("MESSAGES");
  }

  public initListeners() {
    const io = this.io;
    console.log("Init Socket Listeners...");

    io.on("connect", (socket) => {
      console.log("New Socket Connected...", socket.id);
      // Add your listeners here
      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New Message Recevied: ", message);

        await pub.publish("MESSAGES", JSON.stringify({ message }));
      });

      sub.on("message", async (channel, message) => {
        if (channel === "MESSAGES") {
          console.log("New msg from redis", message);

          io.emit("message", message);

         await produceMessage(message);
         console.log("Message Produced to Kafka Broker")
        }
      });
    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
