import { gql } from "@apollo/client";

export const CsvFragment = gql`
	fragment CsvFragment on Csv {
        id
        name
        url
        client {
            id
            name
        }
        user {
            id
            name
            email
            role
        }
        csvType
        excludedIpsos
        excludedTemp
        exclusionList {
            id
            processed
            csv {
                id
	            name
            }
        }
        batchSize
        jobStatus
        processRows
        ignoreExclusion
        connectedRows
        maxRows
        totalRows
        createdAt
        updatedAt
        errorMessage
		statusMessage
		percentage
        postRequestCount
	}
`

export const ClientFragment = gql`
	fragment ClientFragment on Client {
        id
        name
        csvs {
            id
        }
	}
`