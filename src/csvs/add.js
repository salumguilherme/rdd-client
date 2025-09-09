import { CheckSquareOutlined, CopyOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client/react';
import { Alert, Button, Checkbox, Divider, Flex, Form, Input, InputNumber, Radio, Select, Space, Spin, Tag, Tooltip } from 'antd';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard/src';
import { ADD_CSV_MUTATION } from '../graphql/mutations';
import { addCsvListAtom, appPageAtom, clientListAtom, clientSelectOptionsAtom, clientUpdateAtomFamily, csvListAtom, exclusionSelectCsvsAtom } from '../state/atom';

export const AddCsvs = () => {
	return (
		<Space direction="vertical">
			<AddCsvInstructions />
			<Divider />
			<AddCsvForm />
		</Space>
	)
}

const AddCsvInstructions = () => {

	const [hasCopied, setCopied] = useState(false);

	return (
		<Alert type="info" message="Before adding a new list:" description={(
			<>
				<p>1) Ensure the google sheet is shared with the following email address: &nbsp;
					{!hasCopied && (
						<CopyToClipboard text="rdd-bot@five-creative-clients.iam.gserviceaccount.com" onCopy={() => { setCopied(true); setTimeout(() => setCopied(false), 1500) }}><Tag color="default" icon={<CopyOutlined />}>rdd-bot@five-creative-clients.iam.gserviceaccount.com</Tag></CopyToClipboard>
					)}
					{hasCopied && (
						<CopyToClipboard text="rdd-bot@five-creative-clients.iam.gserviceaccount.com"><Tag color="success" icon={<CheckSquareOutlined />}>rdd-bot@five-creative-clients.iam.gserviceaccount.com</Tag></CopyToClipboard>
					)}
				</p>
				<p>2) Ensure there are no blank rows at the end of the file</p>
			</>
		)} />
	)
}

