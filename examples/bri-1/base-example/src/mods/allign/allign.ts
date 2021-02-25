import { Structure, FileStructure, SupplierType } from "../types";
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
		Vessels: []
	};

	for (const supp of suppliers) {
		switch (supp._type) {
			case SupplierType.PORT: { folderStructure.Ports.push(supp); break; };
			case SupplierType.VESSEL: { folderStructure.Vessels.push(supp); break; }
			case SupplierType.SPARE: { folderStructure.Spares.push(supp); break; };
			case SupplierType.TECHNICIAN: { folderStructure.Technicians.push(supp); break; };
			default: { throw ("Not implemented") };
		}
	}

	return folderStructure;
};

// 2. Find lowest value in all AVA arrays (earliest convenience = earlyc)
// Check for that value if it is shared by all other categories
// If not, do earlyc+1 and check again untill earlyc<=(latest day of timewindow-tasklength)
// If a overlappig day is found: eachCat = True
// Else: Print "no overlapping day could be found" -> abort / restart process with extended timewindow
export const findOverlappingDay = (sortedSupp: Structure) => {
	let sets: { [key: number]: { [key: string]: string[] } } = {};

	// Time window states that there must be a job done with length N between time_window 0 and 1
	for (const [category, supplierSet] of Object.entries(sortedSupp)) {

		for (const supplier of supplierSet) {

			for (let day of supplier._content.supplierAvailability) {
				// Days are not set to indices, they're set to their actual day value.
				if (day > 0) {
					// First set the current supplier's available day, make sure it's added to the entries
					sets = {
						...{
							...sets
						},
						[day]: {
							...{
								...sets[day]
							},
							[category]: []
						}
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
					switch (supplier._type) {
						case SupplierType.PORT: {
							sets[parseInt(key)]["Ports"].push(supplier._content.supplierId);
							break;
						};
						case SupplierType.SPARE: {
							sets[parseInt(key)]["Spares"].push(supplier._content.supplierId);
							break;
						};
						case SupplierType.TECHNICIAN: {
							sets[parseInt(key)]["Technicians"].push(supplier._content.supplierId);
							break;
						};
						case SupplierType.VESSEL: {
							sets[parseInt(key)]["Vessels"].push(supplier._content.supplierId);
							break;
						};
					}
				}
			}
		}
	}
};

// 3. For the found earlyC, find the matching supplierIDs
// Create all possible, unique subsets
export const createUniqueSets = () => {

};

// 4. For the matching supplierIDs, find price and rating
// Calculate for each subset: 
// 	Total price based on tasklen
//  Amount of tech and spares.
//  Average rating.
export const formatUniqueSets = () => {

};

// 5. Return earlyC/startday, cheapestset and determine bestset
//For example: Cheapest subset: [[id:'Port3',amount:1,price:12],[id:'Spares2',amount:1,price:12],[id:'Techs21', amount:12, price: 100], [id:'Vessel25', amount:1, price:1120], 531400, 4.75]]