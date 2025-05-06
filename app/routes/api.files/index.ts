import type { Route } from './+types/index.ts';

interface FileSystemNode {
	name: string;
	path: string;
	type: 'file' | 'directory';
	children?: FileSystemNode[];
}

/**
 * Recursively reads directory contents up to a specified depth.
 * @param dirPath The path of the directory to read.
 * @param currentDepth The current depth level (0 for the initial directory).
 * @param maxDepth The maximum depth to traverse (e.g., 2 means root, children, and grandchildren).
 * @returns A promise resolving to an array of FileSystemNode objects.
 */
async function readDirectoryRecursive(
	dirPath: string,
	currentDepth: number,
	maxDepth: number,
): Promise<FileSystemNode[]> {
	const entries: FileSystemNode[] = [];

	// Stop recursion if the current depth exceeds the maximum depth
	if (currentDepth > maxDepth) {
		return entries;
	}

	try {
		for await (const dirEntry of Deno.readDir(dirPath)) {
			// Skip common hidden/system files/dirs if desired (optional)
			// if (dirEntry.name.startsWith('.')) continue;

			const entryPath = `${dirPath}${Deno.build.os === 'windows' ? '\\' : '/'}${dirEntry.name}`;
			const node: FileSystemNode = {
				name: dirEntry.name,
				path: entryPath,
				type: dirEntry.isDirectory ? 'directory' : 'file',
			};

			if (dirEntry.isDirectory) {
				// If it's a directory and we haven't reached the max depth yet,
				// recursively read its contents.
				if (currentDepth < maxDepth) {
					node.children = await readDirectoryRecursive(
						entryPath,
						currentDepth + 1,
						maxDepth,
					);
				} else {
					// If at max depth, mark as directory but don't add children
					node.children = [];
				}
			}
			entries.push(node);
		}
	} catch (error) {
		// Log errors (e.g., permission denied) but continue processing other entries
		console.error(`Error reading directory ${dirPath}:`, error.message);
		// You could optionally add error info to the response structure if needed
	}

	// Sort entries alphabetically, directories first
	entries.sort((a, b) => {
		if (a.type === b.type) {
			return a.name.localeCompare(b.name);
		}
		return a.type === 'directory' ? -1 : 1;
	});

	return entries;
}

export async function loader({ context }: Route.LoaderArgs) {
	const rootPath = '.'; // Start from the current working directory
	const maxDepth = 2; // Read root (depth 0), children (depth 1), and grandchildren (depth 2)

	try {
		// Get details for the root directory itself
		// Using Deno.realPath to get an absolute path might be more robust if needed
		const resolvedRootPath = await Deno.realPath(rootPath);
		const rootName = rootPath === '.' ? resolvedRootPath.split(/[\\/]/).pop() ?? '.' : rootPath;

		const rootNode: FileSystemNode = {
			name: rootName, // Use resolved name or '.'
			path: resolvedRootPath, // Use resolved path
			type: 'directory',
			// Start reading children from depth 1 up to maxDepth
			children: await readDirectoryRecursive(resolvedRootPath, 1, maxDepth),
		};

		return new Response(
			JSON.stringify(rootNode, null, 2), // Pretty-print the JSON output
			{
				headers: {
					'Content-Type': 'application/json',
				},
				status: 200,
			},
		);
	} catch (error) {
		console.error('Failed to build file tree:', error);
		return new Response(
			JSON.stringify({
				error: 'Failed to read directory structure',
				details: error.message,
			}),
			{
				headers: {
					'Content-Type': 'application/json',
				},
				status: 500,
			},
		);
	}
}
