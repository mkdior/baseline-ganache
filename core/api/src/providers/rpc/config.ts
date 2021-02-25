export interface RpcConfig {
  // Feed everything to Commit-Mgr; it'll proxy all regular RPC calls to eth-client.
  rpcEndpoint: string | 'localhost:4002';
  rpcScheme: string | 'http';
  rpcVersion: string | '2.0';
}
