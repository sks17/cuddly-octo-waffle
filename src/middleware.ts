import { defineMiddleware } from 'astro:middleware';

/**
 * Maintenance splash.
 *
 * While this file exists, every route on the site returns the "Coming Soon"
 * page below instead of its normal content. Nothing else has been deleted or
 * changed — to restore the full site, simply delete this file (or `return next()`).
 */

const SPLASH_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Coming Soon — Saksham Singh</title>
	<meta name="description" content="This site is undergoing a large update. Coming soon." />
	<meta name="robots" content="noindex" />
	<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	<style>
		:root {
			--bg: #1a1b26;
			--text: #e3e6ee;
			--muted: #8490b5;
			--accent-1: #c561f6;
			--accent-2: #7a5fe0;
			--accent-3: #4b2bbf;
			--font-mono: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
		}

		* { box-sizing: border-box; }

		html, body { height: 100%; }

		body {
			margin: 0;
			display: grid;
			place-items: center;
			padding: 1.5rem;
			font-family: var(--font-mono);
			color: var(--text);
			background-color: var(--bg);
			background-image:
				radial-gradient(60rem 60rem at 50% -20%, rgba(122, 95, 224, 0.22), transparent 60%),
				radial-gradient(40rem 40rem at 110% 120%, rgba(197, 97, 246, 0.12), transparent 60%);
			-webkit-font-smoothing: antialiased;
		}

		.card {
			width: min(40rem, 100%);
			text-align: center;
		}

		.badge {
			display: inline-flex;
			align-items: center;
			gap: 0.55rem;
			padding: 0.4rem 0.85rem;
			margin-bottom: 2rem;
			font-size: 0.8rem;
			letter-spacing: 0.04em;
			color: var(--muted);
			border: 1px solid rgba(132, 144, 181, 0.28);
			border-radius: 999px;
			background: rgba(132, 144, 181, 0.06);
		}

		.dot {
			width: 0.5rem;
			height: 0.5rem;
			border-radius: 50%;
			background: var(--accent-1);
			box-shadow: 0 0 0.6rem var(--accent-1);
			animation: pulse 1.8s ease-in-out infinite;
		}

		h1 {
			margin: 0;
			font-size: clamp(2.5rem, 9vw, 4.5rem);
			line-height: 1.05;
			font-weight: 700;
			letter-spacing: -0.02em;
			background: linear-gradient(150deg, var(--accent-1), var(--accent-2), var(--accent-3));
			-webkit-background-clip: text;
			background-clip: text;
			color: transparent;
		}

		.prompt {
			margin: 1.75rem 0 0;
			font-size: clamp(1rem, 3.5vw, 1.45rem);
			color: var(--text);
		}

		.chev { color: var(--accent-2); margin-right: 0.5rem; }

		.cursor {
			display: inline-block;
			margin-left: 0.15rem;
			color: var(--accent-1);
			animation: blink 1.05s steps(1) infinite;
		}

		.sub {
			margin: 2.25rem 0 0;
			font-size: 0.85rem;
			color: var(--muted);
		}

		@keyframes blink { 50% { opacity: 0; } }
		@keyframes pulse {
			0%, 100% { opacity: 1; transform: scale(1); }
			50% { opacity: 0.45; transform: scale(0.85); }
		}

		@media (prefers-reduced-motion: reduce) {
			.dot, .cursor { animation: none; }
		}
	</style>
</head>
<body>
	<main class="card">
		<span class="badge"><span class="dot"></span> status: maintenance</span>
		<h1>Coming Soon!</h1>
		<p class="prompt"><span class="chev">&gt;</span>Undergoing large update<span class="cursor">_</span></p>
		<p class="sub">The site is being rebuilt. Please check back soon.</p>
	</main>
</body>
</html>`;

export const onRequest = defineMiddleware(() => {
	return new Response(SPLASH_HTML, {
		status: 200,
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'no-store',
		},
	});
});
