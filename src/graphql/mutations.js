import { gql } from "@apollo/client";
import { CsvFragment, ClientFragment } from './fragments';

export const RESTART_CSV_MUTATION = gql`
    mutation restartCsvList($id:ID!, $forceGet:Boolean) {
        restartCsv(id:$id, forceGet:$forceGet) {
            success
            message
            code
            csv {
                ...CsvFragment
            }
        }
    }

    ${CsvFragment}
`

export const CHANGE_STATUS_CSV_MUTATION = gql`
	mutation changeStatusCsvList($id:ID!,$jobStatus:String!) {
        updateCsv(id:$id, jobStatus:$jobStatus) {
			success
			message
			code
			csv {
				...CsvFragment
			}
		}
	}
	
	${CsvFragment}
`

export const UPDATE_CSV_DATA_MUTATION = gql`
    mutation updateCsvData($id:ID!,$name:String,$maxRows:Int,$client:ID,$batchSize:Int) {
        updateCsv(id:$id,name:$name,maxRows:$maxRows,client:$client,batchSize:$batchSize) {
            success
            code
            message
            csv {
                ...CsvFragment
            }
        }
    }
    ${CsvFragment}
`

export const PAUSE_CSV_MUTATION = gql`
	mutation pauseCsvList($id:ID!) {
		pauseCsv(id:$id) {
			success
			message
			code
			csv {
				...CsvFragment
			}
		}
	}
	${CsvFragment}
`

export const ADD_CSV_MUTATION = gql`
	mutation addCsvMutation($url: String!, $maxRows:Int, $exclusionList:[ID], $type:String, $batchSize: Int, $client:ID, $name:String, $excludeFromClient: Boolean) {
		addCsv(url:$url,maxRows:$maxRows,exclusionList:$exclusionList,client:$client,batchSize:$batchSize,name:$name,excludeFromClient:$excludeFromClient,type:$type) {
			success
			code
			message
			csv {
				...CsvFragment
			}
			client {
				...ClientFragment
			}
        }
	}
	${CsvFragment}
	${ClientFragment}
`

export const DELETE_CSV_MUTATION = gql`
	mutation deleteCsvMutation($id: ID!) {
		deleteCsv(id:$id) {
			success
			code
			message
		}
	}
`

export const ADD_CLIENT_MUTATION = gql`
	mutation addClient($name:String!) {
		addClient(name:$name) {
			success
			message
			code
			client {
				...ClientFragment
			}
		}
	}
	${ClientFragment}
`

export const DELETE_CLIENT_MUTATION = gql`
	mutation deleteClient($id: ID!) {
		deleteClient(id: $id) {
			success
		}
	}
`;