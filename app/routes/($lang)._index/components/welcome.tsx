import stack from './main.png';
// import stack_public from '/main.png';
import { Await, useLoaderData } from 'react-router';
import { Suspense } from 'react';

export function Welcome() {
	const { nonCriticalData, criticalData } = useLoaderData();

	const NonCriticalData = () => {
		return (
			<div>
				Non critical data (loads after 4 sec):
			</div>
		);
	};

	return (
		<main className='flex items-center justify-center pt-16 pb-4'>
			<div className='flex-1 flex flex-col items-center gap-16 min-h-0'>
				<header className='flex flex-col items-center gap-9'>
					<div className='w-[500px] max-w-[100vw] p-4'>
						{
							/* src={logoLight}
							className='block w-full dark:hidden'
							src={logoDark}
							className='hidden w-full dark:block' */
						}
						<img
							src={stack}
							alt='DHR Stack'
							className='w-full'
						/>
						{
							/* <img
							src={stack_public}
							alt='DHR Stack'
							className='w-full'
						/> */
						}
					</div>
				</header>
				<div className='max-w-[500px] w-full space-y-6 px-4'>
					<nav className='rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4'>
						<div className='text-3xl font-bold leading-8 text-gray-700 dark:text-gray-200 text-center'>
							DHR Stack by<br></br> NorthRock software
						</div>
						<div>
							<p className='mb-12'>
								This is a simple example of a React Router app with server-side rendering.
							</p>
							<div className='flex flex-col gap-4'>
								<div className='text-xl font-bold'>Streaming example</div>

								<div className='font-bold'>
									<div className=''>
										Critical data (waited for 300ms): {' '}
									</div>
									<div className='text-red-400'>
										{criticalData}
									</div>
								</div>
								<div className='font-bold'>
									<NonCriticalData />
									<div className='text-yellow-400'>
										<Suspense fallback='Loading...'>
											<Await resolve={nonCriticalData}>
												{(value) => (
													<>
														{value}
													</>
												)}
											</Await>
										</Suspense>
									</div>
								</div>
							</div>
						</div>
					</nav>
				</div>
			</div>
		</main>
	);
}
