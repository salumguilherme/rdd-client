import React from 'react';
import { FileTextOutlined, UserOutlined } from '@ant-design/icons';
import { useAtomValue, useSetAtom, Provider } from 'jotai';
import { AddClient } from './clients/add';
import { ListClients } from './clients/list';
import { AddCsvs } from './csvs/add';
import { ListCsvs } from './csvs/list';
import { LoginScreen } from './login/Login';
import '@ant-design/v5-patch-for-react-19';
import './App.css';
import logo from './logo.png';
import { Layout, Menu, theme } from 'antd';
import { appPageAtom, tokenAtom } from './state/atom';
const { Header, Content, Footer, Sider } = Layout;

function App() {

	// Are we logged in?
	const token = useAtomValue(tokenAtom);

	return (
		<>
			{!token && (
				<LoginScreen />
			)}
			{token && (
				<AppScreen />
			)}
		</>
	)
}

const mainMenuItems = [
	{
		key: 'logout',
		label: 'Signout',
	}
];

const sidebarMenuItems = [
	{
		key: 'csvs',
		label: 'Lists',
		icon: React.createElement(FileTextOutlined),
		children: [
			{
				key: 'csvs-list',
				label: 'View Lists',
			},
			{
				key: 'csvs-add',
				label: 'Add New List',
			}
		]
	},
	{
		key: 'clients',
		label: 'Clients',
		icon: React.createElement(UserOutlined),
		children: [
			{
				key: 'clients-list',
				label: 'Clients',
			}
		]
	}
]

// Main app screen
const AppScreen = () => {

	// Setter for our menu item
	const setAppPage = useSetAtom(appPageAtom)
	const setAuthToken = useSetAtom(tokenAtom);

	// Theme colors
	const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

	// On menu item select handler
	const onMenuItemSelect = ({ item, key, keyPath, selectedKeys, domEvent }) => {
		setAppPage(key);
	}

	const onMainMenuItemSelect = ({ item, key, keyPath, selectedKeys, domEvent }) => {
		// If logout
		if(key == 'logout') {
			setAuthToken(false);
		}
	}

	return (
		<Layout>
			<Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
				<div className="logo" style={{display: 'flex', alignItems: 'center'}}><img src={logo} style={{width: 84}} className="ll-logo" alt="logo" /></div>
				<Menu
					theme="dark"
					mode="horizontal"
					defaultSelectedKeys={['dashboard']}
					items={mainMenuItems}
					style={{ flex: 1, minWidth: 0, margin: 'auto 0 auto auto', justifyContent: 'flex-end' }}
					onSelect={onMainMenuItemSelect}
				/>
			</Header>
			<div style={{ padding: '48px 48px 0' }}>
				<Layout style={{ background: colorBgContainer, borderRadius: borderRadiusLG  }}>
					<Sider style={{ background: colorBgContainer, borderRadius: `${borderRadiusLG}px 0 0 ${borderRadiusLG}px`, overflow: 'hidden' }} width={200}>
						<Menu
							mode="inline"
							defaultSelectedKeys={['csvs-list']}
							defaultOpenKeys={['csvs']}
							style={{ height: '100%' }}
							items={sidebarMenuItems}
							onSelect={onMenuItemSelect}
						/>
					</Sider>
					<Content style={{ padding: '24px', minHeight: 'calc(100vh - 179px)' }}>
						<AppContentArea />
					</Content>
				</Layout>
			</div>
			<Footer style={{ textAlign: 'center', color: '#ccc' }}>
				Built with love baby
			</Footer>
		</Layout>
	)
}

const AppContentArea = () => {

	const appPage = useAtomValue(appPageAtom);

	return (
		<>
			{appPage == 'csvs-list' && (
				<ListCsvs />
			)}
			{appPage == 'csvs-add' && (
				<AddCsvs />
			)}
			{appPage == 'clients-list' && (
				<ListClients />
			)}
			{appPage == 'clients-add' && (
				<AddClient />
			)}
		</>
	);
}

export default App;
