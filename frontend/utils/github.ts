export function githubRepoUrl(slug: string | null | undefined): string | null {
	if (!slug || typeof slug !== 'string') return null;
	const trimmed = slug.trim();
	if (!trimmed.includes('/')) return null;
	return `https://github.com/${trimmed}`;
}
