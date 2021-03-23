import { Opcode, Intention } from "@baseline-protocol/types";
import { concatenateThenHash, binToHex } from "@baseline-protocol/privacy";

import { assert } from "chai";
import { ParticipantStack } from "../src";
import {
  shouldBehaveLikeAWorkgroupOrganization,
  shouldBehaveLikeAnInitialWorkgroupOrganization,
  shouldBehaveLikeAnInvitedWorkgroupOrganization,
  shouldBehaveLikeAWorkgroupCounterpartyOrganization,
} from "./shared";

import {
  authenticateUser,
  baselineAppFactory,
  configureTestnet,
  createUser,
  promisedTimeout,
  scrapeInvitationToken,
} from "./utils";

import { flattenDeep, hexToDec } from "../src/utils/utils";

// @TODO::Hamza, create a single file containing all exports for these mods
// Section related to the WF PoC
import {
  Job,
  Priority,
  SupplierType,
  VerifierInterface,
  SelectionMetaData,
  CommitmentMetaData,
} from "../src/mods/types";

import {
  retrieveJobs,
  reqExpander,
  jobCanBeStarted,
} from "../src/mods/extract/extract";

import {
  createUniqueSets,
  formatUniqueSets,
  findOverlappingDay,
  partitionSuppliers,
} from "../src/mods/allign/allign";

import { Mgr } from "./utils-ganache";
import { ethers as Eth } from "ethers";

const aliceCorpName = "Alice Corp";
const bobCorpName = "Bob Corp";

const ropstenNetworkId = "66d44f30-9092-4182-a3c4-bc02736d6ae5";
const networkId = process.env["NCHAIN_NETWORK_ID"] || ropstenNetworkId;

const setupUser = async (identHost, firstname, lastname, email, password) => {
  const user = await createUser(
    identHost,
    firstname,
    lastname,
    email,
    password
  );
  const auth = await authenticateUser(identHost, email, password);
  const bearerToken = auth.token.token;
  assert(bearerToken, `failed to authorize bearer token for user ${email}`);
  return [user, bearerToken];
};

