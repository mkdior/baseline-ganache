import { InfuraGas } from './infura-gas';
import { EthClient } from './eth-client';
import { logger } from "../logger";

export interface ITxManager {
  insertLeaf(
    toAddress: string,
    fromAddress: string,
    proof: any[],
    publicInputs: any[],
    newCommitment: string
  ): Promise<any>;
}

export async function txManagerServiceFactory(
  provider: string,
  config?: any,
): Promise<ITxManager> {
  let service;

  switch (provider) {
    case "infura-gas":
      service = new InfuraGas(config);
      break;
    case "infura":
      service = new EthClient(config);
      break;
    case "besu":
      service = new EthClient(config);
      break;
    case "ganache":
			logger.debug(`Return a new Ethereum client.`);	
			logger.info(`Return a new Ethereum client.`);	
      service = new EthClient(config);
      break;
    default:
      throw new Error('TxManager provider not found.');
  }

  return service;
}
