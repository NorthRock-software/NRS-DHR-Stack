import * as path from 'jsr:@std/path';
import * as colors from 'jsr:@std/fmt/colors';

type Mode = 'development' | 'production';

const _port = Deno.env.get('PORT');
const _mode = Deno.env.get('MODE');
if (!_port) {
	console.log(colors.yellow('No PORT environment variable set, using default port 3000'));
}
if (!_mode || _mode !== 'development' && _mode !== 'production') {
	console.log(colors.yellow('No MODE environment variable set, using default mode "development"'));
}

const PORT = Number(_port ?? 3000);
const CWD = Deno.cwd();
const MODE: Mode = _mode as Mode ?? 'development';
const IS_PROUCTION = MODE === 'production';
const IS_EXECUTABLE = Deno.build.standalone;
// const CLIENT_BUILD_PATH = path.resolve(CWD, 'build', 'client');
let CLIENT_BUILD_PATH = './build/client';
let CLIENT_ASSETS_PATH = './build/client/assets';
const EXECUTABLE_ROOT_DIR = IS_EXECUTABLE ? path.join(import.meta.dirname ?? '', '..') : undefined;
const SERVER_BUILD_PATH = path.resolve(CWD, 'build', 'server');
let BUILD = path.toFileUrl(SERVER_BUILD_PATH + '/index.js').href;
if (EXECUTABLE_ROOT_DIR) {
	// CLIENT_BUILD_PATH = path.join(EXECUTABLE_ROOT_DIR, 'build', 'client');
	// CLIENT_ASSETS_PATH = path.join(EXECUTABLE_ROOT_DIR, 'build', 'client', 'assets');
	CLIENT_BUILD_PATH = EXECUTABLE_ROOT_DIR + '/build/client';
	CLIENT_ASSETS_PATH = EXECUTABLE_ROOT_DIR + '/build/client/assets';
	BUILD = path.toFileUrl(EXECUTABLE_ROOT_DIR + '/build/server/index.js').href;
}

console.log({ IS_EXECUTABLE });
IS_EXECUTABLE && console.log({ EXECUTABLE_ROOT_DIR });

const customLogger = (message: string, ...rest: string[]) => {
	if (
		!IS_PROUCTION && (
			message.includes('/@id') || message.includes('/@vite') ||
			message.includes('/.well-known') || message.includes('/node_modules')
		)
	) {
		return;
	}
	console.log(message, ...rest); //* default logger
	// const date = Temporal.Now.plainDateISO();
	// const time = Temporal.Now.plainTimeISO().toString().slice(0, 8);
	// // const ms = Temporal.Now.instant().epochMilliseconds;
	// const formattedMessage = `${date} ${time} ${message}`;
	// const formattedRest = rest.map((item) => `${item}`);
	// const formattedRestString = formattedRest.join(" ");
	// const formattedRestStringWithBrackets = formattedRestString
	//   ? `[${formattedRestString}]`
	//   : "";
	// const formattedOutput =
	//   `${formattedMessage} ${formattedRestStringWithBrackets}`;
	// console.log(colors.cyan(formattedOutput));
};

export {
	BUILD,
	CLIENT_ASSETS_PATH,
	CLIENT_BUILD_PATH,
	customLogger,
	CWD,
	EXECUTABLE_ROOT_DIR,
	IS_EXECUTABLE,
	IS_PROUCTION,
	MODE,
	PORT,
};