describe("baseline", () => {
  let bearerTokens; // user API credentials

  let alice;
  let aliceApp: ParticipantStack;

  let bob;
  let bobApp: ParticipantStack;

  let workgroup;
  let workgroupToken;

  before(async () => {
    await configureTestnet(5432, networkId);
    await configureTestnet(5433, networkId);

    const aliceUserToken = await setupUser(
      "localhost:8081",
      "Alice",
      "Baseline",
      `alice${new Date().getTime()}@baseline.local`,
      "alicep455"
    );
    alice = aliceUserToken[0];

    const bobUserToken = await setupUser(
      "localhost:8085",
      "Bob",
      "Baseline",
      `bob${new Date().getTime()}@baseline.local`,
      "bobp455"
    );
    bob = bobUserToken[0];

    bearerTokens = {};
    bearerTokens[alice["id"]] = aliceUserToken[1];
    bearerTokens[bob["id"]] = bobUserToken[1];

    // FIXME -- vend unique keypair for each participant
    const natsPrivateKey =
      "-----BEGIN RSA PRIVATE KEY-----\n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\n-----END RSA PRIVATE KEY-----";
    const natsPublicKey =
      "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAullT/WoZnxecxKwQFlwE\n9lpQrekSD+txCgtb9T3JvvX/YkZTYkerf0rssQtrwkBlDQtm2cB5mHlRt4lRDKQy\nEA2qNJGM1Yu379abVObQ9ZXI2q7jTBZzL/Yl9AgUKlDIAXYFVfJ8XWVTi0l32Vsx\ntJSd97hiRXO+RqQu5UEr3jJ5tL73iNLp5BitRBwa4KbDCbicWKfSH5hK5DM75EyM\nR/SzR3oCLPFNLs+fyc7zH98S1atglbelkZsMk/mSIKJJl1fZFVCUxA+8CaPiKbpD\nQLpzydqyrk/y275aSU/tFHidoewvtWorNyFWRnefoWOsJFlfq1crgMu2YHTMBVtU\nSJ+4MS5D9fuk0queOqsVUgT7BVRSFHgDH7IpBZ8s9WRrpE6XOE+feTUyyWMjkVgn\ngLm5RSbHpB8Wt/Wssy3VMPV3T5uojPvX+ITmf1utz0y41gU+iZ/YFKeNN8WysLxX\nAP3Bbgo+zNLfpcrH1Y27WGBWPtHtzqiafhdfX6LQ3/zXXlNuruagjUohXaMltH+S\nK8zK4j7n+BYl+7y1dzOQw4CadsDi5whgNcg2QUxuTlW+TQ5VBvdUl9wpTSygD88H\nxH2b0OBcVjYsgRnQ9OZpQ+kIPaFhaWChnfEArCmhrOEgOnhfkr6YGDHFenfT3/RA\nPUl1cxrvY7BHh4obNa6Bf8ECAwEAAQ==\n-----END PUBLIC KEY-----";

    aliceApp = await baselineAppFactory(
      aliceCorpName,
      bearerTokens[alice["id"]],
      false,
      "localhost:8081",
      "nats://localhost:4222",
      natsPrivateKey,
      natsPublicKey,
      "localhost:8080",
      networkId,
      "localhost:8082",
      "localhost:4001/jsonrpc",
      "http",
      null,
      "baseline workgroup",
      null,
      "corn domain lonely owner media grape hard rough arena knock uncover goddess cinnamon wing actress spring dizzy skill alter pistol funny bind rapid soap"
    );

    bobApp = await baselineAppFactory(
      bobCorpName,
      bearerTokens[bob["id"]],
      true,
      "localhost:8085",
      "nats://localhost:4224",
      natsPrivateKey,
      natsPublicKey,
      "localhost:8086",
      networkId,
      "localhost:8083",
      "0.0.0.0:4002/jsonrpc",
      "http",
      null,
      "baseline workgroup",
      null,
      "forest step weird object extend boat ball unit canoe pull render monkey drink monitor behind supply brush frown alone rural minute level host clock"
    );

    bobApp.init();
    aliceApp.init();
  });

  describe("workgroup", () => {
    describe("creation", () => {
      before(async () => {
        await bobApp.requireWorkgroup();

        workgroup = bobApp.getWorkgroup();
        workgroupToken = bobApp.getWorkgroupToken();
      });

      it("should create the workgroup in the local registry", async () => {
        assert(workgroup, "workgroup should not be null");
        assert(workgroup.id, "workgroup id should not be null");
      });

      it("should authorize a bearer token for the workgroup", async () => {
        assert(workgroupToken, "workgroup token should not be null");
      });

      it("should deploy the ERC1820 registry contract for the workgroup", async () => {
        const erc1820RegistryContract = await bobApp.requireWorkgroupContract(
          "erc1820-registry"
        );

        assert(
          erc1820RegistryContract,
          "workgroup ERC1820 registry contract should not be null"
        );
      });

      it("should deploy the ERC1820 organization registry contract for the workgroup", async () => {
        const orgRegistryContract = await bobApp.requireWorkgroupContract(
          "organization-registry"
        );

        assert(
          orgRegistryContract,
          "workgroup organization registry contract should not be null"
        );
      });
    });

    describe("participants", () => {
      before(async () => {
        // sanity check
        assert(
          alice && bob,
          "an administrative user should have been created for each workgroup counterparty"
        );
        assert(
          Object.keys(bearerTokens).length === 2,
          "a bearer token should have been authorized for each administrative user"
        );
        assert(
          aliceApp,
          "an instance should have been initialized for Alice Corp"
        );
        assert(bobApp, "an instance should have been initialized for Bob Corp");
        assert(workgroup, "workgroup should not be null");
        assert(workgroupToken, "workgroup token should not be null");
      });

      describe("workgroup initiator", function () {
        before(async () => {
          this.ctx.app = bobApp;
        });

        describe(
          `initial workgroup organization: "${bobCorpName}"`,
          shouldBehaveLikeAnInitialWorkgroupOrganization.bind(this)
        );
        describe(
          `workgroup organization: "${bobCorpName}"`,
          shouldBehaveLikeAWorkgroupOrganization.bind(this)
        );
      });

      describe("inviting participants to the workgroup", function () {
        let inviteToken;

        before(async () => {
          this.ctx.app = aliceApp;
          inviteToken = await bobApp.inviteWorkgroupParticipant(alice.email);
          //inviteToken = await scrapeInvitationToken("bob-ident-consumer"); // if configured, ident would have sent an email to Alice
        });

        it("should have created an invite for alice", async () => {
          assert(inviteToken, "invite token should not be null");
        });

        describe("alice", function () {
          before(async () => {
            await bobApp.requireWorkgroupContract("erc1820-registry");
            await bobApp.requireWorkgroupContract("organization-registry");
            await aliceApp.acceptWorkgroupInvite(
              inviteToken,
              bobApp.getWorkgroupContractsGanache()
            );
          });

          describe(
            `invited workgroup organization: "${aliceCorpName}"`,
            shouldBehaveLikeAnInvitedWorkgroupOrganization.bind(this)
          );
          describe(
            `workgroup organization: "${aliceCorpName}"`,
            shouldBehaveLikeAWorkgroupOrganization.bind(this)
          );
          describe(
            `workgroup counterparty: "${aliceCorpName}"`,
            shouldBehaveLikeAWorkgroupCounterpartyOrganization.bind(this)
          );
        });

        describe("counterparties post-onboarding", function () {
          before(async () => {
            this.ctx.app = bobApp;
          });

          describe(
            bobCorpName,
            shouldBehaveLikeAWorkgroupCounterpartyOrganization.bind(this)
          );
        });
      });

      describe("workflow", () => {
        describe("workstep", () => {
          // For testing purposes we've condensed our current workflow in this single workstep.
          const bigInt = require("big-integer");

          let maintenanceData: Job[] = [];
          let finalSelection: any = {};

          let proofs: any[] = [];
          let commitmentMeta: CommitmentMetaData;
          let commitments: VerifierInterface[] = [];

          let shieldAddress: string;
          let verifierAddress: string;

          let supplierTToAddressMap: { [key: string]: SupplierType } = {};
          let sSuppliersMeta: SelectionMetaData[] = [];

          before(async () => {
            verifierAddress = (
              await bobApp.requireWorkgroupContract("verifier")
            ).address;
            shieldAddress = (await bobApp.requireWorkgroupContract("shield"))
              .address;
          });

          it("should extract all currently available maintenance jobs from some arbitrary data-source", async () => {
            maintenanceData = await retrieveJobs(
              ["./src/mods/extract/data/schedule.txt"],
              Priority.HIGH
            );
            assert(maintenanceData.length > 0);
          });

          it("should generate a genesis commitment based on all current maintenance data", async () => {
            // Grab the first job from the priority list:
            const job = maintenanceData[0];
            commitmentMeta = {
              shieldAddr: shieldAddress,
              verifierAddr: verifierAddress,
              state: bigInt(0),
            };

            const commitment = await bobApp.createCommitment(
              job,
              commitmentMeta
            );

            commitments.push(commitment);

            // Ensure that during this workflow we have a reference to the current (single) job.
            // @TODO::Hamza -- Just pop this off so that we can still use the other jobs later.
            maintenanceData = [job];

            // @-->>> Test thing out in this area prior to proof generation for time savings

            // #-->>>

            assert(commitment);
          });

          it("should calculate a witness and generate a proof", async () => {
            const currentCommitment = commitments[0];
            const inputs = [
              currentCommitment?.state.toString(),
              currentCommitment?.mjID.toString(),
              currentCommitment?.supplierID.toString(),
              "0",
              "0",
              "0",
              "0",
              "0",
              "0",
              currentCommitment?.nc1.toString(),
              currentCommitment?.nc2.toString(),
            ];

            const proof = await bobApp.generateProof("genesis", {
              args: inputs,
            });

            proofs.push(proof);
            assert(proof);
          });

          it("should verify that the merkle-tree is currently empty", async () => {
            const treeEntries = await bobApp.requestMgr(
              Mgr.Bob,
              "baseline_getCommits",
              [shieldAddress, 0, 5]
            );
            assert(Object.values(treeEntries).length === 0);
          });

          it("should push the commitment to the merkle tree", async () => {
            const provider = new Eth.providers.JsonRpcProvider(
              "http://0.0.0.0:8545"
            );
            const sender = (await provider.listAccounts())[2];

            const currentProof = proofs[0];

            const proof = flattenDeep([
              ...currentProof.proof.proof.a,
              ...currentProof.proof.proof.b,
              ...currentProof.proof.proof.c,
            ]).reduce(
              (old: any, current: any): any[] => [...old, hexToDec(current)],
              []
            );

            const inputs = flattenDeep(proofs[0].proof.inputs).reduce(
              (old: any, current: any): any[] => [...old, hexToDec(current)],
              []
            );

            await bobApp.requestMgr(Mgr.Bob, "baseline_verifyAndPush", [
              sender,
              shieldAddress,
              proof,
              inputs,
              concatenateThenHash(
                JSON.stringify(commitments[0], (_, key: any) =>
                  typeof key === "bigint" ? key.toString() : key
                )
              ),
            ]);

            const root = await bobApp
              .requestMgr(Mgr.Bob, "baseline_getRoot", [shieldAddress])
              .then((res: any) => res.toString());

            assert(
              root.toString() !==
                "0x0000000000000000000000000000000000000000000000000000000000000000",
              "Root should not be null after insertion."
            );
          });

          it("should update Alice's merkle-tree", async () => {
            const treeEntries = await aliceApp.requestMgr(
              Mgr.Alice,
              "baseline_getCommits",
              [shieldAddress, 0, 5]
            );

            assert(
              treeEntries.length > 0,
              "Alice's merkle tree should not be empty after Bob's insertion."
            );
          });

          // @TODO should ensure that Alice is able to rebuild commitment
          // it(...

          it("should determine which suppliers to contact for the currently selected maintenance job", async () => {
            // reqExpander returns an array of all needed supplier types.
            // In this test-suite we're assuming that Alice is always the correct and only supplier.
            const expReqs = reqExpander(maintenanceData);
            const counterParties = bobApp.getWorkgroupCounterparties();

            assert(
              Object.keys(expReqs).length > 0,
              "This job has no required suppliers."
            );
            assert(
              counterParties.length > 0,
              "This workgroup has no counterparties."
            );

            // Assuming that we have a single counterparty
            supplierTToAddressMap = {
              [counterParties[0]]: Object.values(expReqs)[0][0],
            };

            assert(
              Object.keys(supplierTToAddressMap).length > 0,
              "No mapping between an address and a supplier type could be found."
            );
          });

          // Send MJCont to Supplier
          it("should send the initiating availability request to the suppliers", async () => {
            const uuid4 = require("uuid4");
            for (const [supplier, stype] of Object.entries(
              supplierTToAddressMap
            )) {
              console.log(
                `Sending Availability check to ${supplier} of type ${stype}`
              );
              await bobApp.sendProtocolMessage(supplier, Opcode.Availability, {
                MJ: {
                  id: `${uuid4()}`,
                  date: `${new Date().toDateString()}`,
                  name: `Avail-001`,
                  intention: Intention.Request,
                  mj: { data: JSON.stringify(maintenanceData[0]) },
                  meta: { data: JSON.stringify(commitmentMeta) },
                },
              });

              await promisedTimeout(20000);
            }
          });

          it("should wait for some time to receive all responses from all suppliers", async () => {
            // In this case we'd have a base threshold which we would need to pass
            // in order to actually start this maintenance job since we genrally also
            // want to generate additional supplier sets in case something goes wrong
            // with the first generated set.

            // Assert that we have all needed supplier for this job.
            const canStart = jobCanBeStarted(
              maintenanceData[0],
              bobApp.getAvailableSuppliers()
            );

            assert(canStart);
          });

          it("should generate an optimal selection after receiving all parties' availability", async () => {
            const { reqs } = maintenanceData[0] || undefined;

            assert(reqs, "requirements should not be undefined.");

            // Flatten the suppliers into a single array and change their ID to the supplier's Address
            // @-->>> TODO::Hamza- Change the ID by default to the address of the supplier.
            const condensedSuppliers = Object.entries(
              bobApp.getAvailableSuppliers()
            ).reduce((prev: any, curr: any) => {
              curr[1]["_content"]["supplierId"] = curr[0];
              return [...prev, curr[1]];
            }, []);

            // Find out which suppliers have overlapping days.
            const [overlapContainer, overlapMetadata] = findOverlappingDay(
              partitionSuppliers(condensedSuppliers)
            );

            // Based on the available overlapping suppliers, generate unique sets.
            const uniqueSets = createUniqueSets(overlapContainer);

            // Time to get the optimal supplier set.
            //{
            //	"supplierSet": [
            //		"0xeED96d28a73623833C3a584253096cdf051a74aD"
            //	],
            //		"totalPrice": 1520,
            //		"averageRating": 4
            //}
            const finalSet = formatUniqueSets(
              uniqueSets,
              overlapMetadata,
              reqs
            );

            finalSelection = finalSet;

            assert(finalSelection.supplierSet.length >= 1);
          });

          it("should generate a selection commitment for each selected supplier", async () => {
            // TODO:: Also notify the people NOT selected.
            const selectedSuppliers = finalSelection.supplierSet;
            const provider = new Eth.providers.JsonRpcProvider(
              "http://0.0.0.0:8545"
            );
            const sender = (await provider.listAccounts())[2];

            for (const supplier of selectedSuppliers) {
              let currentLeaf = 0;
              let currentHash = (
                await bobApp.requestMgr(Mgr.Bob, "baseline_getCommit", [
                  shieldAddress,
                  currentLeaf,
                ])
              ).hash;

              let convertedHash = bigInt(
                currentHash.substr(2, currentHash.length),
                16
              ).toString();

              const convertedA = convertedHash.substr(
                0,
                convertedHash.length / 2
              );
              const convertedB = convertedHash.substr(
                convertedHash.length / 2,
                convertedHash.length
              );
              const commitment = await bobApp.createCommitment(
                maintenanceData[0],
                {
                  shieldAddr: commitmentMeta.shieldAddr,
                  verifierAddr: commitmentMeta.verifierAddr,
                  state: bigInt(1),
                },
                currentLeaf,
                {
                  id: maintenanceData[0].id,
                  supplierID: bigInt(supplier.substr(2, supplier.length), 16),
                  docHash1: bigInt(0),
                  docHash2: bigInt(0),
                  contractH1: bigInt(0),
                  contractH2: bigInt(0),
                }
              );

              const tempArgs = [
                commitment?.state.toString(),
                commitment?.mjID.toString(),
                commitment?.supplierID.toString(),
                "0",
                "0",
                "0",
                "0",
                convertedA,
                convertedB,
                commitment?.nc1.toString(),
                commitment?.nc2.toString(),
              ];

              const tempProof = await bobApp.generateProof("genesis", {
                args: tempArgs,
              });

              const tempProofFlat = flattenDeep([
                ...tempProof.proof.proof.a,
                ...tempProof.proof.proof.b,
                ...tempProof.proof.proof.c,
              ]).reduce(
                (old: any, current: any): any[] => [...old, hexToDec(current)],
                []
              );

              const tempProofFlatInputs = flattenDeep(
                tempProof.proof.inputs
              ).reduce(
                (old: any, current: any): any[] => [...old, hexToDec(current)],
                []
              );

              await bobApp.requestMgr(Mgr.Bob, "baseline_verifyAndPush", [
                sender,
                shieldAddress,
                tempProofFlat,
                tempProofFlatInputs,
                concatenateThenHash(
                  JSON.stringify(commitment, (_, key: any) =>
                    typeof key === "bigint" ? key.toString() : key
                  )
                ),
              ]);

              sSuppliersMeta.push({
                leafIndex: currentLeaf,
                selectionRange: [1, selectedSuppliers.length],
                selectedAddress: supplier,
              });

              currentLeaf = currentLeaf++;
            }

            assert(
              sSuppliersMeta.length > 0,
              "No metadata has been prepared for the selected suppliers."
            );
          });

          //it("should notify the suppliers' selection status", async () => {
          ////    The supplier can rebuild the commitment for verification purposes
          ////    in the following format:
          ////
          ////    Job,
          ////    { shieldAddr, verifierAddr, 1 },
          //// 		message.leafIndex,
          ////    { Job.id, bigInt(myAddress, 16), bigInt(0), bigInt(0), bigInt(0), bigInt(0) }

          //// @TODO -->>> Hamza -- Create new OpCode for notifying other parties.
          //for (const supplier of sSuppliersMeta) {
          //await bobApp.sendProtocolMessage(supplier.selectedAddress, Opcode.Availability, {
          //NS: supplier
          //});
          //}
          //});
        });
      });
    });
  });
});
