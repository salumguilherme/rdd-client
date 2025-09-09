import { useMutation, useQuery } from '@apollo/client/react';
import { gql } from "@apollo/client";
import { Alert, Button, Card, Divider, Input, Popconfirm, Skeleton, Space, Spin, Typography } from 'antd';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { ADD_CLIENT_MUTATION, DELETE_CLIENT_MUTATION } from '../graphql/mutations';
import { GET_CLIENTS_QUERY } from '../graphql/queries';
import { clientAtomFamily, clientHasFetchedAtom, clientListAtom, clientListAtomRemove, csvAtomFamily, csvHasFetched, csvListAtom } from '../state/atom';


// Lists our clients
export const ListClients = () => {

	// Query
	const { loading, data, error, refetch } = useQuery(GET_CLIENTS_QUERY, {
		fetchPolicy: 'network-only',
		skipPollAttempt: () => {
			return false
		}
	});

	// State
	const [hasFetchedClients, setHasFetchedCclients] = useAtom(clientHasFetchedAtom);
	const [clientsList, setClientsList] = useAtom(clientListAtom);
	const [isLoading, setIsLoading] = useState(false);

	const [addClient, addClientState] = useMutation(ADD_CLIENT_MUTATION, {
		refetchQueries: [GET_CLIENTS_QUERY],
	})

	// Stores client data
	useEffect(() => {

		if(data && data.clients && data.clients.success) {
			if(data.clients.clients) {
				data.clients.clients.forEach((client) => {
					clientAtomFamily(client);
				});
				setClientsList(data.clients.clients);
			}
			setHasFetchedCclients(true);
		}

		// If loading
		if(loading || addClientState?.loading) {
			setIsLoading(true);
		} else {
			setIsLoading(false);
		}

	}, [data, loading, addClientState?.loading])

	return (
		<Space direction="vertical" size="middle" style={{width: '100%'}}>
			<AddNewClientForm addClient={addClient} addClientState={addClientState} />
			<Divider size="small" />
			{loading && (
				<Skeleton active/>
			)}
			{!loading && hasFetchedClients && (
				<div className="list-csvs" style={{ width: '100%' }}>
					{clientsList.map((clientId => (
						<ListClientItem id={clientId} key={clientId} />
					)))}
				</div>
			)}
		</Space>
	)
}

// Form to add new client
const AddNewClientForm = ({ addClient, addClientState }) => {

	const [clientName, setClientName] = useState("");
	const [hasError, setHasError] = useState(false);
	const [errorMessage, setErrorMessage] = useState(false);

	const handleAddClient = () => {

		// Ensures client name is filled out
		if(clientName.length < 1) {
			setHasError(true);
			return;
		}

		// No error
		setHasError(false);

		// Does the mutation request
		addClient({
			variables: {
				name: clientName,
			},
			onCompleted: (data) => {
				if(data.addClient && !data.addClient.success) {
					setErrorMessage(data.addClient.message || "Something went wrong");
				}
				if(data.addClient && data.addClient.success) {
					setClientName("")
					setHasError(false);
					setErrorMessage(false);
				}
			}
		})

	}

	return (
		<Space direction="vertical" size="small" style={{width: '100%'}}>
			{errorMessage && (
				<Alert type="error" showIcon message={errorMessage} />
			)}
			<Space direction="horizontal" style={{display: 'flex'}}>
				<Typography.Text strong>Add new client: </Typography.Text>
				<Input disabled={addClientState?.loading} onPressEnter={handleAddClient} status={hasError ? 'error' : ''} placeholder="Client Name" style={{minWidth: 200}} onChange={(e) => setClientName(e.target.value)} value={clientName} />
				<Button loading={addClientState?.loading} type="primary" onClick={handleAddClient}>Add</Button>
			</Space>
		</Space>
	)
}

const ListClientItem = ({ id }) => {

	const client = useAtomValue(clientAtomFamily({ id }));
	const removeFromClientList = useSetAtom(clientListAtomRemove);

	const [deleteClient, { data, loading, error }] = useMutation(DELETE_CLIENT_MUTATION, {
		refetchQueries: [GET_CLIENTS_QUERY],
		variables: {
			id
		},
		onCompleted: (data) => {
			if(data.deleteClient.success) {
				// Delete the clinet ID from our list and remove our atom family
				removeFromClientList(id);
			}
		}
	})

	return (
		<div className="list-csvs-item">
			<Card size="small" style={{backgroundColor: 'rgba(0, 0, 0, .02)'}} title={client.name} loading={loading}>
				<Popconfirm title={`Delete ${client.name}`} description={`Are you sure you want to delete this client? It has ${client.csvs ? client.csvs.length : '0'} lists.`} onConfirm={(e) => {deleteClient(id)}} okText="Delete"
				            cancelText="Cancel">
					<Button size="small">Delete Client</Button>
				</Popconfirm>
			</Card>
		</div>
	)

}