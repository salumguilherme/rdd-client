import { gql } from "@apollo/client";
import { CsvFragment, ClientFragment } from './fragments';

export const GET_CSVS_QUERY = gql`
    query getLists {
        csvs {
            success
            code
            message
            csvs {
                ...CsvFragment
            }
        }
        clients {
            success
            clients {
               ...ClientFragment
            }
        }
    }
    
    ${CsvFragment}
    ${ClientFragment}
`

export const GET_CSV_QUERY = gql`
	query getList($id:ID!) {
		csv(id:$id) {
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

export const GET_CLIENTS_QUERY = gql`	
	query GetClients {
		clients {
			success
			clients {
                ...ClientFragment
            }
		}
	}
	${ClientFragment}
`;