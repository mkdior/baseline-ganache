import { ethers as Eth } from "ethers";
import { NonceManager } from "@ethersproject/experimental";

export enum Mgr {
  Bob = 1,
  Alice,
}

type TypeSet = {
  parType: string;
  parValue: string;
}[];

type ContractSet = {
  byteCode: string;
  params?: TypeSet;
  deployer?: string;
}[];

type MgrConfig = {
  endpoint: string;
  sender: string;
  mgr: any;
};

export class ContractMgr {
  private sender: any;
  private signer: any;
  private abiCoder: any;
  private provider: any;
  private mgrConfig: MgrConfig;

  constructor(config: MgrConfig) {
    this.sender = config.sender;
    this.provider = new Eth.providers.JsonRpcProvider(config.endpoint);
    this.signer = new NonceManager(this.provider.getSigner(config.sender));
    this.abiCoder = new Eth.utils.AbiCoder();
    this.mgrConfig = config;
  }

  public async compileContracts(contracts: ContractSet): Promise<any> {
    // This function may receive multiple contracts in the form of a ContractSet.
    // Each entry in this set has its own params so based on said params we might
    // have to do contract initialization differently.
    let addresses: string[] = [];

    // Loop through all contracts
    for (var contract of contracts) {
      // contract == { byteCode, params?, deployer? }
      // Quick note on deployer?, if it's set, it means that we should deploy the
      // contract under that address, not the one listed as sender in MgrConfig.

      const unsignedTx: any = {
        from: contract.deployer ? contract.deployer : this.sender,
        data: contract.byteCode,
        nonce: await this.signer.getTransactionCount(),
      };

      if (contract.params) {
        // We have params which we need to handle..
        let typeNames: string[] = [];
        let typeValues: string[] = [];

        // @TODO::Hamza Support more types.
        // bytes32 -- address -- uint
        for (var typeRow of contract.params) {
          switch (typeRow.parType) {
            case "bytes32": {
              typeNames.push(typeRow.parType);
              typeValues.push(Eth.utils.hexZeroPad(typeRow.parValue, 32));
              break;
            }
            case "address": {
              typeNames.push(typeRow.parType);
              typeValues.push(typeRow.parValue);
              break;
            }
            case "uint": {
              typeNames.push(typeRow.parType);
              typeValues.push(typeRow.parValue);
              break;
            }
            default: {
              throw "Trying to parse an unsupported type.";
            }
          }
        }
        console.log(typeNames);
        console.log(typeValues);
        unsignedTx.data =
          unsignedTx.data +
          this.abiCoder.encode(typeNames, typeValues).slice(2).toString();
      }

      let gasEstimate = await this.signer.estimateGas(unsignedTx);
      unsignedTx.gasLimit = Math.ceil(Number(gasEstimate) * 1.1);

      let txHash = await this.signer
        .sendTransaction(unsignedTx)
        .then((txResult: any) => txResult.hash)
        .catch((txError: any) =>
          Promise.reject(JSON.stringify(txError, undefined, 2))
        );

      const txReceipt = await this.mgrConfig.mgr.post("/jsonrpc").send({
        jsonrpc: "2.0",
        method: "eth_getTransactionReceipt",
        params: [txHash],
        id: 1,
      });

      addresses.push(txReceipt.body.result.contractAddress);
    }
    return Promise.resolve(addresses);
  }
}
