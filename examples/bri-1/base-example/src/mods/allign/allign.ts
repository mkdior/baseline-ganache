import {
  Structure,
  FileStructure,
  SupplierType,
  OverlapContainer,
  SupplierPreferenceData,
  ReqContent,
} from "../types";
import { combineArrays } from "../../utils/utils";

// 1. For each supplier category:
// Open folder of received information
// Store information of supplier in data object.
// Example: SupPool['ports'] = {[id: Port1, rate: 5, price: 12, AVA: [1,4,5]], [id: Port 3...]
// Result is: SupPool['spares'], SupPool['vessel'], SupPool['tech'], SupPool['ports']
export const partitionSuppliers = (suppliers: FileStructure[]): Structure => {
  let folderStructure: Structure = {
    Ports: [],
    Spares: [],
    Technicians: [],
    Vessels: [],
  };

  for (const supp of suppliers) {
    switch (supp._type) {
      case SupplierType.PORT: {
        folderStructure.Ports.push(supp);
        break;
      }
      case SupplierType.VESSEL: {
        folderStructure.Vessels.push(supp);
        break;
      }
      case SupplierType.SPARE: {
        folderStructure.Spares.push(supp);
        break;
      }
      case SupplierType.TECHNICIAN: {
        folderStructure.Technicians.push(supp);
        break;
      }
      default: {
        throw "Not implemented";
      }
    }
  }

  return folderStructure;
};

// 2. Find lowest value in all AVA arrays (earliest convenience = earlyc)
// Check for that value if it is shared by all other categories
// If not, do earlyc+1 and check again untill earlyc<=(latest day of timewindow-tasklength)
// If a overlappig day is found: eachCat = True
// Else: Print "no overlapping day could be found" -> abort / restart process with extended timewindow

export const findOverlappingDay = (
  sortedSupp: Structure
): [OverlapContainer, SupplierPreferenceData] => {
  let sets: OverlapContainer = {};
  let preferenceSets: SupplierPreferenceData = {};

  const minNum = Object.values(sortedSupp).reduce(
    (pVal: any, cVal: any) => (cVal.length > 0 ? pVal + 1 : pVal + 0),
    0
  );

  // Time window states that there must be a job done with length N between time_window 0 and 1
  for (const [category, supplierSet] of Object.entries(sortedSupp)) {
    for (const supplier of supplierSet) {
      for (let day of supplier._content.supplierAvailability) {
        // Days are not set to indices, they're set to their actual day value.
        if (day > 0) {
          // First set the current supplier's available day, make sure it's added to the entries
          sets = {
            ...{
              ...sets,
            },
            [day]: {
              ...{
                ...sets[day],
              },
              [category]: [],
            },
          };
        }
      }
    }
  }

  // For each entry in sets, place current supplier's availability
  for (const [key, day] of Object.entries(sets)) {
    // For each day listed in our sets,
    // Go, again, through each supplierset
    for (const [_, supplierSet] of Object.entries(sortedSupp)) {
      for (const supplier of supplierSet) {
        if (supplier._content.supplierAvailability[parseInt(key) - 1]) {
          preferenceSets = {
            ...{
              ...preferenceSets,
            },
            [supplier._content.supplierId]: {
              supplierCost: supplier._content.supplierCost,
              supplierReputation: supplier._content.supplierReputation,
              supplierType: supplier._type,
            },
          };

          switch (supplier._type) {
            case SupplierType.PORT: {
              sets[parseInt(key)]["Ports"].push(supplier._content.supplierId);
              break;
            }
            case SupplierType.SPARE: {
              sets[parseInt(key)]["Spares"].push(supplier._content.supplierId);
              break;
            }
            case SupplierType.TECHNICIAN: {
              sets[parseInt(key)]["Technicians"].push(
                supplier._content.supplierId
              );
              break;
            }
            case SupplierType.VESSEL: {
              sets[parseInt(key)]["Vessels"].push(supplier._content.supplierId);
              break;
            }
          }
        }
      }
    }
  }

  // Time to go through the days and see if we actually have sets of suppliers of the correct size.
  // This is where it might become apparant that we dont have enough suppliers for a given task.
  const viableResultFilter = dayReducer(sets, minNum);
  const finalResult =
    Object.keys(viableResultFilter).length > 0
      ? {
          [Object.keys(viableResultFilter)[0]]:
            viableResultFilter[parseInt(Object.keys(viableResultFilter)[0])],
        }
      : {};

  return [finalResult, preferenceSets];
};

