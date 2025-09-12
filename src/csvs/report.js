import { useQuery, useSubscription } from '@apollo/client/react';
import { Divider, Empty, Skeleton, Table } from 'antd';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useEffect } from 'react';
import { GET_CSVS_QUERY } from '../graphql/queries';
import { CSV_CHANGED_SUBSCRIPTION } from '../graphql/subscriptions';
import { clientListAtom, csvAtomFamily, csvHasFetched, csvListAtom, csvReportTableDataAtom, updateCsvListAtom } from '../state/atom';
import { createStyles } from 'antd-style';
import { ListCsvsFilters } from './filters';

const useStyle = createStyles(({ css, token }) => {
	const { antCls } = token;
	return {
		customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
	};
});

const columns = [
	{
		title: 'List',
		dataIndex: 'name',
	},
	{
		title: 'Max Numbers',
		dataIndex: 'maxRows',
	},
	{
		title: 'Rows Connected',
		dataIndex: 'connectedRows',
	},
	{
		title: 'Status',
		dataIndex: 'jobStatus',
	},
	{
		title: 'Job Type',
		dataIndex: 'csvType',
	},
	{
		title: 'Rows Processed',
		dataIndex: 'processRows',
	},
	{
		title: 'POST Requests',
		dataIndex: 'postRequestCount',
	}
];

export const CsvsReport = () => {
	return (
		<>
			<ListCsvsFilters />
			<Divider size="middle" />
			<CsvsReportTable />
		</>
	)
}

export const CsvsReportTable = () => {

	const csvReportTableData = useAtomValue(csvReportTableDataAtom);
	const { loading, error, data, startPolling, networkStatus, refetch, subscribeToMore } = useQuery(GET_CSVS_QUERY, {
		pollingInterval: 500,
		fetchPolicy: 'network-only',
		skipPollAttempt: () => {
			return false
		}
	});

	// Has fetched CSV data
	const [hasFetchedCsvs, setHasFetchedCsvs] = useAtom(csvHasFetched);
	const setClientsList = useSetAtom(clientListAtom);
	const setCsvsList = useSetAtom(csvListAtom);
	const updateCsvItem = useSetAtom(updateCsvListAtom);

	const useSubscriptiondata = useSubscription(CSV_CHANGED_SUBSCRIPTION, {
		onData: ({ data }) => {
			// If we have data
			if(data && data.data && data.data.csvChanged) {

				const changeType = data.data.csvChanged.changeType;

				// If we are updating - update the atom family
				if(changeType == 'Updated') {
					console.log('updated', data.data.csvChanged.csv);
					updateCsvItem(data.data.csvChanged.csv);
				}

				// If we have created
				if(changeType == 'Created') {
					refetch();
				}

				// If we have deleted\
				if(changeType == 'Deleted') {
					refetch();
				}

			}
		}
	});

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

		/*const unsubscribe = subscribeToMore({
			document: CSV_CHANGED_SUBSCRIPTION,

		});

		return () => {
			unsubscribe();
		}*/

		// Gets the CSV - so we can use our subscription
		/*const { subscribeToMore, ...result } = useQuery(GET_CSV_QUERY, {
			variables: {
				id
			}
		});*/

		/*
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
		}, [result.data, subscribeToMore, csv.jobStatus]);*/

	}, [data]);

	return (
		<div className="csvReportTable">
			{loading && (
				<Skeleton active/>
			)}
			{!loading && hasFetchedCsvs && (
				<Table
					columns={columns}
					dataSource={csvReportTableData}
					size="small"
					pagination={false}
					bordered
				/>
			)}
		</div>
	)
}