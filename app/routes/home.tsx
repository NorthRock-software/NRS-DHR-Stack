import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { Await, useLoaderData } from "react-router";
import * as React from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}
export async function loader({ context }: Route.LoaderArgs) {
  // console.log({ context });
  // note this is NOT awaited
  let nonCriticalData = new Promise((res) =>
    setTimeout(() => res("non-critical"), 3_000)
  );

  let criticalData = await new Promise((res) =>
    setTimeout(() => res("critical"), 300)
  );
  return { nonCriticalData, criticalData, nrs: context.nrs_test };
}

export default function Home() {
  const { nonCriticalData, criticalData, nrs } = useLoaderData();
  return (
    <>
      <Welcome />
      <h1>NRS Test: {nrs}</h1>
      <br />
      <br />
      <h1>Welcome to Remix</h1>
      <p>
        This is a simple example of a React Router app with server-side
        rendering.
        <br />
        <p>
          {
            /* <strong>Critical Data:</strong> {criticalData}
          <br />
          <strong>Non-Critical Data:</strong> {nonCriticalData}
          <br /> */
          }
          <h1>Streaming example</h1>
          <h2>Critical data value: {criticalData}</h2>
          <br />
          <React.Suspense fallback={<div>Loading...</div>}>
            <Await resolve={nonCriticalData}>
              {(value) => <h3>Non critical value: {value}</h3>}
            </Await>
          </React.Suspense>
        </p>
      </p>
    </>
  );
}
