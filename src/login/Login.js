import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client/react';
import { Alert, Button, Form, Input, Layout, Spin, theme } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useSetAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { gql } from "@apollo/client";
import { appPageAtom, tokenAtom } from '../state/atom';
const { Header, Content, Footer } = Layout;

export const LoginScreen = () => {
	const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
	return (
		<Layout>
			<Content>
				<div style={{ padding: '48px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<div
						style={{
							padding: '8px 24px 0',
							minHeight: 240,
							maxWidth: '100%',
							width: 320,
							background: colorBgContainer,
							borderRadius: borderRadiusLG,
						}}
					>
						<h2>Sign in</h2>
						<LoginForm />
					</div>
				</div>
			</Content>
		</Layout>
	)
}

const SIGNIN_MUTATION = gql`
mutation loginMutation($username:String!,$password:String!) {
    signinUser(email:$username,password:$password) {
	    success
	    message
	    token {
		    token
		    expires
	    }
    }
}
`;

const LoginForm = () => {

	// Signin mutation
	const [signIn, { data, loading, error }] = useMutation(SIGNIN_MUTATION);

	// error messqage
	const [errorMessage, setErrorMessage] = useState(null);

	// Success message
	const [successMessage, setSuccessMessage] = useState(null);

	// sets our auth token
	const setToken = useSetAtom(tokenAtom);
	const setAppPage = useSetAtom(appPageAtom)

	// Use effect for data and error
	useEffect(() => {

		// If error
		if(error) {
			setErrorMessage(error.message);
		} else if(data && data.signinUser && !data.signinUser.success) {
			setErrorMessage(data.signinUser.message || "Invalid user and password combination");
		} else if(data && data.signinUser && data.signinUser.success && data.signinUser.token) {
			// Sets our token
			setErrorMessage(null);
			setSuccessMessage("Logged in...");
			setTimeout(() => {
				setToken(data.signinUser.token);
				window.location.reload();
			}, 1500);
		}
	}, [error, data]);

	// On form submit
	const onFinish = values => {
		setErrorMessage(null);
		signIn({ variables: { username:values.username, password:values.password } });
	}

	return (
		<Spin spinning={loading}>
			{errorMessage && (
				<Alert style={{marginBottom: 20}} message={errorMessage} type="error" />
			)}
			{successMessage && (
				<Alert style={{marginBottom: 20}} message={successMessage} type="success" />
			)}
			<Form name="login" onFinish={onFinish}>
				<Form.Item
					name="username"
					rules={[{ required: true, message: 'Please enter your username' }]}
				>
					<Input prefix={<UserOutlined />} placeholder="Username" />
				</Form.Item>
				<Form.Item
					name="password"
					rules={[{ required: true, message: 'Please input your Password!' }]}
				>
					<Input prefix={<LockOutlined />} type="password" placeholder="Password" />
				</Form.Item>
				<Form.Item>
					<Button block type="primary" htmlType="submit">
						Log in
					</Button>
				</Form.Item>
			</Form>
		</Spin>
	)
}