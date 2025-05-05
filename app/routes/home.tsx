import type { Route } from './+types/home.ts';
import { Welcome } from '~/welcome/welcome.tsx';
import { useLoaderData } from 'react-router';

export function meta({}: Route.MetaArgs) {
	return [
		{ title: 'New React Router App' },
		{ name: 'description', content: 'Welcome to React Router!' },
	];
}
export async function loader({ context }: Route.LoaderArgs) {
	// console.log({ context });
	//* note this is NOT awaited
	const nonCriticalData = new Promise((res) =>
		setTimeout(
			() => res('this data is NOT awaited on the server and is streamed to the client as it is ready'),
			4_000,
		)
	);

	const criticalData = await new Promise((res) => setTimeout(() => res('this data is awaited on the server'), 200));
	return { nonCriticalData, criticalData, db: context.db };
}

export default function Home() {
	// const { db } = useLoaderData();
	// console.log({ db });
	return (
		<>
			<Welcome />
		</>
	);
}
