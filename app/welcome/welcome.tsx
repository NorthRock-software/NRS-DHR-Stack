import stack from '/main.png';
import { Await, useLoaderData } from 'react-router';
import {Suspense} from 'react';

export function Welcome() {
	const { nonCriticalData, criticalData, nrs } = useLoaderData();
  // console.log({ nonCriticalData, criticalData, nrs });

	return (
		<main className='flex items-center justify-center pt-16 pb-4'>
			<div className='flex-1 flex flex-col items-center gap-16 min-h-0'>
				<header className='flex flex-col items-center gap-9'>
					<div className='w-[500px] max-w-[100vw] p-4'>
							{/* src={logoLight}
							className='block w-full dark:hidden'
							src={logoDark}
							className='hidden w-full dark:block' */}
						<img
							src={stack}
							alt='DHR Stack'
							className='w-full'
						/>
					</div>
				</header>
				<div className='max-w-[400px] w-full space-y-6 px-4'>
					<nav className='rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4'>
						<p className='text-xl leading-6 text-gray-700 dark:text-gray-200 text-center'>
							DHR Stack by NorthRock software
						</p>
						<div>
							This is a simple example of a React Router app with server-side rendering.
							<br />
							<div>
								<h1>Streaming example</h1>
								<br />
								<h2>Critical data: 	<br />{criticalData}</h2>
								<br />
								<Suspense fallback={<div>Non critical data (loads after 4 sec): <br />Loading...</div>}>
									<Await resolve={nonCriticalData}>
										{(value) => <h3>Non critical data (loads after 4 sec): <br />{value}</h3>}
									</Await>
								</Suspense>
							</div>
						</div>
					</nav>
				</div>
			</div>
		</main>
	);
}
