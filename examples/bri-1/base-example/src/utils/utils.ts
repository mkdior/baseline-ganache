import { SupplierType, Contents } from "../mods/types";

export let fileReader = async (
  fileName: string,
  fileTag?: SupplierType
): Promise<Contents> => {
  const fs = require("fs");
  try {
    const fileContents = fs.readFileSync(fileName, {
      encoding: "utf-8",
    });

    if (fileContents && fileTag) {
      return Promise.resolve({
        fileContents: fileContents,
        fileTag: fileTag,
      } as Contents);
    } else if (fileContents) {
      return Promise.resolve({
        fileContents: fileContents,
      } as Contents);
    }
  } catch (err) {
    console.log(
      `Error while reading file under the name: ${fileName}. \n Error: ${err}`
    );
    return Promise.reject(err);
  }
  return Promise.reject("");
};

// https://stackoverflow.com/a/51470002/9911187
export const combineArrays = (array_of_arrays: any): any => {
  // First, handle some degenerate cases...

  if (!array_of_arrays) {
    // Or maybe we should toss an exception...?
    return [];
  }

  if (!Array.isArray(array_of_arrays)) {
    // Or maybe we should toss an exception...?
    return [];
  }

  if (array_of_arrays.length == 0) {
    return [];
  }

  for (let i = 0; i < array_of_arrays.length; i++) {
    if (!Array.isArray(array_of_arrays[i]) || array_of_arrays[i].length == 0) {
      // If any of the arrays in array_of_arrays are not arrays or zero-length, return an empty array...
      return [];
    }
  }

  // Done with degenerate cases...

  // Start "odometer" with a 0 for each array in array_of_arrays.
  let odometer = new Array(array_of_arrays.length).fill(0);

  let output: any = [];

  let newCombination = formCombination(odometer, array_of_arrays);

  output.push(newCombination);

  while (odometer_increment(odometer, array_of_arrays)) {
    newCombination = formCombination(odometer, array_of_arrays);
    output.push(newCombination);
  }

  return output;
}; /* combineArrays() */

// Translate "odometer" to combinations from array_of_arrays
const formCombination = (odometer: any, array_of_arrays: any): any => {
  return odometer.reduce(
    (accumulator: any, odometer_value: any, odometer_index: any) => {
      return [...accumulator, array_of_arrays[odometer_index][odometer_value]];
    },
    []
  );
}; /* formCombination() */

const odometer_increment = (odometer: any, array_of_arrays: any): any => {
  for (
    let i_odometer_digit = odometer.length - 1;
    i_odometer_digit >= 0;
    i_odometer_digit--
  ) {
    let maxee = array_of_arrays[i_odometer_digit].length - 1;

    if (odometer[i_odometer_digit] + 1 <= maxee) {
      // increment, and you're done...
      odometer[i_odometer_digit]++;
      return true;
    } else {
      if (i_odometer_digit - 1 < 0) {
        // No more digits left to increment, end of the line...
        return false;
      } else {
        // Can't increment this digit, cycle it to zero and continue
        // the loop to go over to the next digit...
        odometer[i_odometer_digit] = 0;
        continue;
      }
    }
  } /* for( let odometer_digit = odometer.length-1; odometer_digit >=0; odometer_digit-- ) */
}; /* odometer_increment() */

//Helper functies to handle bignumbers
export const bnToBuf = (bn: any): Uint8Array => {
	const bigInt = require("big-integer");
  var hex = bigInt(bn).toString(16);
  if (hex.length % 2) {
    hex = "0" + hex;
  }

  var len = hex.length / 2; //of 16
  var u8 = new Uint8Array(len); //zoals hier

  var i = 0;
  var j = 0;
  while (i < len) {
    u8[i] = parseInt(hex.slice(j, j + 2), 16);
    i += 1;
    j += 2;
  }

  //when input is single/small value/smallerthan128bit fill unit8array with zeros and paste input at the end of array
  if (bn.length <= 32) {
    var testa = new Uint8Array(16).fill(0);
    for (let i = 0; i < u8.length; i++) {
      testa[15 - i] = u8[u8.length - i - 1];
    }
  } else var testa = u8;

  return testa;
};
