import { CheckOutlined, CloseCircleOutlined, DeleteFilled, EditOutlined, EllipsisOutlined, PauseCircleOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useSubscription } from '@apollo/client/react';
import { Alert, Button, Card, Col, Descriptions, Divider, Dropdown, Empty, Flex, Progress, Row, Select, Skeleton, Space, Spin, Statistic, Tag, Typography } from 'antd';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { gql } from "@apollo/client";
import { CHANGE_STATUS_CSV_MUTATION, DELETE_CSV_MUTATION, PAUSE_CSV_MUTATION, RESTART_CSV_MUTATION, UPDATE_CSV_DATA_MUTATION } from '../graphql/mutations';
import { GET_CSV_QUERY, GET_CSVS_QUERY } from '../graphql/queries';
import { CSV_STATUS_SUBSCRIPTION } from '../graphql/subscriptions';
import { clientListAtom, clientSelectOptionsAtom, csvAtomFamily, csvHasFetched, csvListAtom, deleteCsvListAtom, filteredCsvListAtom } from '../state/atom';
import { formatNumber } from '../utils';
import { ListCsvsFilters } from './filters';

const { Title, Text, Paragraph } = Typography;

export const ListCsvs = () => {
	return (
			<>
				<ListCsvsFilters />
				<Divider size="middle" />
				<ListCsvsWrap />
			</>
	)
}

// Liost our CSV Jobs
const ListCsvsWrap = () => {

	// Query
	const { loading, error, data, startPolling, networkStatus, refetch } = useQuery(GET_CSVS_QUERY, {
		pollingInterval: 500,
		fetchPolicy: 'network-only',
		skipPollAttempt: () => {
			return false
		}
	});

	// Has fetched CSV data
	const [hasFetchedCsvs, setHasFetchedCsvs] = useAtom(csvHasFetched);

	// Data state
	const setCsvsList = useSetAtom(csvListAtom);
	const filteredCsvsList = useAtomValue(filteredCsvListAtom);
	const setClientsList = useSetAtom(clientListAtom);

	// Stores our list data in our atoms
	useEffect(() => {

		// Have we received csvs
		if(data && data.csvs && data.csvs.success) {
			if(data.csvs.csvs) {
				data.csvs.csvs.forEach((csv) => {
					csvAtomFamily(csv);
				});
				setCsvsList(data.csvs.csvs);
			}
			startPolling();
			setHasFetchedCsvs(true);
		}

		if(data && data.clients && data.clients.clients) {
			setClientsList(data.clients.clients);
		}

	}, [data]);

	return (
		<>
			{loading && (
				<Skeleton active/>
			)}
			{!loading && hasFetchedCsvs && (
				<>
					<div className="list-csvs">
							{filteredCsvsList.map((csvId => (
								<ListCsvItem id={csvId} key={csvId} />
							)))}
					</div>
					{filteredCsvsList.length < 1 && (
						<Empty />
					)}
				</>
			)}
		</>
	)
}

// Returns object with csv details (client, user, date, csv type, exclusions,
const getCsvItemDetails = (csv) => {

	const createdDate = moment(csv.createdAt);
	const updatedDate = moment(csv.updatedAt);

	// returns obj
	return [
		{
			key: 'client',
			label: 'Client',
			children: csv.client && csv.client.name ? csv.client.name : '-',
		},
		{
			key: 'user',
			label: 'User',
			children: csv.user && csv.user.name ? csv.user.name : '-',
		},
		{
			key: 'type',
			label: 'Type',
			children: <Tag color={csv.csvType == 'PhoneList' ? 'blue' : csv.csvType == 'PingList' ? 'purple' : 'gold'}>{csv.csvType}</Tag>,
		},
		{
			key: 'batchSize',
			label: 'Batch Size',
			children: csv.batchSize
		},
		{
			key: 'created',
			label: 'Created',
			children: createdDate.fromNow()
		},
		{
			key: 'updated',
			label: 'Updated',
			children: updatedDate.fromNow()
		}
	];


}

