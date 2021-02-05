import {
  IBaselineRPC,
  IBlockchainService,
  IRegistry,
  IVault,
  MerkleTreeNode,
  baselineServiceFactory,
  baselineProviderProvide,
} from "@baseline-protocol/api";
import {
  IMessagingService,
  messagingProviderNats,
  messagingServiceFactory,
} from "@baseline-protocol/messaging";
import {
  IZKSnarkCircuitProvider,
  IZKSnarkCompilationArtifacts,
  IZKSnarkTrustedSetupArtifacts,
  zkSnarkCircuitProviderServiceFactory,
  zkSnarkCircuitProviderServiceZokrates,
  Element,
  elementify,
  rndHex,
  concatenateThenHash,
} from "@baseline-protocol/privacy";
import {
  Message as ProtocolMessage,
  Opcode,
  PayloadType,
  marshalProtocolMessage,
  unmarshalProtocolMessage,
} from "@baseline-protocol/types";
import {
  Application as Workgroup,
  Invite,
  Vault as ProvideVault,
  Organization,
  Token,
  Key as VaultKey,
} from "@provide/types";
import {
  Capabilities,
  Ident,
  NChain,
  Vault,
  capabilitiesFactory,
  nchainClientFactory,
} from "provide-js";
import { readFileSync } from "fs";
import { compile as solidityCompile } from "solc";
import * as jwt from "jsonwebtoken";
import * as log from "loglevel";
import { sha256 } from "js-sha256";
import { AuthService } from "ts-natsutil";
import { ethers as Eth } from "ethers";
import {
  web3provider,
  wallet,
  txManager,
  waitRelayTx,
  deposit,
  getBalance,
} from "../test/utils-comm.js";

import uuid4 from "uuid4";
import * as dv from "dotenv";
import mongoose from "mongoose";

// Testing
import { resolve } from "dns";
import { IdentWrapper } from "../../../bri-2/commit-mgr/src/db/controllers/Ident";
import { NonceManager } from "@ethersproject/experimental";

// const baselineDocumentCircuitPath = '../../../lib/circuits/createAgreement.zok';
const baselineDocumentCircuitPath = "../../../lib/circuits/noopAgreement.zok";
const baselineProtocolMessageSubject = "baseline.inbound";

const zokratesImportResolver = (location, path) => {
  let zokpath = `../../../lib/circuits/${path}`;
  if (!zokpath.match(/\.zok$/i)) {
    zokpath = `${zokpath}.zok`;
  }
  return {
    source: readFileSync(zokpath).toString(),
    location: path,
  };
};

//#region
/*
	fetchAccounts(params) {
					 return clients_1.ApiClient.handleResponse(yield this.client.get('accounts', (params || {})));
		fetchAccountDetails(accountId) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`accounts/${accountId}`, {}));
		fetchAccountBalance(accountId, tokenId) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`accounts/${accountId}/balances/${tokenId}`, {}));
		createAccount(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.post('accounts', params));
		fetchBridges(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get('bridges', (params || {})));
		fetchBridgeDetails(bridgeId) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`bridges/${bridgeId}`, {}));
		createBridge(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.post('bridges', params));
		fetchConnectors(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get('connectors', (params || {})));
		fetchConnectorDetails(connectorId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`connectors/${connectorId}`, (params || {})));
		fetchConnectorLoadBalancers(connectorId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`connectors/${connectorId}/load_balancers`, (params || {})));
		fetchConnectorNodes(connectorId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`connectors/${connectorId}/nodes`, (params || {})));
		createConnector(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.post('connectors', params));
		deleteConnector(connectorId) {
						return clients_1.ApiClient.handleResponse(yield this.client.delete(`connectors/${connectorId}`));
		authorizeConnectorSubscription(connectorId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.post(`connectors/${connectorId}/subscriptions`, params));
		authorizeContractSubscription(contractId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.post(`contracts/${contractId}/subscriptions`, params));
		createConnectedEntity(connectorId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.post(`connectors/${connectorId}/entities`, params));
		fetchConnectedEntities(connectorId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`connectors/${connectorId}/entities`, params));
		fetchConnectedEntityDetails(connectorId, entityId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`connectors/${connectorId}/entities/${entityId}`, (params || {})));
		updateConnectedEntity(connectorId, entityId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.put(`connectors/${connectorId}/entities/${entityId}`, params));
		deleteConnectedEntity(connectorId, entityId) {
						return clients_1.ApiClient.handleResponse(yield this.client.delete(`connectors/${connectorId}/entities/${entityId}`));
		fetchContracts(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get('contracts', (params || {})));
		fetchContractDetails(contractId) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`contracts/${contractId}`, {}));
		createContract(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.post('contracts', params));
		executeContract(contractId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.post(`contracts/${contractId}/execute`, params));
		fetchNetworks(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get('networks', (params || {})));
		createNetwork(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.post('networks', params));
		updateNetwork(networkId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.put(`networks/${networkId}`, params));
		fetchNetworkDetails(networkId) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`networks/${networkId}`, {}));
		fetchNetworkAccounts(networkId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`networks/${networkId}/accounts`, params));
		fetchNetworkBlocks(networkId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`networks/${networkId}/blocks`, params));
		fetchNetworkBridges(networkId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`networks/${networkId}/bridges`, params));
		fetchNetworkConnectors(networkId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`networks/${networkId}/connectors`, params));
		fetchNetworkContracts(networkId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`networks/${networkId}/contracts`, params));
		fetchNetworkContractDetails(networkId, contractId) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`networks/${networkId}/contracts/${contractId}`, {}));
		fetchNetworkOracles(networkId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`networks/${networkId}/oracles`, params));
		fetchNetworkTokenContracts(networkId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`networks/${networkId}/tokens`, params));
		fetchNetworkTransactions(networkId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`networks/${networkId}/transactions`, params));
		fetchNetworkTransactionDetails(networkId, transactionId) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`networks/${networkId}/transactions/${transactionId}`, {}));
		fetchNetworkStatus(networkId) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`networks/${networkId}/status`, {}));
		fetchNetworkNodes(networkId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`networks/${networkId}/nodes`, (params || {})));
		createNetworkNode(networkId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.post(`networks/${networkId}/nodes`, params));
		fetchNetworkNodeDetails(networkId, nodeId) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`networks/${networkId}/nodes/${nodeId}`, {}));
		fetchNetworkNodeLogs(networkId, nodeId, params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`networks/${networkId}/nodes/${nodeId}/logs`, (params || {})));
		deleteNetworkNode(networkId, nodeId) {
						return clients_1.ApiClient.handleResponse(yield this.client.delete(`networks/${networkId}/nodes/${nodeId}`));
		fetchOracles(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get('oracles', (params || {})));
		fetchOracleDetails(oracleId) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`oracles/${oracleId}`, {}));
		createOracle(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.post('oracles', params));
		fetchTokenContracts(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get('tokens', (params || {})));
		fetchTokenContractDetails(tokenId) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`tokens/${tokenId}`, {}));
		createTokenContract(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.post('tokens', params));
		createTransaction(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.post('transactions', params));
		fetchTransactions(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get('transactions', (params || {})));
		fetchTransactionDetails(transactionId) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`transactions/${transactionId}`, {}));
		fetchWallets(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.get('wallets', (params || {})));
		fetchWalletAccounts(walletId) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`wallets/${walletId}/accounts`, {}));
		fetchWalletDetails(walletId) {
						return clients_1.ApiClient.handleResponse(yield this.client.get(`wallets/${walletId}`, {}));
		createWallet(params) {
						return clients_1.ApiClient.handleResponse(yield this.client.post('wallets', params));

						*/
