import { Button, Divider, Flex, Select, Space } from 'antd';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { appCsvListFilterClient, appCsvListFilterStatus, appCsvListFilterType, clientSelectOptionsAtom } from '../state/atom';

export const ListCsvsFilters = () => {
	return (
		<Flex gap="middle" align="stretch">
			<ListCsvFilterType />
			<Divider type="vertical" style={{ height: 'auto' }} />
			<ListCsvFilterStatus />
			<Divider type="vertical" style={{ height: 'auto' }} />
			<ListCsvFilterClient />
		</Flex>
	)
}

// Filter by type
const ListCsvFilterType = () => {

	const [filterType, setFilterType] = useAtom(appCsvListFilterType);

	return (
		<Space direction="vertical">
			<label style={{ fontWeight: 'bold', fontSize: 14 }}>List Type</label>
			<Flex gap="small">
				<Button
					size="small"
					type={filterType.indexOf('PhoneList') >= 0 ? 'primary' : 'default'}
					onClick={() => setFilterType(filterType.indexOf('PhoneList') >= 0 ? filterType.filter(item => item !== 'PhoneList') : [...filterType, 'PhoneList'])}
				>Phones</Button>
				<Button
					size="small"
					type={filterType.indexOf('PingList') >= 0 ? 'primary' : 'default'}
					onClick={() => setFilterType(filterType.indexOf('PingList') >= 0 ? filterType.filter(item => item !== 'PingList') : [...filterType, 'PingList'])}
				>Pings</Button>
				<Button
					size="small"
					type={filterType.indexOf('ExclusionList') >= 0 ? 'primary' : 'default'}
					onClick={() => setFilterType(filterType.indexOf('ExclusionList') >= 0 ? filterType.filter(item => item !== 'ExclusionList') : [...filterType, 'ExclusionList'])}
				>Exclusions</Button>
			</Flex>
		</Space>
	)
}

// Filter by status
const ListCsvFilterStatus = () => {

	const setFilterStatus = useSetAtom(appCsvListFilterStatus);

	return (
		<Space direction="vertical">
			<label style={{ fontWeight: 'bold', fontSize: 14 }}>Status</label>
			<Select filterOption={(input, option) =>
				(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
			} mode="multiple" size="small" allowClear style={{ width: 155 }} placeholder="– Status" options={[
				{
					value: 'Pending',
					label: 'Processing',
				},
				{
					value: 'Paused',
					label: 'Paused',
				},
				{
					value: 'Completed',
					label: 'Completed',
				},
				{
					value: 'cancelled',
					label: 'Cancelled',
				},
				{
					value: 'error',
					label: 'Error',
				}
			]}
			        onChange={(val) => {
				        setFilterStatus(val);
			        }}/>
		</Space>
	)
}

// Filter by status
const ListCsvFilterClient = () => {

	const setFilterClient = useSetAtom(appCsvListFilterClient);
	const clientList = useAtomValue(clientSelectOptionsAtom);


	return (
		<Space direction="vertical">
			<label style={{ fontWeight: 'bold', fontSize: 14 }}>Client</label>
			<Select filterOption={(input, option) =>
				(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
			} mode="multiple" size="small" allowClear style={{ width: 155 }} placeholder="– Client" options={[ { value: '__not', label: 'Unassigned' }, ...clientList]}
			        onChange={(val) => {
				        setFilterClient(val);
			        }}/>
		</Space>
	)
}