// Lists csv item
const ListCsvItem = ({ id }) => {

	// Gets CSV from State
	const [csv, setCsv] = useAtom(csvAtomFamily({ id }));
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const deleteCsvFromListAtom = useSetAtom(deleteCsvListAtom);

	// Gets the CSV - so we can use our subscription
	const { subscribeToMore, ...result } = useQuery(GET_CSV_QUERY, {
		variables: {
			id
		}
	});

	// Subscribes to status updates if the csv is processing
	useEffect(() => {
		if(result.data && result.data.csv && result.data.csv.csv) {
			const _csv = result.data.csv.csv;
			if(csv.jobStatus == 'Pending') {
				const unsubscribe = subscribeToMore({
					document: CSV_STATUS_SUBSCRIPTION,
					variables: {
						id
					},
					updateQuery: (prev, { subscriptionData }) => {
						if (!subscriptionData.data) return prev;
						setCsv(subscriptionData.data.csvStatus);
						return Object.assign({}, prev, subscriptionData.data.csvStatus);
					}
				});
				return () => {
					unsubscribe();
				}
			}
		}
	}, [result.data, subscribeToMore, csv.jobStatus]);

	// Mutations
	// Restart
	const [restartCsv, restartCsvState] = useMutation(RESTART_CSV_MUTATION, {
		variables: {
			id
		},
		onCompleted: (data) => {
			if(data.restartCsv?.success) {
				setCsv(data.restartCsv.csv);
			}
			setIsLoading(false);
		}
	});

	// Resume
	const [updateCsvStatus, updateCsvState] = useMutation(CHANGE_STATUS_CSV_MUTATION, {
		onCompleted: (data) => {
			if(data.updateCsv?.success) {
				setCsv(data.updateCsv.csv);
			}
			setIsLoading(false);
		}
	});

	// Pause
	const [pauseCsv, pauseCsvState] = useMutation(PAUSE_CSV_MUTATION, {
		variables: {
			id
		},
		onCompleted: (data) => {
			if(data.pauseCsv?.success) {
				setCsv(data.pauseCsv.csv);
			}
			setIsLoading(false);
		}
	})

	// Update CSV data
	const [updateCsvData, updateCsvDataState] = useMutation(UPDATE_CSV_DATA_MUTATION, {
		onCompleted: (data) => {
			if(data.updateCsv?.success) {
				setCsv(data.updateCsv.csv);
			}
			setIsLoading(false);
		}
	})

	// Delete Csv
	const [deleteCsv, deleteCsvState] = useMutation(DELETE_CSV_MUTATION, {
		onCompleted: (data) => {
			if(data.deleteCsv?.success) {
				deleteCsvFromListAtom(id);
			}
			setIsLoading(false);
		}
	})

	// Effect for loading
	useEffect(() => {
		if(restartCsvState.loading || updateCsvState.loading || updateCsvDataState.loading || pauseCsvState.loading || deleteCsvState.loading) {
			setIsLoading(true);
		}
	}, [restartCsvState?.loading, updateCsvState?.loading, updateCsvDataState?.loading, pauseCsvState?.loading, deleteCsvState?.loading]);

	const createdDate = moment(csv.createdAt);
	const updatedDate = moment(csv.updatedAt);

	return (
		<div className="list-csvs-item">
			<Spin spinning={isLoading}>
				<Card size="small" style={{backgroundColor: 'rgba(0, 0, 0, .02)'}} title={(
					<Space direction="horizontal">
						<Text
							editable={{
								triggerType: ['icon', 'text'],
								onChange: (val) => {
									if(!val.length || val === csv.name) {
										return;
									}
									updateCsvData({
										variables: {
											id,
											name: val
										}
									})
								},
								enterIcon: null
							}}
						>{csv.name}</Text>
						{csv.jobStatus == 'Completed' && (
							<Tag color="success">completed</Tag>
						)}
						{csv.jobStatus == 'Pending' && (
							<Tag color="processing">processing</Tag>
						)}
						{csv.jobStatus == 'Paused' && (
							<Tag color="default">paused</Tag>
						)}
						{csv.jobStatus == 'Error' && (
							<Tag color="error">error</Tag>
						)}
						{csv.jobStatus == 'Cancelled' && (
							<Tag color="error">cancelled</Tag>
						)}
					</Space>)} extra={<ListCsvItemActions id={id} setDeleteConfirm={setDeleteConfirm} restartCsv={restartCsv} updateCsvStatus={updateCsvStatus} pauseCsv={pauseCsv} />}>
					{deleteConfirm && (
						<Alert style={{ marginBottom: 20 }} color="info" message={
							<>
								<Space direction="vertical" size="middle" style={{ display: 'flex' }}>
									Are you sure you want to permanently delete this list? This will not delete the Google Sheets file.
									<Flex gap="small">
										<Button size="small" type="primary" onClick={() => { deleteCsv({ variables: { id } }) }}>Delete</Button>
										<Button size="small" type="default" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
									</Flex>
								</Space>
							</>
						} />
					)}
					{csv.csvType != 'ExclusionList' && csv.jobStatus == 'Pending' && (
						<ListCsvItemProcess csv={csv} />
					)}
					<Row>
						<Col span={6}>
							<Space direction="vertical" size="small">
								<Text type="secondary">Total Numbers</Text>
								<Title
									level={3}
									style={{margin: 0 }}
								>{formatNumber(csv.totalRows - 1)}</Title>
							</Space>
						</Col>
						{csv.csvType == 'PhoneList' && (
							<Col span={6}>
								<Space direction="vertical" size="small" style={{display: 'flex'}}>
									<Text type="secondary">Max Numbers</Text>
									<Title
										level={3}
										style={{margin: 0, maxWidth: '80%' }}
										editable={{
											triggerType: ['icon', 'text'],
											onChange: (val) => {
												if(isNaN(val)) {
													return;
												}
												const value = parseInt(val);
												if(value > csv.totaRows) {
													return;
												}
												if(value == csv.maxRows) {
													return;
												}
												updateCsvData({
													variables: {
														id,
														maxRows: value
													}
												})
											},
											text: csv.maxRows.toString(),
											enterIcon: null
										}}
									>{formatNumber(csv.maxRows)}</Title>
								</Space>
							</Col>
						)}
						{csv.csvType != 'ExclusionList' && (
							<>
								<Col span={6}>
									<Space direction="vertical" size="small">
										<Text type="secondary">Processed Numbers</Text>
										<Title
											level={3}
											style={{margin: 0 }}
										>{formatNumber(csv.processRows > 0 ? csv.processRows - 1 : 0)}</Title>
									</Space>
								</Col>
								<Col span={6}>
									<Space direction="vertical" size="small">
										<Text type="secondary">Connected Numbers</Text>
										<Title
											level={3}
											style={{margin: 0 }}
										>{formatNumber(csv.connectedRows)}</Title>
									</Space>
								</Col>
							</>
						)}
					</Row>
					<Divider size="small" />
					<Descriptions size="small" items={[
						{
							key: 'client',
							label: 'Client',
							children: <ListCsvDescriptionClient csv={csv} updateCsvData={updateCsvData} />,
						},
						{
							key: 'user',
							label: 'User',
							children: csv.user && csv.user.name ? csv.user.name : '-',
						},
						{
							key: 'type',
							label: 'Type',
							children: <Tag color={csv.csvType == 'PhoneList' ? 'blue' : csv.csvType == 'PingList' ? 'purple' : 'gold'}>{csv.csvType}</Tag>,
						},
						{
							key: 'batchSize',
							label: 'Batch Size',
							children: <Text
								editable={{
									triggerType: ['icon', 'text'],
									onChange: (val) => {
										if(!val || isNaN(val)) return;
										const value = parseInt(val);
										if(val < 10 || val > 50) {
											return;
										}
										updateCsvData({
											variables: {
												id,
												batchSize: value,
											}
										})
									},
									text: csv.batchSize.toString(),
									enterIcon: null
								}}
							>{ csv.batchSize }</Text>
						},
						{
							key: 'created',
							label: 'Created',
							children: createdDate.fromNow()
						},
						{
							key: 'updated',
							label: 'Updated',
							children: updatedDate.fromNow()
						},
						{
							key: 'postCount',
							label: 'Yabbr Post Requests',
							children: csv.postRequestCount
						},
						{
							key: 'exclusionLists',
							label: 'Exclusion Lists',

							children: <Flex wrap="wrap" gap={5}>
							{csv.exclusionList.length && csv.exclusionList.map(exclItem => (
								<Tag key={exclItem.id}>{exclItem.csv.name}</Tag>
								)) || '-'}
							</Flex>
						}
					]} />
					<Divider size="small" style={{ marginBottom: '18px' }} />
					<Button size="small" onClick={() => window.open(csv.url, "_blank")}>Open in Google Sheets</Button>
				</Card>
			</Spin>
		</div>
	)
}