//#endregion

export class ParticipantStack {
  private baseline?: IBaselineRPC & IBlockchainService & IRegistry & IVault;
  private baselineCircuitArtifacts?: IZKSnarkCompilationArtifacts;
  private baselineCircuitSetupArtifacts?: IZKSnarkTrustedSetupArtifacts;
  private baselineConfig?: any;
  private babyJubJub?: VaultKey;
  private hdwallet?: VaultKey;
  private initialized = false;
  private nats?: IMessagingService;
  private natsBearerTokens: { [key: string]: any } = {}; // mapping of third-party participant messaging endpoint => bearer token
  private natsConfig?: any;
  private protocolMessagesRx = 0;
  private protocolMessagesTx = 0;
  private protocolSubscriptions: any[] = [];
  private capabilities?: Capabilities;
  private contracts: any;
  private ganacheContracts: any;
  private zk?: IZKSnarkCircuitProvider;

  private org?: any;
  private workgroup?: any;
  private workgroupCounterparties: string[] = [];
  private workgroupToken?: any; // workgroup bearer token; used for automated setup
  private workflowIdentifier?: string; // workflow identifier; specific to the workgroup
  private workflowRecords: { [key: string]: any } = {}; // in-memory system of record

  private commitAccount: any;
  private commitAccounts: any;
  private commitMgrApiBob: any;
  private commitMgrApiAlice: any;

  private identService: any;
  private identConnection: any;

  constructor(baselineConfig: any, natsConfig: any) {
    this.baselineConfig = baselineConfig;
    this.natsConfig = natsConfig;
  }

  async init() {
    if (this.initialized) {
      throw new Error(
        `already initialized participant stack: ${this.org.name}`
      );
    }

    this.baseline = await baselineServiceFactory(
      baselineProviderProvide,
      this.baselineConfig
    );
    this.nats = await messagingServiceFactory(
      messagingProviderNats,
      this.natsConfig
    );
    this.zk = await zkSnarkCircuitProviderServiceFactory(
      zkSnarkCircuitProviderServiceZokrates,
      {
        importResolver: zokratesImportResolver,
      }
    );

    if (this.natsConfig?.bearerToken) {
      //this.natsBearerTokens = this.natsConfig.natsBearerTokens;
      this.natsBearerTokens[
        this.natsConfig.natsServers[0]
      ] = this.natsConfig.bearerToken;
    }

    dv.config();

    this.contracts = {};
    // Same contracts structure but for the contracts deployed on Ganache.
    this.ganacheContracts = {};
    this.startProtocolSubscriptions();

    if (this.baselineConfig.initiator) {
      // Clear up merkle-store if it exists
      await this.merkleStoreSetup();
      // Setting up state variables for local Ganache accounts.
      await this.ganacheAccountSetup();
      // Retrieving and deploying all needed contracts on Ganache.
      await this.contractSetup();

      if (this.baselineConfig.workgroup && this.baselineConfig.workgroupToken) {
        await this.setWorkgroup(
          this.baselineConfig.workgroup,
          this.baselineConfig.workgroupToken
        );
      } else if (this.baselineConfig.workgroupName) {
        console.log(
          "No workgroup found so let's create one " +
            this.baselineConfig.workgroupName
        );
        await this.createWorkgroup(this.baselineConfig.workgroupName);
      }

      await this.registerOrganization(
        this.baselineConfig.orgName,
        this.natsConfig.natsServers[0]
      );
    }

    this.initialized = true;
  }

  getBaselineCircuitArtifacts(): any | undefined {
    return this.baselineCircuitArtifacts;
  }

  getBaselineConfig(): any | undefined {
    return this.baselineConfig;
  }

  getBaselineService():
    | (IBaselineRPC & IBlockchainService & IRegistry & IVault)
    | undefined {
    return this.baseline;
  }

  getMessagingConfig(): any | undefined {
    return this.natsConfig;
  }

  getMessagingService(): IMessagingService | undefined {
    return this.nats;
  }

  getNatsBearerTokens(): { [key: string]: any } {
    return this.natsBearerTokens;
  }

  getOrganization(): any | undefined {
    return this.org;
  }

  getProtocolMessagesRx(): number {
    return this.protocolMessagesRx;
  }

  getProtocolMessagesTx(): number {
    return this.protocolMessagesTx;
  }

  getProtocolSubscriptions(): any[] {
    return this.protocolSubscriptions;
  }

  getWorkflowIdentifier(): any {
    return this.workflowIdentifier;
  }

  getWorkgroup(): any {
    return this.workgroup;
  }

  getWorkgroupToken(): any {
    return this.workgroupToken;
  }

  getWorkgroupContract(type: string): any {
    return this.contracts[type];
  }

  getWorkgroupContracts(): any[] {
    return this.contracts;
  }

  getWorkgroupContractGanache(type: string): any {
    return this.ganacheContracts[type];
  }

  getWorkgroupContractsGanache(): any[] {
    return this.ganacheContracts;
  }

  getWorkgroupCounterparties(): string[] {
    return this.workgroupCounterparties;
  }

  getGanacheKeys(): { [key: string]: string[] } {
    return {
      commitAccount: this.commitAccount,
      commitAccounts: this.commitAccounts,
    };
  }

  private async ganacheAccountSetup() {
    const request = require("supertest");

    this.commitMgrApiBob = request(process.env.B_MGR_API);
    this.commitMgrApiAlice = request(process.env.A_MGR_API);

    const res = await this.commitMgrApiBob.post("/jsonrpc").send({
      jsonrpc: "2.0",
      method: "eth_accounts",
      params: [],
      id: 1,
    });

    this.commitAccount = [process.env.WALLET_PUBLIC_KEY];
    this.commitAccounts = res.body.result;
  }

  private async merkleStoreSetup() {
    const config = {
      mongo: {
        debug: "true",
        bufferMaxEntries: 8,
        firstConnectRetryDelaySecs: 5,
      },
      mongoose: {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        poolSize: 5, // Max. number of simultaneous connections to maintain
        socketTimeoutMS: 0, // Use os-default, only useful when a network issue occurs and the peer becomes unavailable
        keepAlive: true, // KEEP ALIVE!
      },
    };

    //TODO::(Hamza) Initialise Alice's DB too.
    const dbCommit =
      "mongodb://" +
      `${process.env.B_DATABASE_USER}` +
      ":" +
      `${process.env.B_DATABASE_PASSWORD}` +
      "@" +
      `${process.env.B_DATABASE_HOST}` +
      "/" +
      `${process.env.B_DATABASE_NAME}`;

    // Replace database name then remove the username/password. If
    // sourcing credentials from admin db leave the last replace commented.
    let dbIdent =
      dbCommit.replace(new RegExp(/\b\/[a-zA-Z]*\b/), "/ident") +
      "?authSource=admin"; //.replace(new RegExp(/\b[a-zA-Z]*:[a-zA-Z0-9]*@\b/), "");

    // See https://github.com/Automattic/mongoose/issues/9335
    let merkleConnection = await mongoose.connect(dbCommit, config.mongoose);

    // Clear out all previous collections if there are any
    await this.collectionDropper(["merkle-trees"], merkleConnection.connection);
    await this.collectionDropper(
      ["organization", "user", "workgroup"],
      (await this.identConnector()).connection
    );
  }

  // TODO::(Hamza) -- Scan for and delete Ident collections.
  private async collectionDropper(
    names: string[],
    con: mongoose.Connection
  ): Promise<any> {
    for (var name of names) {
      await con.db.listCollections().toArray(async (err, collections) => {
        if (collections && collections.length > 0) {
          for (var collection of collections) {
            if (collection.name === name) {
              console.log(`Found an old ${name} collection; delete.`);
              await con.db.dropCollection(name);
            }
          }
        }
      });
    }
  }

