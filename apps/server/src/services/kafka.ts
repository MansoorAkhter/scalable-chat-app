require('dotenv').config();
import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";
import prismaClient from "./prisma";


const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER!], // Assert that it's not undefined
  ssl: {
    ca: [fs.readFileSync(path.resolve(process.env.KAFKA_SSL_CA_PATH!), "utf-8")], // Assert that the path is not undefined
  },
  sasl: {
    username: process.env.KAFKA_SASL_USERNAME!,
    password: process.env.KAFKA_SASL_PASSWORD!,
    mechanism: "plain",
  },
});

let producer: null | Producer = null;

export async function createProducer() {
  if (producer) return producer;

  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}

export async function produceMessage(message: string) {
  const producer = await createProducer();
  await producer.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: "MESSAGES",
  });

  return true;
}

export async function startMessageConsumer() {
  console.log("Consumer is Running...");

  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  await consumer.run({
    autoCommit: true,
    // autoCommitInterval: 5,
    eachMessage: async ({ message, pause }) => {
      console.log("New message recv");
      if (!message.value) return;

      try {
        await prismaClient.message.create({
          data: {
            text: message.value?.toString(),
          },
        });
      } catch (error) {
        console.log("Something is wrong");
        pause();

        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    },
  });
}

export default kafka;
