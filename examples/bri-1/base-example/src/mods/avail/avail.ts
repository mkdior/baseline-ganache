import { fileReader } from "../../utils/utils";
import {
  Structure,
  FileStructure,
  FileContentStructure,
  SupplierType,
  Contents,
} from "../types";

// Current test values, these are supposed to be sourced from
// a single source of truth.

const fileImporter = async (folders: string[]) => {
  const fs = require("fs");
  if (folders.length === 0) Promise.reject("0x0");

  // Queue all our contents for later processing
  let contentQueue: Promise<Contents>[] = [];
  await new Promise(async (resolve: any, reject: any) => {
    for (const folder of folders) {
      // Loop through all folders
      await new Promise((resolve: any, reject: any) => {
        fs.readdir(`moduleAvail/${folder}`, (error: any, files: any) => {
          if (error) reject(error);
          if (files) {
            for (const file of files) {
              // Request file information of each file
              switch (folder) {
                case "ports": {
                  contentQueue.push(
                    fileReader(
                      `moduleAvail/${folder}/${file}`,
                      SupplierType.PORT
                    )
                  );
                  break;
                }
                case "spares": {
                  contentQueue.push(
                    fileReader(
                      `moduleAvail/${folder}/${file}`,
                      SupplierType.SPARE
                    )
                  );
                  break;
                }
                case "technicians": {
                  contentQueue.push(
                    fileReader(
                      `moduleAvail/${folder}/${file}`,
                      SupplierType.TECHNICIAN
                    )
                  );
                  break;
                }
                case "vessels": {
                  contentQueue.push(
                    fileReader(
                      `moduleAvail/${folder}/${file}`,
                      SupplierType.VESSEL
                    )
                  );
                  break;
                }
                default: {
                  throw "Are you sure you're passing in the right folder name?";
                  break;
                }
              }
            }
            resolve(contentQueue);
          }
        });
      });
    }
    resolve(contentQueue);
  });
  return contentQueue;
};

let suitabilityFinder = (
  suppInfo: number[],
  timeWindow: number[],
  taskLength: number
): number[] => {
  // TODO::(Hamza) --> Move this into its own function :)
  // Perform availability calculation and save result in either the "ERP" system or temp storage.
  if (!suppInfo) {
    return new Array(30).fill(0);
  }
  let keys_of_interest: Array<number> = new Array(30).fill(0);

  loop1: for (var [index, day] of suppInfo.entries()) {
    // We only care about the days starting from the start date
    if (index >= timeWindow[0] - 1) {
      // From starting day; check for each date if we have an available day
      if (Number(day) !== 0) {
        // If available day is found, start looping from now into the future untill we hit
        // the task_length cap -- ci = current index
        loop2: for (let ci = index; ci != index + Number(taskLength); ci++) {
          // Don't start day checks for task lengths which are too long for our current calendar.
          if (
            index + Number(taskLength) >= suppInfo.length ||
            index + Number(taskLength) >= timeWindow[1]
          ) {
            break loop2;
          }

          // Stop counting available days if we hit a 0.
          if (Number(suppInfo[ci]) === 0) {
            break loop2;
          }

          // For current index + n, incerement its index.
          keys_of_interest[index] += 1;
        }
      }
    }
  }

  let indices_available: Array<number> = [];
  let final_availability: Array<number> = new Array(30).fill(0);

  // Now check if we've encountered any days with enough available days in succession.
  // If yes, add them to the indices_available array.
  for (let i = 0; i < keys_of_interest.length; i++) {
    if (keys_of_interest[i] == taskLength) {
      indices_available.push(i);
    }
  }

  // For each available index, set the corresponding day to true.
  for (var a of indices_available) {
    final_availability[a] = a + 1;
  }
  return final_availability;
};

const supplierResolver = (suppliers: SupplierType[]): string[] => {
  // Pretend like you didn't see this one.
  return suppliers.reduce(
    (pVal: any, cVal: any) => [
      ...pVal,
      SupplierType[cVal].toLocaleLowerCase() + "s",
    ],
    []
  );
};

export const requestAvailability = async (
  suppliers: SupplierType[],
  timeWindow: number[],
  taskLength: number
): Promise<FileStructure[]> => {
  // Retrieve all file contents, this is an array of promises.
  const folderInfo = await fileImporter(supplierResolver(suppliers));

  let suppFormatted: FileStructure[] = [];

  if (folderInfo.length === 0) return Promise.reject();

  // Work on the values
  await Promise.all(folderInfo).then(async (res: Contents[]) => {
    new Promise((resolve, reject) => {
      res.map((entry: Contents) => {
        // @TODO Reformat this so that suitabilityFinder only accepts an array of days.
        const entryTag: SupplierType = entry.fileTag;
        // entryData in its raw form:
        // '0,0,0,4,5,6,7,0,0,0,11,12,13,14,15,16,17,0,0,0,0,22,23,24,25,26,27,0,0,0\n
        // 4\n
        // 140000\n
        // Vessel25'
        let entryData: string = entry.fileContents.split("\n");
        //FileContentStructure
        let entryAvailability = suitabilityFinder(
          entryData[0].split(",").map((day: string) => parseInt(day) || 0),
          timeWindow,
          taskLength
        );

        // Reconstruct our new object with our actual availability entryData
        // supplierId: string;
        // supplierCost: number;
        // supplierReputation: number;
        // supplierAvailability: number[];
        const tempFCS: FileContentStructure = {
          supplierId: entryData[3],
          supplierCost: parseInt(entryData[2]) || -1,
          supplierReputation: parseInt(entryData[1]) || -1,
          supplierAvailability: entryAvailability,
        };

        suppFormatted.push({
          _type: entryTag,
          _metaData: {
            timeWindow: timeWindow,
            taskLength: taskLength,
          },
          _content: tempFCS,
        } as FileStructure);
      });
      // Formatted all our suppliers, let's send it back and return it for further processing.
      resolve(suppFormatted);
    }).then((e: any) => {
      Promise.resolve(suppFormatted);
    });
  });

  return suppFormatted;
};