const AddCsvForm = () => {

	const [form] = Form.useForm();
	const [listType, setListType] = useState(null);
	const [selectedClient, setSelectedClient] = useState(null);
	const clientOptions = useAtomValue(clientSelectOptionsAtom);
	const exclusionListOptions = useAtomValue(exclusionSelectCsvsAtom);
	const addNewCsvStateAtom = useSetAtom(addCsvListAtom);
	const updateCsvClientAtom = useSetAtom(clientUpdateAtomFamily);
	const setAppPage = useSetAtom(appPageAtom)

	const [errorMessage, setErrorMessage] = useState(null);

	const [addNewCsv, addNewCsvState] = useMutation(ADD_CSV_MUTATION, {
		onCompleted: (data) => {
			if(data.addCsv.success) {

				// Adds the new Csv to our state
				if(data.addCsv.csv) {
					// Adds the new Csv to our list
					addNewCsvStateAtom(data.addCsv.csv);
				}

				// If we have a client - ensure to update our client atom family
				if(data.addCsv.client) {
					updateCsvClientAtom(data.addCsv.client)
				}

				setAppPage('csvs-list');

			} else {
				setErrorMessage(data.addCsv.message);
			}
		}
	});

	return (
		<Spin spinning={addNewCsvState.loading}>
			<Form
				layout="horizontal"
				form={form}
				labelCol={{ span: 6 }}
				labelAlign="left"
				onFinish={(values) => {

					// Defines our mutation arguments
					let args = {
						url: values.url,
						type: values.csvType
					};

					// Client
					if(values.client) {
						args.client = values.client;
					}

					// Name
					if(values.name) {
						args.name = values.name;
					}

					// For phone list we want to include our maxRows
					if(values.csvType == 'PhoneList' && !isNaN(values.maxRows)) {
						args.maxRows = parseInt(values.maxRows);
					}

					// For phone and ping list we want to include outr batch size
					if(values.csvType != 'ExclusionList') {
						args.batchSize = parseInt(values.batchSize);
					}

					// Exclusion lsit
					if(values.exclusionList) {
						args.exclusionList = values.exclusionList;
					}

					// Exclusion list by clinet
					if(values.client && values.excludeFromClient) {
						args.excludeFromClient = values.excludeFromClient;
					}

					// Sends our mutation
					addNewCsv({
						variables: args,
					});

				}}
				onFieldsChange={(changedValues) => {
					for(const field of changedValues) {
						if(field.name && field.name.indexOf('csvType') >= 0) {
							setListType(field.value);
						}
						if(field.name && field.name.indexOf('client') >= 0) {
							setSelectedClient(field.value);
						}
					}
				}}>
				{errorMessage && (
					<Form.Item>
						<Alert message={errorMessage} type="error" showIcon />
					</Form.Item>
				)}
				<Form.Item valuePropName="checked" label="I have" name="ihave" rules={[{ required: true, message: "Please ensure the checklist has been done" }]}>
					<Space direction="vertical">
					<Checkbox>Shared the google sheet document with the email rdd-bot@five-creative-clients.iam.gserviceaccount.com</Checkbox>
					<Checkbox>Ensured that there are no empty rows at the end of the file</Checkbox>
					</Space>
				</Form.Item>
				<Divider />
				<Form.Item label="List type" name="csvType" rules={[{ required: true, message: "Select a list type" }]}>
					<Space>
						<Radio.Group>
							<Radio.Button value="PhoneList">Phone List</Radio.Button>
							<Radio.Button value="PingList">Ping List</Radio.Button>
							<Radio.Button value="ExclusionList">Exclusion List</Radio.Button>
						</Radio.Group>
						<Tooltip title={<>
							<strong>Phone List</strong> to ping numbers up to a pre-determined set of connected numbers<br/>
							<strong>Ping List</strong> to ping all numbers in the list<br/>
							<strong>Exclusion List</strong> To add a set of phone numbers that can be excluded from a Phone List<br/></>}>
							<QuestionCircleOutlined />
						</Tooltip>
					</Space>
				</Form.Item>
				<Form.Item label="List URL" name="url" rules={[{ required: true, message: "Select a list URL" }]}>
					<Input />
				</Form.Item>
				<Form.Item label="List Name" name="name">
					<Flex direction="row" justify="space-between" gap={10}>
						<Input style={{flexGrow: 1}} />
						<Tooltip title="Leave blank to use the name of the Google Sheets Document">
							<QuestionCircleOutlined />
						</Tooltip>
					</Flex>
				</Form.Item>
				{listType == 'PhoneList' && (
					<Form.Item label="Connected No. Target" name="maxRows" rules={[{ required: true, message: "Enter a number for the target of connected phones" }]}>
						<Space>
							<InputNumber min={1} />
							<Tooltip title="Set the target number of connected numbers for this list. The list will stop processing and be marked as complete once the target number is reached.">
								<QuestionCircleOutlined />
							</Tooltip>
						</Space>
					</Form.Item>
				)}
				{listType != 'ExclusionList' && (
					<Form.Item label="Queue Batch Size" name="batchSize" rules={[{ required: true, message: "Enter a number for the queue size" }]}>
						<Space>
							<InputNumber min={10} max={50} />
							<Tooltip title="Enter how many rows the queue processes per run. The queue size is the batchSize multiplied by 4. So if you enter 10, the queue will process 40 rows at a time.">
								<QuestionCircleOutlined />
							</Tooltip>
						</Space>
					</Form.Item>
				)}
				<Form.Item label="Client" name="client">
					<Select options={clientOptions} allowClear={true} placeholder="Select a client (optional)"></Select>
				</Form.Item>
				{listType == 'PhoneList' && (
					<Form.Item label="Exclusion Lists" name="exclusionList">
						<Select
							showSearch
							placeholder="Select a list of exclusion lists"
							defaultActiveFirstOption={false}
							optionFilterProp="label"
							filterSort={(optionA, optionB) =>
								(optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
							}
							mode="multiple"
							options={exclusionListOptions}
							/>
					</Form.Item>
				)}
				{listType == 'PhoneList' && selectedClient && (
					<Form.Item colon={false} label="&nbsp;" valuePropName="checked" name="excludeFromClient">
						<Checkbox>Add previous phone list jobs for this client to the exclusion list. <Tooltip title="Checking this will add all 'Phone Lists' processed for this client to the exclusion list. Check this box if you want to ensure no duplicate numbers are provided to the same client for different jobs.">
							<QuestionCircleOutlined />
						</Tooltip></Checkbox>
					</Form.Item>
				)}
				<Form.Item>
					<Button type="primary" htmlType="submit">Submit</Button>
				</Form.Item>
			</Form>
		</Spin>
	)
}