import { gql } from "@apollo/client";
import { CsvFragment } from './fragments';

export const CSV_STATUS_SUBSCRIPTION = gql`
	subscription onCsvStatus($id:ID!) {
		csvStatus(id:$id) {
			...CsvFragment
		}
	}
	${CsvFragment}
`

export const CSV_CHANGED_SUBSCRIPTION = gql`
	subscription onCsvChanged {
		csvChanged {
			success
			message
			changeType
			csv {
				...CsvFragment
			}
		}
	}
	${CsvFragment}
`