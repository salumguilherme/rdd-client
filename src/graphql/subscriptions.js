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