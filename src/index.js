import { ApolloClient, createHttpLink, HttpLink, split, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { ConfigProvider, theme } from 'antd';
import { OperationTypeNode } from 'graphql';
import { Provider } from 'jotai';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const httpLink = createHttpLink({
	uri: 'https://leadlistrdd.server.fivecreative.com.au/graphql'
});

const authLink = setContext((_, { headers }) => {
	const _token = localStorage.getItem('authToken');
	const token = _token ? JSON.parse(_token) : undefined;
	return {
		headers: {
			...headers,
			authorization: token && token.token ? `Bearer ${token.token}` : '',
		}
	}
});

const _token = localStorage.getItem('authToken');
const token = _token ? JSON.parse(_token) : undefined;

const wsLink = new GraphQLWsLink(
	createClient({
		url: "https://leadlistrdd.server.fivecreative.com.au/subscriptions",
		connectionParams: {
			authToken: token,
		}
	})
);

const splitLink = split(
	({ operationType }) => {
		return operationType === OperationTypeNode.SUBSCRIPTION;
	},
	wsLink,
	authLink.concat(httpLink)
);

const client = new ApolloClient({
	link: splitLink,
	cache: new InMemoryCache()
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<Provider>
			<ApolloProvider client={client}>
				<ConfigProvider theme={{
					//algorithm: theme.darkAlgorithm,
					token: {
						fontFamily: 'Inter, -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
						fontSize: 15,
					//	colorBgBase: '#161616',
					//	colorPrimary: '#82bcff'
					}
				}} >
					<App />
				</ConfigProvider>
			</ApolloProvider>
		</Provider>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
