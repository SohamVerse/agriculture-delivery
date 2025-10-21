import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages"
import { BaseChatMessageHistory } from "@langchain/core/chat_history"
import clientPromise from "@/lib/mongodb"
import { ChatSession, ChatMessage } from "@/lib/types/chatbot"

export class MongoDBChatMessageHistory extends BaseChatMessageHistory {
  lc_namespace = ["langchain", "stores", "message", "mongodb"]

  private userId: string
  private chatId: string

  constructor(userId: string, chatId: string) {
    super()
    this.userId = userId
    this.chatId = chatId
  }

  async getMessages(): Promise<BaseMessage[]> {
    const client = await clientPromise
    const db = client.db("agridelivery")

    const session = await db.collection<ChatSession>("chat_sessions").findOne({
      user_id: this.userId,
      chat_id: this.chatId,
    })

    if (!session || !session.messages) {
      return []
    }

    return session.messages.map((msg: ChatMessage) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content)
      } else {
        return new AIMessage(msg.content)
      }
    })
  }

  async addMessage(message: BaseMessage): Promise<void> {
    const client = await clientPromise
    const db = client.db("agridelivery")

    const chatMessage: ChatMessage = {
      role: message._getType() === "human" ? "user" : "assistant",
      content: message.content as string,
      timestamp: new Date(),
    }

    await db.collection<ChatSession>("chat_sessions").updateOne(
      {
        user_id: this.userId,
        chat_id: this.chatId,
      },
      {
        $push: { messages: chatMessage as any },
        $set: { updatedAt: new Date() },
        $setOnInsert: {
          user_id: this.userId,
          chat_id: this.chatId,
          title: "New Chat",
          createdAt: new Date(),
          cart: [],
        },
      },
      { upsert: true },
    )
  }

  async clear(): Promise<void> {
    const client = await clientPromise
    const db = client.db("agridelivery")

    await db.collection<ChatSession>("chat_sessions").updateOne(
      {
        user_id: this.userId,
        chat_id: this.chatId,
      },
      {
        $set: { messages: [], updatedAt: new Date() },
      },
    )
  }

  async addUserMessage(message: string): Promise<void> {
    await this.addMessage(new HumanMessage(message))
  }

  async addAIMessage(message: string): Promise<void> {
    await this.addMessage(new AIMessage(message))
  }
}

export async function getChatSession(userId: string, chatId: string): Promise<ChatSession | null> {
  const client = await clientPromise
  const db = client.db("agridelivery")

  const session = await db.collection<ChatSession>("chat_sessions").findOne({
    user_id: userId,
    chat_id: chatId,
  })

  return session
}

export async function getAllChatSessions(userId: string): Promise<ChatSession[]> {
  const client = await clientPromise
  const db = client.db("agridelivery")

  const sessions = await db
    .collection<ChatSession>("chat_sessions")
    .find({ user_id: userId })
    .sort({ updatedAt: -1 })
    .toArray()

  return sessions
}

export async function updateChatTitle(userId: string, chatId: string, title: string): Promise<void> {
  const client = await clientPromise
  const db = client.db("agridelivery")

  await db.collection<ChatSession>("chat_sessions").updateOne(
    {
      user_id: userId,
      chat_id: chatId,
    },
    {
      $set: { title, updatedAt: new Date() },
    },
  )
}

