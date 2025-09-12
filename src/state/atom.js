import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import moment from 'moment';



// Auth Token
export const rawTokenAtom = atom(localStorage.getItem('authToken'));
export const tokenAtom = atom((get) => {
	const token = get(rawTokenAtom);
	if(!token) return null;

	let tokenData;

	try {
		tokenData = JSON.parse(token);
	} catch (e) {
		return null;
	}

	const expire = moment(tokenData.expires);
	const now = moment();
	if(expire.diff(now) <= 0) {
		return null;
	}
	return tokenData.token;
}, (get, set, newToken) => {

	// If no new token - logging out
	if(!newToken) {
		localStorage.removeItem('authToken');
		set(rawTokenAtom, false);
	} else {
		localStorage.setItem('authToken', JSON.stringify(newToken));
		set(rawTokenAtom, JSON.stringify(newToken));
	}
});



// App State atoms
export const appPageAtom = atom('csvs-list');
export const appCsvListFilterStatus = atom([]);
export const appCsvListFilterType = atom([]);
export const appCsvListFilterClient = atom([]);



// State for our lists
export const csvHasFetched = atom(false);
const _csvListAtom = atom([]);
export const csvAtomFamily = atomFamily((csv) => atom(csv), (a, b) => a.id === b.id);
export const csvListAtom = atom(get => get(_csvListAtom), (get, set, newList) => {
	// Sets the _csvList
	set(_csvListAtom, newList.map(items => items.id));
});
export const exclusionSelectCsvsAtom = atom(get => {
	return get(_csvListAtom).filter(csvId => {
		// Only return exclusion and phone list csvs
		const csv = get(csvAtomFamily({ id: csvId }));
		return csv.csvType !== 'PingList';
	}).map(csvId => {
		const csv = get(csvAtomFamily({ id: csvId }));
		return {
			label: csv.name,
			value: csv.id,
		}
	});
});

// Atom to add a new Csv to our list - SETTER
export const addCsvListAtom = atom(null, (get, set, newCsv) => {

	console.log('Adding new list Id', newCsv.id);

	const listOfIds = get(_csvListAtom);

	// Adds to the lsit
	set(_csvListAtom, [
		newCsv.id,
		...listOfIds
	]);

	// Adds the family
	set(csvAtomFamily({ id: newCsv.id }), newCsv);
});

// Atom to delete a CSV from our state list and family - SETTER
export const deleteCsvListAtom = atom(null, (get, set, csvId) => {
	console.log('removing list id '+csvId);
	const listOfIds = get(_csvListAtom);
	set(_csvListAtom, listOfIds.filter(itemId => itemId !== csvId));
	// Delete atom family
	csvAtomFamily.remove({ id: csvId });
});

// Updates a CSV list atom
export const updateCsvListAtom = atom(null, (get, set, newCsv) => {
	set(csvAtomFamily({ id: newCsv.id }), newCsv);
})

// Filtered atom list
export const filteredCsvListAtom = atom(get => {

	// Filter by type
	const byType = get(appCsvListFilterType);
	const byStatus = get(appCsvListFilterStatus);
	const byClient = get(appCsvListFilterClient);

	// TODO sorting by status etc

	// No filters set return the whole list
	if(!byType && !byStatus && !byClient) {
		return get(_csvListAtom);
	}

	// Filters the list
	return get(_csvListAtom).filter(csvId => {

		const csv = get(csvAtomFamily({ id: csvId }));

		if(byType.length > 0 && byType.indexOf(csv.csvType) < 0) {
			return false;
		}

		if(byStatus.length > 0 && byStatus.indexOf(csv.jobStatus) < 0) {
			return false;
		}

		// If we have unassigned and client has no clients
		if(byClient.length > 0 && byClient.indexOf('__not') >= 0 && !csv.client) {
			return true;
		}

		if(byClient.length > 0 && (!csv.client || byClient.indexOf(csv.client.id) < 0)) {
			return false;
		}

		return true;

	});

});

export const csvReportTableDataAtom = atom(get => {
	return get(filteredCsvListAtom).map(csvId => {
		const csv = get(csvAtomFamily({ id: csvId }));
		return {
			key: csv.id,
			name: csv.name,
			maxRows: csv.maxRows,
			connectedRows: csv.connectedRows,
			jobStatus: csv.jobStatus == 'Pending' ? 'processing' : csv.jobStatus.toLowerCase(),
			csvType: csv.csvType,
			processRows: csv.processRows,
			postRequestCount: csv.postRequestCount
		}
	});
})


// State for our clients
export const clientHasFetchedAtom = atom(false);
const _clientListAtom = atom([]);
export const clientAtomFamily = atomFamily((client) => atom(client), (a, b) => a.id === b.id);
export const clientListAtom = atom(get => get(_clientListAtom), (get, set, newList) => {
	// Set list ID
	set(_clientListAtom, newList.map(items => items.id));
	for(const client of newList) {
		set(clientAtomFamily(client), client);
	}
});
export const clientSelectOptionsAtom = atom(get => {
	
	const clientList = get(_clientListAtom);

	return clientList.map(clientId => {
		const client = get(clientAtomFamily({ id: clientId }));
		return {
			value: client.id,
			label: client.name,
		}
	});
});

// Updates a client atom family
export const clientUpdateAtomFamily = atom(null, (get, set, clientUpdate) => {
	set(clientAtomFamily({ id: clientUpdate.id }), clientUpdate);
});

export const clientListAtomRemove = atom(null, (get, set, id) => {
	const clientList = get(_clientListAtom).filter(item => item !== id);
	set(_clientListAtom, clientList);
	clientAtomFamily.remove({ id });
});