// Description for our client so we can make it editable
const ListCsvDescriptionClient = ({ csv, updateCsvData }) => {

	const [isEditingClient, setIsEditingClient] = useState(false);
	const clientList = useAtomValue(clientSelectOptionsAtom);
	const [selectedClient, setSelectedClient] = useState(csv.client && csv.client.id ? csv.client.id : null);

	return (
		<>
			{!isEditingClient && (
				<div style={{cursor: 'pointer'}} onClick={() => setIsEditingClient(true)}>
					<Space direction="horizontal" size="small">
						<Text>{csv.client && csv.client.name ? csv.client.name : '-'}</Text>
						<EditOutlined style={{ color: '#1677ff', fontSize: 13 }} />
					</Space>
				</div>
			)}
			{isEditingClient && (
				<Space direction="horizontal" size="small" style={{display: 'flex', flexWrap: 'wrap'}}>
					<Select
						size="small"
						style={{minWidth: 200}}
						options={clientList}
						placeholder="-"
						allowClear={true}
						value={selectedClient}
						onChange={setSelectedClient}
					/>
					<Button type="primary" size="small" onClick={() => {
						setIsEditingClient(false);
						updateCsvData({
							variables: {
								id: csv.id,
								client: !selectedClient ? 'na' : selectedClient,
							}
						});
					}}>Save</Button>
					<Button type="default" size="small" onClick={() => setIsEditingClient(false)}>Cancel</Button>
				</Space>
			)}
		</>
	)
}

