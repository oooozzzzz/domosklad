import { CloseVectorNode } from "@langchain/community/vectorstores/closevector/node";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { SqliteSaver } from "@langchain/langgraph-checkpoint-sqlite";
import { HumanMessage } from "@langchain/core/messages";
import sqlite3 from "sqlite3";

export const execute = async (db, sql, params = []) => {
	if (params && params.length > 0) {
		return new Promise((resolve, reject) => {
			db.run(sql, params, (err) => {
				if (err) reject(err);
				resolve();
			});
		});
	}
	return new Promise((resolve, reject) => {
		db.exec(sql, (err) => {
			if (err) reject(err);
			resolve();
		});
	});
};

export class RAG {
	#llm;
	#retriever;
	constructor(
		{ llm = new LLM() } = {
			llm: new LLM(),
		},
	) {
		this.#llm = llm;

		// TODO: убрать ретривер
	}
}

export class LLM {
	constructor(
		{
			temperature = 0,
			modelName = "gpt-4o-mini",
			baseURL = "https://api.proxyapi.ru/openai/v1/",
			apiKey,
		} = {
			temperature: 0,
			modelName: "gpt-4o-mini",
			baseURL: "https://api.proxyapi.ru/openai/v1/",
		},
	) {
		this.model = new ChatOpenAI({
			configuration: { baseURL: baseURL },
			modelName: modelName,
			temperature: temperature,
			apiKey: apiKey,
			//... other options if needed
		});
	}
}

export class Retriever {
	#vectoreStore;
	#embeddings;
	#loader;
	#splitter;
	constructor(
		{
			embeddings = new OpenAIEmbeddings({
				configuration: { baseURL: "https://api.proxyapi.ru/openai/v1/" },
			}),
			loader = new TextLoader("./text.txt"),
			splitter = new RecursiveCharacterTextSplitter(),
		} = {
			embeddings: new OpenAIEmbeddings({
				configuration: { baseURL: "https://api.proxyapi.ru/openai/v1/" },
			}),
			loader: new TextLoader("./text.txt"),
			splitter: new RecursiveCharacterTextSplitter(),
		},
	) {
		this.#embeddings = embeddings;
		this.#loader = loader;
		this.#splitter = splitter;
	}

	async #loadVectoreStore() {
		const docs = await this.#loader.load();
		const allSplits = await this.#splitter.splitDocuments(docs);
		const vectorStore = await CloseVectorNode.fromDocuments(
			allSplits,
			this.#embeddings,
		);
		const directory = "./store/";
		await vectorStore.save(directory);
		const loadedVectorStore = await CloseVectorNode.load(
			directory,
			this.#embeddings,
		);
		this.#vectoreStore = loadedVectorStore;
	}

	async #createRetriever(params = 3) {
		const vectorStore = await this.#vectoreStore;
		this.retriever = vectorStore.asRetriever(params);
	}

	async init(params = 3) {
		await this.#loadVectoreStore();
		await this.#createRetriever(params);
		return this.retriever;
	}

	async invoke(params) {
		return await this.retriever.invoke(params);
	}
}

export class Graph {
	constructor(
		{
			checkpointer = SqliteSaver.fromConnString(
				"./checkpointer/checkpoints.db",
			),
			workflow,
		} = {
			checkpointer: SqliteSaver.fromConnString("./checkpointer/checkpoints.db"),
		},
	) {
		this.workflow = workflow;
		this.checkpointer = checkpointer;
	}
	init() {
		this.app = this.workflow.compile({ checkpointer: this.checkpointer });
		return this;
	}
	async ask(input, thread) {
		const finalState = await this.app.invoke(
			{ messages: [new HumanMessage(input)] },
			{ configurable: { thread_id: thread } },
		);

		return finalState.messages[finalState.messages.length - 1].content;
	}
	async clearMessageHistory(thread_id) {
		const db = new sqlite3.Database(
			"./checkpointer/checkpoints.db",
			sqlite3.OPEN_READWRITE,
		);
		const sql = `DELETE FROM checkpoints WHERE thread_id = '${thread_id}'`;
		try {
			await execute(db, sql);
		} catch (err) {
			console.log(err);
		} finally {
			db.close();
		}
	}
}