  private async identConnector(): Promise<any> {
    if (this.identService && this.identConnection) {
      return {
        service: this.identService,
        connection: this.identConnection,
      };
    } else {
      // Establish our Ident service
      const dbCommit =
        "mongodb://" +
        `${process.env.B_DATABASE_USER}` +
        ":" +
        `${process.env.B_DATABASE_PASSWORD}` +
        "@" +
        `${process.env.B_DATABASE_HOST}` +
        "/" +
        `${process.env.B_DATABASE_NAME}`;

      let dbIdent =
        dbCommit.replace(new RegExp(/\b\/[a-zA-Z]*\b/), "/ident") +
        "?authSource=admin"; //.replace(new RegExp(/\b[a-zA-Z]*:[a-zA-Z0-9]*@\b/), "");

      this.identConnection = await mongoose.createConnection(dbIdent, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        poolSize: 5, // Max. number of simultaneous connections to maintain
        socketTimeoutMS: 0, // Use os-default, only useful when a network issue occurs and the peer becomes unavailable
        keepAlive: true, // KEEP ALIVE!
      });

      this.identService = new IdentWrapper(this.identConnection);

      return {
        service: this.identService,
        connection: this.identConnection,
      };
    }
  }

  private async contractSetup(): Promise<any> {
    const verifierContract = JSON.parse(
      readFileSync(
        "../../bri-2/contracts/artifacts/VerifierNoop.json"
      ).toString()
    ); // #1
    const shieldContract = JSON.parse(
      readFileSync("../../bri-2/contracts/artifacts/Shield.json").toString()
    ); // #2
    const erc1820Contract = JSON.parse(
      readFileSync(
        "../../bri-2/contracts/artifacts/ERC1820Registry.json"
      ).toString()
    ); // #3
    const orgRegistryContract = JSON.parse(
      readFileSync(
        "../../bri-2/contracts/artifacts/OrgRegistry.json"
      ).toString()
    ); // #4

    const url = "http://0.0.0.0:8545";
    const provider = new Eth.providers.JsonRpcProvider(url);
    const signer = provider.getSigner((await provider.listAccounts())[2]);
    const managedSigner = new NonceManager(signer);
    const abiCoder = new Eth.utils.AbiCoder();
    const treeHeight = 2;
    const sender = (await provider.listAccounts())[2];

    let verifierAddress,
      shieldAddress,
      erc1820Address,
      orgRegistryAddress: string;

    // Begin Verifier Contract
    const unsignedVerifierTx: any = {
      from: sender,
      data: verifierContract.bytecode,
      nonce: managedSigner.getTransactionCount(),
    };

    let gasEstimate = await managedSigner.estimateGas(unsignedVerifierTx);
    unsignedVerifierTx.gasLimit = Math.ceil(Number(gasEstimate) * 1.1);

    let verifierTxHash = await managedSigner
      .sendTransaction(unsignedVerifierTx)
      .then((tx) => {
        return tx.hash;
      })
      .catch((err) =>
        console.log(`(Error 1): ${JSON.stringify(err, undefined, 2)}`)
      );

    // TODO:: Test out each transaction@

    const verifierReceipt = await this.commitMgrApiBob.post("/jsonrpc").send({
      jsonrpc: "2.0",
      method: "eth_getTransactionReceipt",
      params: [verifierTxHash],
      id: 1,
    });

    const verifierReceiptDetails = verifierReceipt.body.result;
    verifierAddress = verifierReceiptDetails.contractAddress;

    // Begin Shield Contract
    const encodedShieldParams = abiCoder.encode(
      ["address", "uint"],
      [verifierAddress, treeHeight]
    );
    const shieldBytecodeWithParams =
      shieldContract.bytecode + encodedShieldParams.slice(2).toString();

    const unsignedShieldTx: any = {
      from: sender,
      data: shieldBytecodeWithParams,
      nonce: await managedSigner.getTransactionCount(),
    };

    gasEstimate = await managedSigner.estimateGas(unsignedShieldTx);
    unsignedShieldTx.gasLimit = Math.ceil(Number(gasEstimate) * 1.1);

    let shieldTxHash = await managedSigner
      .sendTransaction(unsignedShieldTx)
      .then((tx) => {
        return tx.hash;
      })
      .catch((error) =>
        console.log(`error(1): ${JSON.stringify(error, undefined, 2)}`)
      );

    const shieldReceipt = await this.commitMgrApiBob.post("/jsonrpc").send({
      jsonrpc: "2.0",
      method: "eth_getTransactionReceipt",
      params: [shieldTxHash],
      id: 1,
    });

    const shieldReceiptDetails = shieldReceipt.body.result;
    shieldAddress = shieldReceiptDetails.contractAddress;

    // Begin ERC-1820 contract
    const unsigned1820Tx: any = {
      from: sender,
      data: erc1820Contract.bytecode,
      nonce: await managedSigner.getTransactionCount(),
    };

    gasEstimate = await managedSigner.estimateGas(unsigned1820Tx);
    unsigned1820Tx.gasLimit = Math.ceil(Number(gasEstimate) * 1.1);

    let erc1820TxHash = await managedSigner
      .sendTransaction(unsigned1820Tx)
      .then((tx) => {
        return tx.hash;
      })
      .catch((error) =>
        console.log(`error(1): ${JSON.stringify(error, undefined, 2)}`)
      );

    const erc1820Receipt = await this.commitMgrApiBob.post("/jsonrpc").send({
      jsonrpc: "2.0",
      method: "eth_getTransactionReceipt",
      params: [erc1820TxHash],
      id: 1,
    });

    const erc1820ReceiptDetails = erc1820Receipt.body.result;
    erc1820Address = erc1820ReceiptDetails.contractAddress;

    // Begin ORG-Registry contract
    const encodedOrgParams = abiCoder.encode(
      ["bytes32"],
      [Eth.utils.hexZeroPad(erc1820Address, 32)]
    );
    const orgBytecodeWithParams =
      orgRegistryContract.bytecode + encodedOrgParams.slice(2).toString();

    const unsignedOrgTx: any = {
      from: sender,
      data: orgBytecodeWithParams,
      nonce: await managedSigner.getTransactionCount(),
    };

    gasEstimate = await managedSigner.estimateGas(unsignedOrgTx);
    unsignedOrgTx.gasLimit = Math.ceil(Number(gasEstimate) * 1.1);

    let orgTxHash = await managedSigner
      .sendTransaction(unsignedOrgTx)
      .then((tx) => {
        return tx.hash;
      })
      .catch((error) =>
        console.log(`error(1): ${JSON.stringify(error, undefined, 2)}`)
      );

    const orgReceipt = await this.commitMgrApiBob.post("/jsonrpc").send({
      jsonrpc: "2.0",
      method: "eth_getTransactionReceipt",
      params: [orgTxHash],
      id: 1,
    });

    const orgReceiptDetails = orgReceipt.body.result;
    orgRegistryAddress = orgReceiptDetails.contractAddress;

    this.ganacheContracts = {
      "erc1820-registry": {
        address: erc1820Address,
        name: "ERC1820Registry",
        network_id: 0,
        params: {
          compiled_artifact: erc1820Contract,
        },
        type: "erc1820-registry",
      },
      "organization-registry": {
        address: orgRegistryAddress,
        name: "OrgRegistry",
        network_id: 0,
        params: {
          compiled_artifacts: orgRegistryContract,
        },
        type: "organization-registry",
      },
      shield: {
        address: shieldAddress,
        name: "Shield",
        network_id: 0,
        params: {
          compiled_artifacts: shieldContract,
        },
        type: "shield",
      },
      verifier: {
        address: verifierAddress,
        name: "Verifier",
        network_id: 0,
        params: {
          compiled_artifacts: verifierContract,
        },
        type: "verifier",
      },
    };

    for (const [key, value] of Object.entries(this.ganacheContracts)) {
      console.log(`${key} address: ${(value as any)!.address}`);
    }
  }

  private async dispatchProtocolMessage(msg: ProtocolMessage): Promise<any> {
    if (msg.opcode === Opcode.Baseline) {
      const vault = await this.requireVault();
      const workflowSignatories = 2;

      const payload = JSON.parse(msg.payload.toString());

      if (payload.doc) {
        if (!payload.sibling_path) {
          payload.sibling_path = [];
        }
        if (!payload.signatures) {
          payload.signatures = [];
        }
        if (!payload.hash) {
          payload.hash = sha256(JSON.stringify(payload.doc));
        }

        if (payload.signatures.length === 0) {
          // baseline this new document

          console.log(`Checking payload`);
          console.log(`${JSON.stringify(payload, undefined, 2)}`);

          payload.result = await this.generateProof("preimage", payload);

          const signature = (
            await this.signMessage(
              vault.id!,
              this.babyJubJub?.id!,
              payload.result.proof.proof
            )
          ).signature;
          payload.signatures = [signature];
          this.workgroupCounterparties.forEach(async (recipient) => {
            this.sendProtocolMessage(msg.sender, Opcode.Baseline, payload);
          });
        } else if (payload.signatures.length < workflowSignatories) {
          if (payload.sibling_path && payload.sibling_path.length > 0) {
            // perform off-chain verification to make sure this is a legal state transition
            const root = payload.sibling_path[0];
            const verified = this.baseline?.verify(
              this.contracts["shield"].address,
              payload.leaf,
              root,
              payload.sibling_path
            );
            if (!verified) {
              console.log(
                "WARNING-- off-chain verification of proposed state transition failed..."
              );
              this.workgroupCounterparties.forEach(async (recipient) => {
                this.sendProtocolMessage(recipient, Opcode.Baseline, {
                  err: "verification failed",
                });
              });
              return Promise.reject("failed to verify");
            }
          }

          // sign state transition
          const signature = (
            await this.signMessage(
              vault.id!,
              this.babyJubJub?.id!,
              payload.hash
            )
          ).signature;
          payload.signatures.push(signature);
          this.workgroupCounterparties.forEach(async (recipient) => {
            this.sendProtocolMessage(recipient, Opcode.Baseline, payload);
          });
        } else {
          // create state transition commitment
          payload.result = await this.generateProof(
            "modify_state",
            JSON.parse(msg.payload.toString())
          );
          const publicInputs = []; // FIXME
          const value = ""; // FIXME

          const resp = await this.baseline?.verifyAndPush(
            msg.sender,
            this.contracts["shield"].address,
            payload.result.proof.proof,
            publicInputs,
            value
          );

          const leaf = resp!.commitment as MerkleTreeNode;

          if (leaf) {
            console.log(`inserted leaf... ${leaf}`);
            payload.sibling_path = (
              await this.baseline!.getProof(msg.shield, leaf.location())
            ).map((node) => node.location());
            payload.sibling_path?.push(leaf.index);
            this.workgroupCounterparties.forEach(async (recipient) => {
              await this.sendProtocolMessage(
                recipient,
                Opcode.Baseline,
                payload
              );
            });
          } else {
            return Promise.reject("failed to insert leaf");
          }
        }
      } else if (payload.signature) {
        console.log(
          `NOOP!!! received signature in BLINE protocol message: ${payload.signature}`
        );
      }
    } else if (msg.opcode === Opcode.Join) {
      const payload = JSON.parse(msg.payload.toString());
      const messagingEndpoint = await this.resolveMessagingEndpoint(
        payload.address
      );
      if (
        !messagingEndpoint ||
        !payload.address ||
        !payload.authorized_bearer_token
      ) {
        return Promise.reject(
          "failed to handle baseline JOIN protocol message"
        );
      }
      this.workgroupCounterparties.push(payload.address);
      this.natsBearerTokens[messagingEndpoint] =
        payload.authorized_bearer_token;
    }
  }

  // HACK!! workgroup/contracts should be synced via protocol
  async acceptWorkgroupInvite(
    inviteToken: string,
    contracts: any
  ): Promise<void> {
    if (
      this.workgroup ||
      this.workgroupToken ||
      this.org ||
      this.baselineConfig.initiator
    ) {
      return Promise.reject("failed to accept workgroup invite");
    }

    const invite = jwt.decode(inviteToken) as { [key: string]: any };

    await this.createWorkgroup(this.baselineConfig.workgroupName);

    this.contracts = {
      "erc1820-registry": {
        address: invite.prvd.data.params.erc1820_registry_contract_address,
        name: "ERC1820Registry",
        network_id: this.baselineConfig?.networkId,
        params: {
          compiled_artifact:
            contracts["erc1820-registry"].params?.compiled_artifact,
        },
        type: "erc1820-registry",
      },
      "organization-registry": {
        address: invite.prvd.data.params.organization_registry_contract_address,
        name: "OrgRegistry",
        network_id: this.baselineConfig?.networkId,
        params: {
          compiled_artifact:
            contracts["organization-registry"].params?.compiled_artifact,
        },
        type: "organization-registry",
      },
      shield: {
        address: invite.prvd.data.params.shield_contract_address,
        name: "Shield",
        network_id: this.baselineConfig?.networkId,
        params: {
          compiled_artifact: contracts["shield"].params?.compiled_artifact,
        },
        type: "shield",
      },
      verifier: {
        address: invite.prvd.data.params.verifier_contract_address,
        name: "Verifier",
        network_id: this.baselineConfig?.networkId,
        params: {
          compiled_artifact: contracts["verifier"].params?.compiled_artifact,
        },
        type: "verifier",
      },
    };

    const nchain = nchainClientFactory(
      this.workgroupToken,
      this.baselineConfig?.nchainApiScheme,
      this.baselineConfig?.nchainApiHost
    );

    this.contracts["erc1820-registry"] = await nchain.createContract(
      this.contracts["erc1820-registry"]
    );
    this.contracts["organization-registry"] = await nchain.createContract(
      this.contracts["organization-registry"]
    );
    this.contracts["shield"] = await nchain.createContract(
      this.contracts["shield"]
    );
    this.contracts["verifier"] = await nchain.createContract(
      this.contracts["verifier"]
    );

    const counterpartyAddr =
      invite.prvd.data.params.invitor_organization_address;
    this.workgroupCounterparties.push(counterpartyAddr);

    const messagingEndpoint = await this.resolveMessagingEndpoint(
      counterpartyAddr
    );
    this.natsBearerTokens[messagingEndpoint] =
      invite.prvd.data.params.authorized_bearer_token;
    this.workflowIdentifier = invite.prvd.data.params.workflow_identifier;

    await this.baseline
      ?.track(invite.prvd.data.params.shield_contract_address)
      .catch((err) => {});

    // Register organization on-chain.
    await this.registerOrganization(
      this.baselineConfig.orgName,
      this.natsConfig.natsServers[0]
    );

    // Retrieve on-chain organization
    await this.requireOrganization(await this.resolveOrganizationAddress());

    await this.sendProtocolMessage(counterpartyAddr, Opcode.Join, {
      address: await this.resolveOrganizationAddress(),
      authorized_bearer_token: await this.vendNatsAuthorization(),
      workflow_identifier: this.workflowIdentifier,
    });
  }

  private marshalCircuitArg(val: string, fieldBits?: number): string[] {
    console.log(val);
    const el = elementify(val) as Element;
    return el.field(fieldBits || 128, 1, true);
  }

  async generateProof(type: string, msg: any): Promise<any> {
    console.log(`Checking msg -> generateProof`);
    console.log(`${JSON.stringify(msg, undefined, 2)}`);

    const senderZkPublicKey = this.babyJubJub?.publicKey!;
    let commitment: string;
    let root: string | null = null;
    const salt = msg.salt || rndHex(32);
    if (msg.sibling_path && msg.sibling_path.length > 0) {
      const siblingPath = elementify(msg.sibling_path) as Element;
      root = siblingPath[0].hex(64);
    }

    console.log(`generating ${type} proof...\n`, msg);

    switch (type) {
      case "preimage": // create agreement
        const preimage = concatenateThenHash({
          erc20ContractAddress: this.marshalCircuitArg(
            this.contracts["erc1820-registry"].address
          ),
          senderPublicKey: this.marshalCircuitArg(senderZkPublicKey),
          name: this.marshalCircuitArg(msg.doc.name),
          url: this.marshalCircuitArg(msg.doc.url),
          hash: this.marshalCircuitArg(msg.hash),
        });
        console.log(
          `generating state genesis with preimage: ${preimage}; salt: ${salt}`
        );
        commitment = concatenateThenHash(preimage, salt);
        break;

      case "modify_state": // modify commitment state, nullify if applicable, etc.
        const _commitment = concatenateThenHash({
          senderPublicKey: this.marshalCircuitArg(senderZkPublicKey),
          name: this.marshalCircuitArg(msg.doc.name),
          url: this.marshalCircuitArg(msg.doc.url),
          hash: this.marshalCircuitArg(msg.hash),
        });
        console.log(
          `generating state transition commitment with calculated delta: ${_commitment}; root: ${root}, salt: ${salt}`
        );
        commitment = concatenateThenHash(root, _commitment, salt);
        break;

      default:
        throw new Error("invalid proof type");
    }

    const args = [
      this.marshalCircuitArg(commitment), // should == what we are computing in the circuit
      {
        value: [
          this.marshalCircuitArg(commitment.substring(0, 16)),
          this.marshalCircuitArg(commitment.substring(16)),
        ],
        salt: [
          this.marshalCircuitArg(salt.substring(0, 16)),
          this.marshalCircuitArg(salt.substring(16)),
        ],
      },
      {
        senderPublicKey: [
          this.marshalCircuitArg(senderZkPublicKey.substring(0, 16)),
          this.marshalCircuitArg(senderZkPublicKey.substring(16)),
        ],
        agreementName: this.marshalCircuitArg(msg.doc.name),
        agreementUrl: this.marshalCircuitArg(msg.doc.url),
      },
    ];

    const proof = await this.zk?.generateProof(
      this.baselineCircuitArtifacts?.program,
      (await this.zk?.computeWitness(this.baselineCircuitArtifacts!, args))
        .witness,
      this.baselineCircuitSetupArtifacts?.keypair?.pk
    );

    return {
      doc: msg.doc,
      proof: proof,
      salt: salt,
    };
  }

  async resolveMessagingEndpoint(addr: string): Promise<string> {
    const org = await this.fetchOrganization(addr);
    if (!org) {
      return Promise.reject(`organization not resolved: ${addr}`);
    }

    const messagingEndpoint = org["config"].messaging_endpoint;
    if (!messagingEndpoint) {
      return Promise.reject(
        `organization messaging endpoint not resolved for recipient: ${addr}`
      );
    }

    return messagingEndpoint;
  }

  // bearer auth tokens authorized by third parties are keyed on the messaging endpoint to which access is authorized
  async resolveNatsBearerToken(addr: string): Promise<string> {
    const endpoint = await this.resolveMessagingEndpoint(addr);
    if (!endpoint) {
      return Promise.reject(
        `failed to resolve messaging endpoint for participant: ${addr}`
      );
    }
    return this.natsBearerTokens[endpoint];
  }

  // this will accept recipients (string[]) for multi-party use-cases
  async sendProtocolMessage(
    recipient: string,
    opcode: Opcode,
    msg: any
  ): Promise<any> {
    const messagingEndpoint = await this.resolveMessagingEndpoint(recipient);
    if (!messagingEndpoint) {
      return Promise.reject(
        `protocol message not sent; organization messaging endpoint not resolved for recipient: ${recipient}`
      );
    }

    const bearerToken = this.natsBearerTokens[messagingEndpoint];
    if (!bearerToken) {
      return Promise.reject(
        `protocol message not sent; no bearer authorization cached for endpoint of recipient: ${recipient}`
      );
    }

    const recipientNatsConn = await messagingServiceFactory(
      messagingProviderNats,
      {
        bearerToken: bearerToken,
        natsServers: [messagingEndpoint],
      }
    );
    await recipientNatsConn.connect();

    if (msg.id && !this.workflowRecords[msg.id]) {
      this.workflowRecords[msg.id] = msg;
    }

    // this will use protocol buffers or similar
    const wiremsg = marshalProtocolMessage(
      await this.protocolMessageFactory(
        opcode,
        recipient,
        this.contracts["shield"].address,
        this.workflowIdentifier!,
        Buffer.from(JSON.stringify(msg))
      )
    );

    const result = recipientNatsConn.publish(
      baselineProtocolMessageSubject,
      wiremsg
    );
    this.protocolMessagesTx++;
    recipientNatsConn.disconnect();
    return result;
  }

  async createWorkgroup(name: string): Promise<Workgroup> {
    if (this.workgroup) {
      return Promise.reject(
        `workgroup not created; instance is associated with workgroup: ${this.workgroup.name}`
      );
    }

    this.workgroup = await this.baseline?.createWorkgroup({
      config: {
        baselined: true,
      },
      name: name,
      network_id: this.baselineConfig?.networkId,
    });

    const tokenResp = await this.createWorkgroupToken();
    this.workgroupToken = tokenResp.accessToken || tokenResp.token;

    if (this.baselineConfig.initiator) {
      // Deploy organization-registry
      await this.initWorkgroup();
    }

    return this.workgroup;
  }

  private async initWorkgroup(): Promise<void> {
    if (!this.workgroup) {
      return Promise.reject("failed to init workgroup");
    }

    this.capabilities = capabilitiesFactory();
    await this.requireCapabilities();

    const registryContracts = JSON.parse(
      JSON.stringify(this.capabilities?.getBaselineRegistryContracts())
    );

    const contractParams = registryContracts[2]; // "shuttle" launch contract
    // ^^ FIXME -- load from disk -- this is a wrapper to deploy the OrgRegistry contract

    await this.deployWorkgroupContract("Shuttle", "registry", contractParams);
    await this.requireWorkgroupContract("organization-registry");
  }

  async registerWorkgroupOrganization(): Promise<Organization> {
    if (!this.workgroup || !this.workgroupToken || !this.org) {
      return Promise.reject("failed to register workgroup organization");
    }

    return (
      await Ident.clientFactory(
        this.workgroupToken,
        this.baselineConfig?.identApiScheme,
        this.baselineConfig?.identApiHost
      )
    ).createApplicationOrganization(this.workgroup.id, {
      organization_id: this.org.id,
    });
  }

  async setWorkgroup(workgroup: any, workgroupToken: any): Promise<void> {
    if (
      !workgroup ||
      !workgroupToken ||
      !this.workgroup ||
      this.workgroupToken
    ) {
      return Promise.reject("failed to set workgroup");
    }

    this.workgroup = workgroup;
    this.workgroupToken = workgroupToken;

    return this.initWorkgroup();
  }

  async fetchWorkgroupOrganizations(): Promise<Organization[]> {
    if (!this.workgroup || !this.workgroupToken) {
      return Promise.reject("failed to fetch workgroup organizations");
    }

    return await Ident.clientFactory(
      this.workgroupToken,
      this.baselineConfig?.identApiScheme,
      this.baselineConfig?.identApiHost
    ).fetchApplicationOrganizations(this.workgroup.id, {});
  }

  async createOrgToken(): Promise<Token> {
    return await Ident.clientFactory(
      this.baselineConfig?.token,
      this.baselineConfig?.identApiScheme,
      this.baselineConfig?.identApiHost
    ).createToken({
      organization_id: this.org.id,
    });
  }

  async createWorkgroupToken(): Promise<Token> {
    return await Ident.clientFactory(
      this.baselineConfig?.token,
      this.baselineConfig?.identApiScheme,
      this.baselineConfig?.identApiHost
    ).createToken({
      application_id: this.workgroup.id,
    });
  }

  async resolveOrganizationAddress(): Promise<string> {
    const keys = await this.fetchKeys();
    if (keys && keys.length >= 3) {
      return keys[2].address; // HACK!
    }
    return Promise.reject("failed to resolve organization address");
  }

  async fetchOrganization(address: string): Promise<Organization> {
    // fetchOrganization == On-chain registration.
    const orgRegistryContract = await this.requireWorkgroupContract(
      "organization-registry"
    );

    //const nchain = nchainClientFactory(
    //  this.workgroupToken,
    //  this.baselineConfig?.nchainApiScheme,
    //  this.baselineConfig?.nchainApiHost
    //);
    // https://docs.provide.services/api/nchain/signing/accounts#create-account
    // Signer
    //const signerResp = await nchain.createAccount({
    //  network_id: this.baselineConfig?.networkId,
    //});

    //const resp = await NChain.clientFactory(
    //  this.workgroupToken,
    //  this.baselineConfig?.nchainApiScheme,
    //  this.baselineConfig?.nchainApiHost
    //).executeContract(orgRegistryContract.id, {
    //  method: "getOrg",
    //  params: [address],
    //  value: 0,
    //  account_id: signerResp["id"],
    //});

    const resp = await this.g_retrieveOrganization(address).catch((err) =>
      console.log(
        `Error while fetching organization under the following address: ${address}. Error details: \n ${JSON.stringify(
          err,
          undefined,
          2
        )}`
      )
    );

    if (resp) {
      const org = {} as Organization;
      org["name"] = resp["name"];
      org["address"] = resp["address"];
      //org["config"] = JSON.parse(atob(resp["response"][5]));
      org["config"]["messaging_endpoint"] = resp["messagingEndpoint"];
      org["config"]["zk_public_key"] = resp["zkpPublicKey"];
      org["config"]["nats_bearer_token"] = resp["natsKey"];
      return Promise.resolve(org);
    }

    return Promise.reject(`failed to fetch organization ${address}`);
  }

  async fetchVaults(): Promise<ProvideVault[]> {
    const orgToken = await this.createOrgToken();
    const token = orgToken.accessToken || orgToken.token;
    return await Vault.clientFactory(
      token!,
      this.baselineConfig.vaultApiScheme!,
      this.baselineConfig.vaultApiHost!
    ).fetchVaults({});
  }

  async createVaultKey(
    vaultId: string,
    spec: string,
    type?: string,
    usage?: string
  ): Promise<VaultKey> {
    const orgToken = await this.createOrgToken();
    const token = orgToken.accessToken || orgToken.token;
    const vault = Vault.clientFactory(
      token!,
      this.baselineConfig?.vaultApiScheme,
      this.baselineConfig?.vaultApiHost
    );
    return await vault.createVaultKey(vaultId, {
      type: type || "asymmetric",
      usage: usage || "sign/verify",
      spec: spec,
      name: `${this.org.name} ${spec} keypair`,
      description: `${this.org.name} ${spec} keypair`,
    });
  }

  async requireVault(token?: string): Promise<ProvideVault> {
    let vault;
    let tkn = token;
    if (!tkn) {
      const orgToken = await this.createOrgToken();
      tkn = orgToken.accessToken || orgToken.token;
    }

    let interval;
    const promises = [] as any;
    promises.push(
      new Promise((resolve, reject) => {
        interval = setInterval(async () => {
          const vaults = await Vault.clientFactory(
            tkn!,
            this.baselineConfig.vaultApiScheme!,
            this.baselineConfig.vaultApiHost!
          ).fetchVaults({});
          if (vaults && vaults.length > 0) {
            vault = vaults[0];
            resolve();
          }
        }, 2500);
      })
    );

    await Promise.all(promises);
    clearInterval(interval);
    interval = null;

    return vault;
  }

  async signMessage(
    vaultId: string,
    keyId: string,
    message: string
  ): Promise<any> {
    const orgToken = await this.createOrgToken();
    const token = orgToken.accessToken || orgToken.token;
    const vault = Vault.clientFactory(
      token!,
      this.baselineConfig?.vaultApiScheme,
      this.baselineConfig?.vaultApiHost
    );
    return await vault.signMessage(vaultId, keyId, message);
  }

  async fetchKeys(): Promise<any> {
    const orgToken = await this.createOrgToken();
    const token = orgToken.accessToken || orgToken.token;
    const vault = Vault.clientFactory(
      token!,
      this.baselineConfig?.vaultApiScheme,
      this.baselineConfig?.vaultApiHost
    );
    const vlt = await this.requireVault(token!);
    return await vault.fetchVaultKeys(vlt.id!, {});
  }

  async compileBaselineCircuit(): Promise<any> {
    const src = readFileSync(baselineDocumentCircuitPath).toString();
    this.baselineCircuitArtifacts = await this.zk?.compile(src, "main");
    return this.baselineCircuitArtifacts;
  }

  async deployBaselineCircuit(): Promise<any> {
    // compile the circuit...
    await this.compileBaselineCircuit();

    // perform trusted setup and deploy verifier/shield contract
    const setupArtifacts = await this.zk?.setup(this.baselineCircuitArtifacts);
    const compilerOutput = JSON.parse(
      solidityCompile(
        JSON.stringify({
          language: "Solidity",
          sources: {
            "verifier.sol": {
              content: setupArtifacts?.verifierSource
                ?.replace(/\^0.6.1/g, "^0.7.3")
                .replace(/view/g, ""),
            },
          },
          settings: {
            outputSelection: {
              "*": {
                "*": ["*"],
              },
            },
          },
        })
      )
    );

    if (
      !compilerOutput.contracts ||
      !compilerOutput.contracts["verifier.sol"]
    ) {
      throw new Error("verifier contract compilation failed");
    }

    const contractParams = compilerOutput.contracts["verifier.sol"]["Verifier"];

    //await this.deployWorkgroupContract('Verifier', 'verifier', contractParams);
    // Current verifier contract is simply built from a no-op circuit.
    await this.requireWorkgroupContract("verifier");

    //const shieldAddress = await this.deployWorkgroupShieldContract();

    // TODO::(Hamza) -- Replace this shield contract
    const shieldAddress = this.ganacheContracts["shield"]["address"];

    // Commit-mgr handles the tracking
    console.log("Tracking shield through Commit-Mgr");
    console.log("Shield Address we're going to track: " + shieldAddress);

    //		Doesn't work for some reason, fix this later, for now manually call.
    //
    //		const trackedShield = await this.baseline?.track(shieldAddress).then((v) => {
    //			console.log(`baseline.track: ${JSON.stringify(v, undefined, 2)}`);
    //			return v;
    //		}).catch((e) => console.log(`Shield TRACKING error: ${e}`));

    const trackedShield = await this.commitMgrApiBob
      .post("/jsonrpc")
      .send({
        jsonrpc: "2.0",
        method: "baseline_track",
        params: [shieldAddress],
        id: 1,
      })
      .then((v) => {
        if (v.status !== 200) return false;
        const parsedResponse: any = () => {
          try {
            return JSON.parse(v.text);
          } catch (error) {
            console.log(
              `ERROR while parsing baseline_track response text ${JSON.stringify(
                error,
                undefined,
                2
              )}`
            );
            return undefined;
          }
        };
        return parsedResponse().result;
      });

    if (!trackedShield) {
      console.log("WARNING: failed to track baseline shield contract");
    }

    this.baselineCircuitSetupArtifacts = setupArtifacts;
    this.workflowIdentifier = this.baselineCircuitSetupArtifacts?.identifier;

    return setupArtifacts;
  }

  async track(): Promise<any> {}

  async getTracked(): Promise<any> {
    const trackedShield = await this.commitMgrApiBob
      .post("/jsonrpc")
      .send({
        jsonrpc: "2.0",
        method: "baseline_getTracked",
        params: [],
        id: 1,
      })
      .then((v) => {
        if (v.status !== 200) return false;
        const parsedResponse: any = () => {
          try {
            return JSON.parse(v.text);
          } catch (error) {
            console.log(
              `ERROR while parsing baseline_getTracked response text ${JSON.stringify(
                error,
                undefined,
                2
              )}`
            );
            return undefined;
          }
        };
        return parsedResponse().result;
      });

    return trackedShield;
  }

  async deployWorkgroupContract(
    name: string,
    type: string,
    params: any,
    arvg?: any[]
  ): Promise<any> {
    if (!this.workgroupToken) {
      return Promise.reject("failed to deploy workgroup contract");
    }

    if (!params.bytecode && params.evm) {
      // HACK
      params.bytecode = `0x${params.evm.bytecode.object}`;
    }

    const nchain = nchainClientFactory(
      this.workgroupToken,
      this.baselineConfig?.nchainApiScheme,
      this.baselineConfig?.nchainApiHost
    );

    const signerResp = await nchain.createAccount({
      network_id: this.baselineConfig?.networkId,
    });

    const resp = await nchain.createContract({
      address: "0x",
      params: {
        account_id: signerResp["id"],
        compiled_artifact: params,
        // network: 'kovan',
        argv: arvg || [],
      },
      name: name,
      network_id: this.baselineConfig?.networkId,
      type: type,
    });
    if (resp && resp) {
      this.contracts[type] = resp;
      this.contracts[type].params = {
        compiled_artifact: params,
      };
    }
    return resp;
  }

  async deployWorkgroupShieldContract(): Promise<any> {
    const verifierContract = await this.requireWorkgroupContract("verifier");
    const registryContracts = JSON.parse(
      JSON.stringify(this.capabilities?.getBaselineRegistryContracts())
    );
    const contractParams = registryContracts[3]; // "shuttle circle" factory contract

    const argv = ["MerkleTreeSHA Shield", verifierContract.address, 32];

    // deploy EYBlockchain's MerkleTreeSHA contract (see https://github.com/EYBlockchain/timber)
    await this.deployWorkgroupContract(
      "ShuttleCircuit",
      "circuit",
      contractParams,
      argv
    );
    const shieldContract = await this.requireWorkgroupContract("shield");

    return shieldContract.address;
  }

  async inviteWorkgroupParticipant(email: string): Promise<Invite> {
    return await Ident.clientFactory(
      this.baselineConfig?.token,
      this.baselineConfig?.identApiScheme,
      this.baselineConfig?.identApiHost
    ).createInvitation({
      application_id: this.workgroup.id,
      email: email,
      permissions: 0,
      params: {
        erc1820_registry_contract_address: this.contracts["erc1820-registry"]
          .address,
        invitor_organization_address: await this.resolveOrganizationAddress(),
        authorized_bearer_token: await this.vendNatsAuthorization(),
        organization_registry_contract_address: this.contracts[
          "organization-registry"
        ].address,
        shield_contract_address: this.contracts["shield"].address,
        verifier_contract_address: this.contracts["verifier"].address,
        workflow_identifier: this.workflowIdentifier,
      },
    });
  }

  private async requireCapabilities(): Promise<void> {
    let interval;
    const promises = [] as any;
    promises.push(
      new Promise((resolve, reject) => {
        interval = setInterval(async () => {
          if (this.capabilities?.getBaselineRegistryContracts()) {
            resolve();
          }
        }, 2500);
      })
    );

    await Promise.all(promises);
    clearInterval(interval);
    interval = null;
  }

  async requireOrganization(address: string): Promise<Organization> {
    let organization;
    let interval;

    const promises = [] as any;
    promises.push(
      new Promise((resolve, reject) => {
        interval = setInterval(async () => {
          this.fetchOrganization(address)
            .then((org) => {
              if (
                org &&
                org["address"].toLowerCase() === address.toLowerCase()
              ) {
                organization = org;
                resolve();
              }
            })
            .catch((err) => {});
        }, 5000);
      })
    );

    await Promise.all(promises);
    clearInterval(interval);
    interval = null;

    return organization;
  }

  async requireWorkgroup(): Promise<void> {
    let interval;
    const promises = [] as any;
    promises.push(
      new Promise((resolve, reject) => {
        interval = setInterval(async () => {
          if (this.workgroup) {
            resolve();
          }
        }, 2500);
      })
    );

    await Promise.all(promises);
    clearInterval(interval);
    interval = null;
  }

  async requireWorkgroupContract(type: string): Promise<any> {
    let contract;
    let interval;

    const promises = [] as any;
    promises.push(
      new Promise((resolve, reject) => {
        interval = setInterval(async () => {
          this.resolveWorkgroupContract(type)
            .then((cntrct) => {
              contract = cntrct;
              resolve();
            })
            .catch((err) => {});
        }, 5000);
      })
    );

    await Promise.all(promises);
    clearInterval(interval);
    interval = null;

    return contract;
  }

  async resolveWorkgroupContract(type: string): Promise<any> {
    console.log("Stubbing " + type);

    if (
      this.ganacheContracts[type] &&
      this.ganacheContracts[type]["address"] !== "0x"
    ) {
      this.contracts[type] = this.ganacheContracts[type];
      return Promise.resolve(this.ganacheContracts[type]);
    }
    return Promise.reject();
  }

  async registerOrganization(
    name: string,
    messagingEndpoint: string
  ): Promise<any> {
    // *************************************************
    // Pre-organization creation through Ident. Not sure
    // what happens here. But I just assume that this is
    // pre-registration. We're not dealing with addresses
    // yet. These are assigned once this organization is
    // created and saved in Provide's Ident DB. Keys are
    // dealt with by Provide Vault.
    // *************************************************
    // Ident.createOrganization RETURN DATA ************
    //
    // createdAt: 2021-01-22T09:30:37.2481415Z
    // description: null
    // id: 4f7df75f-8521-4e76-a61e-72501c7cbe0d
    // metadata:
    // messaging_endpoint: nats://localhost:4224
    // name: Bob Corp
    // userId: 74651596-82e8-4ba9-9c9d-058b11bd8d50

    //this.org = await this.baseline?.createOrganization({
    //  name: name,
    //  metadata: {
    //    messaging_endpoint: messagingEndpoint,
    //  },
    //});

    // Required so that vault accepts our token :) Locally generated
    // id's hold no value in the Provide eco-system.
    const orgTokenVoucher = (
      await this.baseline?.createOrganization({
        name: name,
        metadata: {
          messaging_endpoint: messagingEndpoint,
        },
      })
    ).id;

    // Phase one -- Register organization locally
    const identOrganization = await (await this.identConnector()).service
      .createOrganization({
        createdAt: new Date().toString(),
        name: name,
        userId: `${uuid4()}`,
        description: ``,
        metadata: {
          messaging_endpoint: messagingEndpoint,
        },
      })
      .then(async (org) => {
        this.org = JSON.parse(
          JSON.stringify({
            createdAt: org["createdAt"],
            description: org["description"],
            id: orgTokenVoucher,
            metadata: org["metadata"],
            messaging_endpoint: org["metadata"]["messaging_endpoint"],
            name: org["name"],
            userId: org["userId"],
          })
        );
      });

    if (this.org) {
      // Phase two -- Create our keys
      const vault = await this.requireVault();
      // Our ZKP keypair
      this.babyJubJub = await this.createVaultKey(vault.id!, "babyJubJub");
      // Our organization keypair
      await this.createVaultKey(vault.id!, "secp256k1");
      this.hdwallet = await this.createVaultKey(vault.id!, "BIP39");

      console.log("Org Address: " + (await this.fetchKeys())[2].address);

      // Phase three -- Register organization in registry
      const resp = await this.g_registerOrganization(
        this.org.name,
        (await this.fetchKeys())[2].address,
        this.org.messaging_endpoint,
        this.natsBearerTokens[this.org.messaging_endpoint] || "0x",
        this.babyJubJub?.publicKey!
      ).then((resp) => {
        return resp;
      });

      const localOrganization = await this.registerWorkgroupOrganization();
    }

    return this.org;
  }

  async g_retrieveOrganization(address: any): Promise<any> {
    const orgRegistryContract = await this.requireWorkgroupContract(
      "organization-registry"
    );
    const registry_abi = orgRegistryContract.params.compiled_artifacts.abi;
    const url = "http://0.0.0.0:8545";
    const provider = new Eth.providers.JsonRpcProvider(url);
    const signer = provider.getSigner((await provider.listAccounts())[2]);
    const managedSigner = new NonceManager(signer);

    const orgConnector = new Eth.Contract(
      orgRegistryContract.address,
      registry_abi,
      managedSigner
    );

    return await orgConnector
      .getOrg(address)
      .then((rawOrg) => {
        return Promise.resolve({
          address: rawOrg[0],
          name: Eth.utils.parseBytes32String(rawOrg[1]),
          messagingEndpoint: Eth.utils.toUtf8String(rawOrg[2]),
          natsKey: Eth.utils.toUtf8String(rawOrg[3]),
          zkpPublicKey: Eth.utils.toUtf8String(rawOrg[4]),
          metadata: Eth.utils.toUtf8String(rawOrg[5]),
        });
      })
      .catch((err) => Promise.reject(err));
  }

  async g_registerOrganization(
    name: string,
    address: string,
    messagingEndpoint: string,
    messagingBearerToken: string,
    zkpPublicKey: string
  ): Promise<any> {
    // Process Description ************************************
    //
    // Organization registry happens in three phases.
    // Phase one: First we create the intial organization. This
    // organization is saved in some local/remote Identity DB.
    //
    // Phase two: Set up all organization related keys. This
    // in general hapens through a vault service. If you'd like
    // to be unsafe though, just save it with the organization
    // itself.
    //
    // Phase three: Once the previous two phases have been
    // executed. It is now time to add whatever data we've just
    // created to the organization registry smart contract.

    const orgRegistryContract = await this.requireWorkgroupContract(
      "organization-registry"
    );

    const registryAbi = orgRegistryContract.params.compiled_artifacts.abi;

    const url = "http://0.0.0.0:8545";
    const provider = new Eth.providers.JsonRpcProvider(url);

    const signer = provider.getSigner((await provider.listAccounts())[2]);
    const managedSigner = new NonceManager(signer);

    const registryConnector = new Eth.Contract(
      orgRegistryContract.address,
      registryAbi,
      managedSigner
    );

    const orgAddress =
      JSON.stringify(address).match(new RegExp(/\b0x[a-zA-Z0-9]{40}\b/))![0] ||
      "0x";

    console.log("orgAddress " + orgAddress);

    let regOrg = await registryConnector
      .registerOrg(
        orgAddress,
        Eth.utils.formatBytes32String(name),
        Eth.utils.toUtf8Bytes(messagingEndpoint),
        // TODO:: Really not sure what should happen with this one.
        // Is WhisperKey still even used? If so, what is it?
        Eth.utils.toUtf8Bytes(messagingBearerToken),
        Eth.utils.toUtf8Bytes(zkpPublicKey),
        Eth.utils.toUtf8Bytes("{}")
      )
      .then((v) => {
        // Decode our transaction data.
        const tempOrg = Eth.utils.defaultAbiCoder.decode(
          ["address", "bytes32", "bytes", "bytes", "bytes", "bytes"],
          // Remove first 4 bytes ( the function sighash )
          Eth.utils.hexDataSlice(v.data, 4)
        );

        // Parse the organization values and return it to base variable.
        return {
          // TODO::(Hamza) Check if this equals our secp256k1 key
          address: tempOrg[0],
          name: Eth.utils.parseBytes32String(tempOrg[1]),
          messagingEndpoint: Eth.utils.toUtf8String(tempOrg[2]),
          natsKey: Eth.utils.toUtf8String(tempOrg[3]),
          zkpPublicKey: Eth.utils.toUtf8String(tempOrg[4]),
          metadata: Eth.utils.toUtf8String(tempOrg[5]),
        };
      })
      .catch((e: any) => {
        throw Error("Error while trying to create organization." + e);
      });

    console.log(
      `Registered organization data: ${JSON.stringify(regOrg, undefined, 2)}`
    );

    return regOrg;
  }

  async startProtocolSubscriptions(): Promise<any> {
    if (!this.nats?.isConnected()) {
      await this.nats?.connect();
    }

    const subscription = await this.nats?.subscribe(
      baselineProtocolMessageSubject,
      (msg, err) => {
        this.protocolMessagesRx++;
        this.dispatchProtocolMessage(
          unmarshalProtocolMessage(Buffer.from(msg.data))
        );
      }
    );

    this.protocolSubscriptions.push(subscription);
    return this.protocolSubscriptions;
  }

  async protocolMessageFactory(
    opcode: Opcode,
    recipient: string,
    shield: string,
    identifier: string,
    payload: Buffer
  ): Promise<ProtocolMessage> {
    const vaults = await this.fetchVaults();
    const signature = (
      await this.signMessage(
        vaults[0].id!,
        this.hdwallet!.id!,
        sha256(payload.toString())
      )
    ).signature;

    return {
      opcode: opcode,
      sender: await this.resolveOrganizationAddress(),
      recipient: recipient,
      shield: shield,
      identifier: identifier,
      signature: signature,
      type: PayloadType.Text,
      payload: payload,
    };
  }

  async vendNatsAuthorization(): Promise<string> {
    const authService = new AuthService(
      log,
      this.natsConfig?.audience || this.natsConfig.natsServers[0],
      this.natsConfig?.privateKey,
      this.natsConfig?.publicKey
    );

    const permissions = {
      publish: {
        allow: ["baseline.>"],
      },
      subscribe: {
        allow: [`baseline.inbound`],
      },
    };

    return await authService.vendBearerJWT(
      baselineProtocolMessageSubject,
      5000,
      permissions
    );
  }
}
