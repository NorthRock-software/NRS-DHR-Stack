import type { Route } from './+types/home.ts';
import { Welcome } from '~/welcome/welcome.tsx';
import { Await, useLoaderData } from 'react-router';
import * as React from 'react';

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'New React Router App' },
		{ name: 'description', content: 'Welcome to React Router!' },
	];
}
export async function loader({ context }: Route.LoaderArgs) {
	// console.log({ context });
	// note this is NOT awaited
	let nonCriticalData = new Promise((res) =>
		setTimeout(
			() => res('this data is NOT awaited on the server and is streamed to the client as it is ready'),
			4_000,
		)
	);

	let criticalData = await new Promise((res) => setTimeout(() => res('this data is awaited on the server'), 200));
	return { nonCriticalData, criticalData, nrs: context.nrs_test };
}

export default function Home() {
	const { nonCriticalData, criticalData, nrs } = useLoaderData();
	return (
		<>
			<Welcome />
		</>
	);
}