const dayReducer = (
  totalSet: OverlapContainer,
  min: number
): OverlapContainer => {
  // First loop through all days
  let reducedTotalSet: OverlapContainer = {};

  for (const [day, suppliers] of Object.entries(totalSet)) {
    if (Object.values(suppliers).length === min) {
      reducedTotalSet = {
        ...{
          ...reducedTotalSet,
        },
        [day]: suppliers,
      };
    }
  }

  return reducedTotalSet;
};

// 3. For the found earlyC, find the matching supplierIDs
// Create all possible, unique subsets
export const createUniqueSets = (coreSet: OverlapContainer): string[][] => {
  // Make sure we are working with a single entry
  if (Object.keys(coreSet).length === 0 || Object.keys(coreSet).length > 1)
    return [];

  // Grab the current day we're working with now
  const currentDay = Object.keys(coreSet)[0];

  // Grab all the suppliers listed under currentDay
  const cSuppliers = coreSet[parseInt(currentDay)];

  // If we reach this point it means we need to start generating all
  // unique subsets for all our suppliers.
  let tempContainer: string[][] = [];

  for (let supplierArray of Object.values(cSuppliers)) {
    tempContainer.push(supplierArray);
  }

  // Time to generate the unique sets of suppliers.
  let uniqueSets: string[][] = combineArrays(tempContainer);

  return uniqueSets;
};

// 4. For the matching supplierIDs, find price and rating
// Calculate for each subset:
// 	Total price based on tasklen
//  Amount of tech and spares.
//  Average rating.
export const formatUniqueSets = (
  uniqueSetIds: string[][],
  metaDict: SupplierPreferenceData,
  mjReqs: ReqContent
): any => {
  let optimalContainer: {
    supplierSet: string[];
    totalPrice: number;
    averageRating: number;
  }[] = [];

  // console.log(`\n------------------`);
  // console.log(`${JSON.stringify(mjReqs, undefined, 2)}`);
  // console.log(`------------------`);

  for (const supSet of uniqueSetIds) {
    // Each supSet contains multiple IDS of our needed suppliers
    // Loop through these too and calculate:
    // Total price based on tasklength
    // Average rating
    // Tech  -- tasklen*#oftech*8*price
    // Spares -- price * unit
    // Vesel -- price*unit*tasklen
    // Port -- price
    let setPrice: number = 0;
    let setRep: number = 0;

    supSet.map((id: any) => {
      let currentMeta = metaDict[id] || [];
      setRep += currentMeta.supplierReputation;
      switch (currentMeta.supplierType) {
        // Some calculations may contain a (n * 1) operation.
        // This is simply a placeholder for the supplier's unit.
        case SupplierType.PORT: {
          setPrice += currentMeta.supplierCost;
          break;
        }
        case SupplierType.SPARE: {
          setPrice += currentMeta.supplierCost * 1;
          break;
        }
        case SupplierType.TECHNICIAN: {
          setPrice +=
            currentMeta.supplierCost * 8 * mjReqs.tech * mjReqs.taskLength;
          break;
        }
        case SupplierType.VESSEL: {
          setPrice += currentMeta.supplierCost * 1 * mjReqs.taskLength;
          break;
        }
      }
    });

    let avgdReputation = setRep / supSet.length;
    optimalContainer.push({
      supplierSet: supSet,
      totalPrice: setPrice,
      averageRating: avgdReputation,
    });
  }

  // @TODO::HAMZA Create a new function here which returns either the cheapest or best reputable
  // subset. Discuss with Yang how to implement this.
  return optimalContainer[0];
};

// 5. Return earlyC/startday, cheapestset and determine bestset
//For example: Cheapest subset: [[id:'Port3',amount:1,price:12],[id:'Spares2',amount:1,price:12],[id:'Techs21', amount:12, price: 100], [id:'Vessel25', amount:1, price:1120], 531400, 4.75]]