const getCsvListItemExclusionListItems = (exclusionList) => {
	if(!exclusionList || !exclusionList.length) {
		return '-';
	}
	return exclusionList.map(exclItem => {
		return exclItem.csv.name;
	}).join(', ');
}

// Gets the progress percentage for a CSV
const getListCsvItemProcessProgressPercentage = (csv) => {

	let percentage;

	if(csv.percentage && csv.percentage >= 0) {
		return csv.percentage;
	}

	// For ping lists - the progress is the process rows in comparison to the total rows
	if(csv.csvType == 'PingList') {

		// no division by 0
		if(csv.processRows === 0) {
			return 0;
		}

		percentage = Math.ceil((csv.processRows/csv.totalRows)*100);
	} else if(csv.csvType == 'PhoneList') {

		// No division by 0
		if(csv.connectedRows === 0) {
			return 0;
		}

		// For phone lists - the percentage is the number of connected rows in comparison to our maxRows
		percentage = Math.ceil((csv.connectedRows / csv.maxRows)*100);

	} else {
		return 0;
	}

	if(percentage > 100) {
		return 100;
	}

	if(percentage < 0) {
		return 0;
	}

	return percentage;
}

// When lists are pending we displayu opur progress
const ListCsvItemProcess = ({ csv }) => {

	return (
		<Alert
			message="Processing List"
			type="info"
			showIcon
			style={{marginBottom: 20}}
			message={(
				<Space direction="vertical" style={{ display: 'flex' }}>
					{csv.statusMessage && (
						<Text keyboard>{csv.statusMessage}</Text>
					)}
					<Progress percent={getListCsvItemProcessProgressPercentage(csv)} />
				</Space>
			)}
			/>
	)
}

// Gets the actions for this CSV
const ListCsvItemActions = ({ id, setDeleteConfirm, restartCsv, updateCsvStatus, pauseCsv }) => {

	const [csv, setCsv] = useAtom(csvAtomFamily({ id }));

	const deleteHandler = () => {
		setDeleteConfirm(true);
	}

	return (
		<Dropdown trigger="click" placement="bottomRight" menu={{ items: getCsvDropdownActions(csv, { deleteHandler, restartCsv, updateCsvStatus, pauseCsv }) }}>
			<Button size="small">
				<EllipsisOutlined />
			</Button>
		</Dropdown>
	)
}


// Gets the options for the dropdown
const getCsvDropdownActions = (csv, { deleteHandler, restartCsv, updateCsvStatus, pauseCsv }) => {

	let actions = [];

	// If the item is pending
	if(csv.csvType != 'ExclusionList' && csv.jobStatus == 'Pending') {
		actions = [
			...actions,
			{
				key: 'pause',
				label: 'Pause',
				icon: <PauseCircleOutlined />,
				onClick: () => {
					pauseCsv();
				}
			}
		];
	}

	// Let the user resume when its paused
	if(csv.csvType != 'ExclusionList' && (csv.jobStatus == 'Paused' || csv.jobStatus == 'Error')) {
		actions = [
			...actions,
			{
				key: 'resume',
				label: 'Resume',
				icon: <PlayCircleOutlined />,
				onClick: () => {
					updateCsvStatus({
						variables: {
							id: csv.id,
							jobStatus: 'Pending'
						}
					});
				}
			},
			{
				key: 'cancel',
				label: 'Cancel',
				icon: <CloseCircleOutlined />,
				onClick: () => {
					updateCsvStatus({
						variables: {
							id: csv.id,
							jobStatus: 'Cancelled'
						}
					});
				}
			}
		]
	}

	// If its completed
	if(csv.csvType != 'ExclusionList' && (csv.jobStatus == 'Completed' || csv.jobStatus == 'Cancelled')) {
		actions = [
			...actions,
			{
				key: 'restart',
				label: 'Restart',
				icon: <ReloadOutlined />,
				onClick: () => {
					restartCsv();
				}
			},
			{
				key: 'restart-force-get',
				label: 'Restart and Force GET Requests',
				icon: <ReloadOutlined />,
				onClick: () => {
					restartCsv({
						variables: {
							id: csv.id,
							forceGet: true
						}
					});
				}
			}
		]
	}

	// If com,pleted, cancelled or error
	if(csv.jobStatus == 'Completed' || csv.jobStatus == 'Cancelled' || csv.jobStatus == 'Error') {
		if(csv.csvType != 'ExclusionList') {
			actions = [
				...actions,
				{
					type: 'divider'
				}
			]
		}
		actions = [
			...actions,
			{
				key: 'delete',
				label: 'Delete',
				icon: <DeleteFilled />,
				onClick: deleteHandler
			}
		]
	}

	return actions;

}